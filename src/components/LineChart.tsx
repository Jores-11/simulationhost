"use client";

import { useState, useEffect } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, Edit } from "lucide-react";
import { linearRegression } from "../utils/predict";
import { toast } from "react-toastify";

interface DataPoint {
  month: string;
  value: number;
  scenario?: string;
}

interface LineChartProps {
  data: DataPoint[];
  dataKey: string;
  stroke: string;
  fill: string;
  title: string;
  highlight?: string;
  predictionData?: DataPoint[];
  onAddAnnotation?: (month: string, note: string) => void;
  annotations?: { month: string; note: string }[];
  theme: "black" | "white";
}

export default function LineChart({
  data,
  dataKey,
  stroke,
  fill,
  title,
  highlight,
  predictionData = [],
  onAddAnnotation,
  annotations = [],
  theme,
}: LineChartProps) {
  const [chartData, setChartData] = useState<DataPoint[]>(data);
  const [predData, setPredData] = useState<DataPoint[]>(predictionData);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [annotationMonth, setAnnotationMonth] = useState("");
  const [annotationNote, setAnnotationNote] = useState("");
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);

  useEffect(() => {
    setChartData(data);
    setPredData(predictionData);
  }, [data, predictionData]);

  const combinedData = [...chartData, ...predData];

  const exportToCSV = () => {
    const csvContent = [
      ["Month", title],
      ...combinedData.map((item) => [item.month, item.value]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}_Data.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${title} data exported as CSV!`);
  };

  const handleMouseDown = (e: any) => {
    const lastDataPoint = chartData[chartData.length - 1];
    if (e.activeLabel === lastDataPoint.month) {
      setIsDragging(true);
      setDragStart({ x: e.chartX, y: e.chartY });
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDragging || !dragStart) return;

    const yValue = e.tooltipPayload?.[0]?.value || chartData[chartData.length - 1].value;
    const newValue = yValue - (e.chartY - dragStart.y) * (title.includes("Spend") ? 100 : 0.01);

    const updatedData = [...chartData];
    updatedData[chartData.length - 1] = {
      ...updatedData[chartData.length - 1],
      value: Math.max(0, Number(newValue.toFixed(title.includes("Spend") ? 0 : 2))),
    };

    const newPrediction = recalculatePrediction(updatedData);
    setChartData(updatedData);
    setPredData(newPrediction);
    setDragStart({ x: e.chartX, y: e.chartY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
    toast.info(`${title} updated!`);
  };

  const recalculatePrediction = (data: DataPoint[]) => {
    const n = data.length;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumXX = 0;

    data.forEach((point, index) => {
      sumX += index;
      sumY += point.value;
      sumXY += index * point.value;
      sumXX += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const predictions: DataPoint[] = [];
    const months = ["Jul '25", "Aug '25", "Sep '25"];
    for (let i = 0; i < 3; i++) {
      const x = n + i;
      const predictedValue = slope * x + intercept;
      predictions.push({ month: months[i], value: Number(predictedValue.toFixed(title.includes("Spend") ? 0 : 2)) });
    }

    return predictions;
  };

  const resetChart = () => {
    setChartData(data);
    setPredData(predictionData);
    toast.success(`${title} reset successfully!`);
  };

  const handleAddAnnotation = () => {
    if (annotationMonth && annotationNote && onAddAnnotation) {
      onAddAnnotation(annotationMonth, annotationNote);
      setAnnotationMonth("");
      setAnnotationNote("");
      setShowAnnotationForm(false);
    }
  };

  return (
    <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${theme === "black" ? "bg-gray-800" : "bg-gray-200"}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className={`text-lg font-semibold ${theme === "black" ? "text-gray-200" : "text-gray-800"}`}>
            {title}{" "}
            {highlight && (
              <span
                className={`${
                  highlight.includes("▲") ? "text-blue-400" : "text-red-400"
                } text-sm`}
              >
                {highlight}
              </span>
            )}
            <span className={`text-sm ${theme === "black" ? "text-gray-400" : "text-gray-600"} ml-2`}>NOV '24</span>
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className={`p-2 rounded-full ${theme === "black" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"} transition-colors duration-200`}
          >
            <Download size={16} className={theme === "black" ? "text-gray-300" : "text-gray-700"} />
          </button>
          <button
            onClick={resetChart}
            className={`p-2 rounded-full ${theme === "black" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"} transition-colors duration-200`}
          >
            Reset
          </button>
          <button
            onClick={() => setShowAnnotationForm(!showAnnotationForm)}
            className={`p-2 rounded-full ${theme === "black" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-300 hover:bg-gray-400"} transition-colors duration-200`}
          >
            <Edit size={16} className={theme === "black" ? "text-gray-300" : "text-gray-700"} />
          </button>
        </div>
      </div>

      {showAnnotationForm && (
        <div className={`mb-4 p-4 rounded-lg ${theme === "black" ? "bg-gray-700" : "bg-gray-300"}`}>
          <h3 className="text-sm font-semibold mb-2">Add Annotation</h3>
          <div className="flex gap-2">
            <select
              value={annotationMonth}
              onChange={(e) => setAnnotationMonth(e.target.value)}
              className={`px-2 py-1 rounded-lg border ${theme === "black" ? "bg-gray-800 border-gray-600" : "bg-gray-200 border-gray-400"}`}
            >
              <option value="">Select Month</option>
              {data.map((d) => (
                <option key={d.month} value={d.month}>{d.month}</option>
              ))}
            </select>
            <input
              type="text"
              value={annotationNote}
              onChange={(e) => setAnnotationNote(e.target.value)}
              placeholder="Add a note"
              className={`px-2 py-1 rounded-lg border ${theme === "black" ? "bg-gray-800 border-gray-600" : "bg-gray-200 border-gray-400"}`}
            />
            <button
              onClick={handleAddAnnotation}
              className="px-4 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={200}>
        <RechartsLineChart
          data={combinedData}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={theme === "black" ? "#4b5563" : "#d1d5db"} />
          <XAxis dataKey="month" stroke={theme === "black" ? "#9ca3af" : "#4b5563"} />
          <YAxis stroke={theme === "black" ? "#9ca3af" : "#4b5563"} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const annotation = annotations.find((a) => a.month === label);
                return (
                  <div className={`p-2 rounded-lg shadow-lg border ${theme === "black" ? "bg-gray-800 border-gray-600" : "bg-gray-200 border-gray-400"}`}>
                    <p className="text-sm font-semibold">{label}</p>
                    {payload.map((entry, index) => (
                      <p key={index} className="text-sm">
                        {entry.name}: {entry.value}
                      </p>
                    ))}
                    {annotation && (
                      <p className={`text-sm ${theme === "black" ? "text-gray-400" : "text-gray-600"} mt-1`}>Note: {annotation.note}</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            strokeWidth={2}
            filter="url(#shadow)"
            activeDot={{ r: 8, fill: stroke, stroke: "#fff", strokeWidth: 2 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}