"use client";

import { useState, useEffect } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Download, Edit, Plus } from "lucide-react";
import { motion } from "framer-motion";
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
  const [draggedValue, setDraggedValue] = useState<number | null>(null);
  const [annotationMonth, setAnnotationMonth] = useState("");
  const [annotationNote, setAnnotationNote] = useState("");
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);

  useEffect(() => {
    setChartData(data);
    const extendedPredData = extendPredictionData(data, predictionData);
    setPredData(extendedPredData);
  }, [data, predictionData]);

  const extendPredictionData = (historicalData: DataPoint[], pred: DataPoint[]) => {
    const totalMonths = 12; // Ensure the chart spans 12 months to reach the end
    const historicalMonths = historicalData.length;
    const existingPredMonths = pred.length;
    const remainingMonths = totalMonths - historicalMonths;

    if (remainingMonths <= existingPredMonths) {
      return pred.slice(0, remainingMonths);
    }

    const extendedPred = [...pred];
    const lastPredValue = pred.length > 0 ? pred[pred.length - 1].value : historicalData[historicalData.length - 1].value;
    const months = [
      "Jul '25", "Aug '25", "Sep '25", "Oct '25", "Nov '25", "Dec '25",
      "Jan '26", "Feb '26", "Mar '26", "Apr '26", "May '26", "Jun '26"
    ];

    for (let i = existingPredMonths; i < remainingMonths; i++) {
      extendedPred.push({
        month: months[i],
        value: lastPredValue, // Extend with the last predicted value
      });
    }

    return extendedPred;
  };

  const combinedData = [...chartData, ...predData];

  const formatValue = (value: number) => {
    if (title.toLowerCase().includes("runway")) {
      return `${value.toFixed(1)}`;
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(3)}M`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

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
      setDraggedValue(lastDataPoint.value);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDragging || !dragStart) return;

    const yValue = e.tooltipPayload?.[0]?.value || chartData[chartData.length - 1].value;
    const newValue = yValue - (e.chartY - dragStart.y) * (title.includes("Spend") ? 100 : 0.01);

    const updatedData = [...chartData];
    const adjustedValue = Math.max(0, Number(newValue.toFixed(title.includes("Spend") ? 0 : 2)));
    updatedData[chartData.length - 1] = {
      ...updatedData[chartData.length - 1],
      value: adjustedValue,
    };

    setDraggedValue(adjustedValue);
    const newPrediction = recalculatePrediction(updatedData);
    setChartData(updatedData);
    setPredData(newPrediction);
    setDragStart({ x: e.chartX, y: e.chartY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
    setDraggedValue(null);
    toast.info(`${title} updated!`);
  };

  const recalculatePrediction = (data: DataPoint[]) => {
    // Polynomial regression (degree 2) for more advanced prediction
    const n = data.length;
    const x = data.map((_, index) => index);
    const y = data.map((point) => point.value);

    let sumX = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0, sumY = 0, sumXY = 0, sumX2Y = 0;

    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumX2 += x[i] * x[i];
      sumX3 += x[i] * x[i] * x[i];
      sumX4 += x[i] * x[i] * x[i] * x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumX2Y += x[i] * x[i] * y[i];
    }

    const denom = n * sumX2 * sumX4 + 2 * sumX * sumX2 * sumX3 - sumX2 * sumX2 * sumX2 - n * sumX3 * sumX3 - sumX * sumX * sumX4;

    const a = (sumX2 * (sumX2 * sumY - sumX * sumXY) + sumX * (sumX3 * sumXY - sumX2 * sumX2Y) + sumX4 * (n * sumXY - sumX * sumY)) / denom;
    const b = (sumX4 * (n * sumXY - sumX * sumY) + sumX2 * (sumX * sumX2Y - sumX3 * sumY) + sumX2 * (sumX2 * sumX - n * sumX3)) / denom;
    const c = (sumX2 * (sumX2 * sumX2Y - sumX3 * sumXY) + sumX * (n * sumX4 * sumXY - sumX3 * sumX2Y) + sumY * (sumX3 * sumX3 - sumX2 * sumX4)) / denom;

    const totalMonths = 12 - data.length; // Extend to the end of the chart
    const predictions: DataPoint[] = [];
    const months = [
      "Jul '25", "Aug '25", "Sep '25", "Oct '25", "Nov '25", "Dec '25",
      "Jan '26", "Feb '26", "Mar '26", "Apr '26", "May '26", "Jun '26"
    ];

    for (let i = 0; i < totalMonths; i++) {
      const x = n + i;
      const predictedValue = a + b * x + c * x * x;
      predictions.push({
        month: months[i],
        value: Number(predictedValue.toFixed(title.includes("Spend") ? 0 : 2)),
      });
    }

    return predictions;
  };

  const resetChart = () => {
    setChartData(data);
    setPredData(extendPredictionData(data, predictionData));
  };

  const handleAddAnnotation = () => {
    if (annotationMonth && annotationNote && onAddAnnotation) {
      onAddAnnotation(annotationMonth, annotationNote);
      setAnnotationMonth("");
      setAnnotationNote("");
      setShowAnnotationForm(false);
    }
  };

  const handleAddDriver = () => {
    // No notification for this action
  };

  // Animation variants
  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const buttonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  const dotVariants = {
    idle: { scale: 1, opacity: 1 },
    dragging: {
      scale: 1.5,
      opacity: 0.8,
      boxShadow: `0 0 10px ${stroke}`,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${
        theme === "black" ? "bg-gray-800" : "bg-white"
      }`}
      initial="hidden"
      animate="visible"
      variants={chartVariants}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2
            className={`text-lg font-semibold ${
              theme === "black" ? "text-gray-200" : "text-gray-800"
            }`}
          >
            {title}
          </h2>
          <span
            className={`text-sm font-bold ${
              theme === "black" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {formatValue(chartData[chartData.length - 1]?.value || 0)}
            {predData.length > 0 && (
              <span className="text-xs text-blue-400 ml-1">
                / {formatValue(predData[predData.length - 1]?.value || 0)}
              </span>
            )}
          </span>
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={exportToCSV}
            className={`p-2 rounded-full ${
              theme === "black"
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            } transition-colors duration-200`}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Download
              size={16}
              className={theme === "black" ? "text-gray-300" : "text-gray-700"}
            />
          </motion.button>
          <motion.button
            onClick={resetChart}
            className={`p-2 rounded-full ${
              theme === "black"
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            } transition-colors duration-200`}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <span
              className={`text-sm ${
                theme === "black" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Reset
            </span>
          </motion.button>
          <motion.button
            onClick={() => setShowAnnotationForm(!showAnnotationForm)}
            className={`p-2 rounded-full ${
              theme === "black"
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            } transition-colors duration-200`}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Edit
              size={16}
              className={theme === "black" ? "text-gray-300" : "text-gray-700"}
            />
          </motion.button>
          <motion.button
            onClick={handleAddDriver}
            className={`p-2 rounded-full flex items-center gap-1 ${
              theme === "black"
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            } transition-colors duration-200`}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Plus
              size={16}
              className={theme === "black" ? "text-gray-300" : "text-gray-700"}
            />
            <span
              className={`text-sm ${
                theme === "black" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Add Driver
            </span>
          </motion.button>
        </div>
      </div>

      {showAnnotationForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`mb-4 p-4 rounded-lg ${
            theme === "black" ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          <h3
            className={`text-sm font-semibold mb-2 ${
              theme === "black" ? "text-gray-200" : "text-gray-800"
            }`}
          >
            Add Annotation
          </h3>
          <div className="flex gap-2">
            <select
              value={annotationMonth}
              onChange={(e) => setAnnotationMonth(e.target.value)}
              className={`px-2 py-1 rounded-lg border text-sm ${
                theme === "black"
                  ? "bg-gray-800 border-gray-600 text-gray-200"
                  : "bg-gray-200 border-gray-400 text-gray-800"
              }`}
            >
              <option value="">Select Month</option>
              {data.map((d) => (
                <option key={d.month} value={d.month}>
                  {d.month}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={annotationNote}
              onChange={(e) => setAnnotationNote(e.target.value)}
              placeholder="Add a note"
              className={`px-2 py-1 rounded-lg border text-sm flex-1 ${
                theme === "black"
                  ? "bg-gray-800 border-gray-600 text-gray-200"
                  : "bg-gray-200 border-gray-400 text-gray-800"
              }`}
            />
            <button
              onClick={handleAddAnnotation}
              className="px-4 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
            >
              Add
            </button>
          </div>
        </motion.div>
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
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fill} stopOpacity={0.3} />
              <stop offset="95%" stopColor={fill} stopOpacity={0} />
            </linearGradient>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="8" />
              <feOffset dx="0" dy="6" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.7" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme === "black" ? "#4b5563" : "#e5e7eb"}
          />
          <XAxis
            dataKey="month"
            stroke={theme === "black" ? "#9ca3af" : "#6b7280"}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke={theme === "black" ? "#9ca3af" : "#6b7280"}
            tickFormatter={formatValue}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const annotation = annotations.find((a) => a.month === label);
                return (
                  <div
                    className={`p-2 rounded-lg shadow-lg border relative ${
                      theme === "black"
                        ? "bg-gray-800 border-gray-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        theme === "black" ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {label}
                    </p>
                    {payload.map((entry, index) => (
                      <p
                        key={index}
                        className={`text-sm ${
                          theme === "black" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {entry.name}: {formatValue(entry.value as number)}
                      </p>
                    ))}
                    {annotation && (
                      <p
                        className={`text-sm ${
                          theme === "black" ? "text-gray-400" : "text-gray-600"
                        } mt-1`}
                      >
                        Note: {annotation.note}
                      </p>
                    )}
                    {isDragging && draggedValue !== null && label === chartData[chartData.length - 1].month && (
                      <div
                        className={`absolute top-0 left-0 transform -translate-y-full p-2 rounded-lg ${
                          theme === "black"
                            ? "bg-gray-800 border-gray-600 text-gray-200"
                            : "bg-white border-gray-200 text-gray-800"
                        } border shadow-lg`}
                      >
                        {formatValue(draggedValue)}
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            data={chartData}
            stroke={stroke}
            strokeWidth={2}
            fill="url(#lineGradient)"
            filter="url(#shadow)"
            dot={false}
            activeDot={
              isDragging
                ? {
                    r: 8,
                    fill: stroke,
                    stroke: "#fff",
                    strokeWidth: 2,
                    as: motion.circle,
                    variants: dotVariants,
                    animate: "dragging",
                  }
                : { r: 6, fill: stroke, stroke: "#fff", strokeWidth: 2 }
            }
            animationDuration={1500}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            data={predData}
            stroke={stroke}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={false}
            animationDuration={1500}
            filter="url(#shadow)"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}