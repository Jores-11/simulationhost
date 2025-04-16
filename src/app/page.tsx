"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import LineChart from "../components/LineChart";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from "recharts";
import { Calendar, Sun, Moon } from "lucide-react";
import { linearRegression } from "../utils/predict";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Types for data
interface DataPoint {
  month: string;
  value: number;
  scenario?: string;
}

interface StrategyData {
  category: string;
  lastClose: number;
  jun24: number[];
}

interface BusinessCanvasData {
  category: string;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
}

export default function Home() {
  const [viewMode, setViewMode] = useState<"single" | "grid">("single");
  const [isMarketingOpen, setIsMarketingOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "Jul '24",
    end: "Jun '25",
  });
  const [startDate, setStartDate] = useState<Date | null>(new Date("2024-07-01"));
  const [endDate, setEndDate] = useState<Date | null>(new Date("2025-06-30"));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [theme, setTheme] = useState<"black" | "white">("black");
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Dropdown states for each graph
  const [burnMetric, setBurnMetric] = useState("Default");
  const [cashMetric, setCashMetric] = useState("Default");
  const [runwayMetric, setRunwayMetric] = useState("Default");
  const [arrMetric, setArrMetric] = useState("Sales Conversion");

  // Dropdown visibility states
  const [showBurnDropdown, setShowBurnDropdown] = useState(false);
  const [showCashDropdown, setShowCashDropdown] = useState(false);
  const [showRunwayDropdown, setShowRunwayDropdown] = useState(false);
  const [showArrDropdown, setShowArrDropdown] = useState(false);

  // State for annotations
  const [annotations, setAnnotations] = useState<{ month: string; note: string }[]>([]);

  // State for Model Inputs dropdown
  const [selectedInputView, setSelectedInputView] = useState<"View Spreadsheet" | "Business Canvas">("View Spreadsheet");

  // Data
  const marketingSpendData: DataPoint[] = [
    { month: "Jul '24", value: 814159 },
    { month: "Aug '24", value: 825795 },
    { month: "Sep '24", value: 836274 },
    { month: "Oct '24", value: 846582 },
    { month: "Nov '24", value: 856705 },
    { month: "Dec '24", value: 866638 },
    { month: "Jan '25", value: 876378 },
    { month: "Feb '25", value: 886920 },
    { month: "Mar '25", value: 896266 },
    { month: "Apr '25", value: 905418 },
    { month: "May '25", value: 914378 },
    { month: "Jun '25", value: 923148 },
  ];

  const burnData: { [key: string]: DataPoint[] } = {
    Default: [
      { month: "Jul '24", value: 2.31 },
      { month: "Aug '24", value: 2.28 },
      { month: "Sep '24", value: 2.25 },
      { month: "Oct '24", value: 2.22 },
      { month: "Nov '24", value: 2.31 },
      { month: "Dec '24", value: 2.35 },
      { month: "Jan '25", value: 2.38 },
      { month: "Feb '25", value: 2.40 },
      { month: "Mar '25", value: 2.42 },
      { month: "Apr '25", value: 2.43 },
      { month: "May '25", value: 2.44 },
      { month: "Jun '25", value: 2.45 },
    ],
    Adjusted: [
      { month: "Jul '24", value: 2.41 },
      { month: "Aug '24", value: 2.38 },
      { month: "Sep '24", value: 2.35 },
      { month: "Oct '24", value: 2.32 },
      { month: "Nov '24", value: 2.41 },
      { month: "Dec '24", value: 2.45 },
      { month: "Jan '25", value: 2.48 },
      { month: "Feb '25", value: 2.50 },
      { month: "Mar '25", value: 2.52 },
      { month: "Apr '25", value: 2.53 },
      { month: "May '25", value: 2.54 },
      { month: "Jun '25", value: 2.55 },
    ],
  };

  const cashData: { [key: string]: DataPoint[] } = {
    Default: [
      { month: "Jul '24", value: 5.0 },
      { month: "Aug '24", value: 4.8 },
      { month: "Sep '24", value: 4.6 },
      { month: "Oct '24", value: 4.4 },
      { month: "Nov '24", value: 4.2 },
      { month: "Dec '24", value: 4.0 },
      { month: "Jan '25", value: 3.8 },
      { month: "Feb '25", value: 3.6 },
      { month: "Mar '25", value: 3.4 },
      { month: "Apr '25", value: 3.2 },
      { month: "May '25", value: 3.0 },
      { month: "Jun '25", value: 2.8 },
    ],
    Adjusted: [
      { month: "Jul '24", value: 5.2 },
      { month: "Aug '24", value: 5.0 },
      { month: "Sep '24", value: 4.8 },
      { month: "Oct '24", value: 4.6 },
      { month: "Nov '24", value: 4.4 },
      { month: "Dec '24", value: 4.2 },
      { month: "Jan '25", value: 4.0 },
      { month: "Feb '25", value: 3.8 },
      { month: "Mar '25", value: 3.6 },
      { month: "Apr '25", value: 3.4 },
      { month: "May '25", value: 3.2 },
      { month: "Jun '25", value: 3.0 },
    ],
  };

  const runwayData: { [key: string]: DataPoint[] } = {
    Default: [
      { month: "Jul '24", value: 2.0 },
      { month: "Aug '24", value: 1.9 },
      { month: "Sep '24", value: 1.8 },
      { month: "Oct '24", value: 1.7 },
      { month: "Nov '24", value: 1.6 },
      { month: "Dec '24", value: 1.5 },
      { month: "Jan '25", value: 1.6 },
      { month: "Feb '25", value: 1.7 },
      { month: "Mar '25", value: 1.8 },
      { month: "Apr '25", value: 1.9 },
      { month: "May '25", value: 2.0 },
      { month: "Jun '25", value: 2.1 },
    ],
    Adjusted: [
      { month: "Jul '24", value: 2.2 },
      { month: "Aug '24", value: 2.1 },
      { month: "Sep '24", value: 2.0 },
      { month: "Oct '24", value: 1.9 },
      { month: "Nov '24", value: 1.8 },
      { month: "Dec '24", value: 1.7 },
      { month: "Jan '25", value: 1.8 },
      { month: "Feb '25", value: 1.9 },
      { month: "Mar '25", value: 2.0 },
      { month: "Apr '25", value: 2.1 },
      { month: "May '25", value: 2.2 },
      { month: "Jun '25", value: 2.3 },
    ],
  };

  const arrData: { [key: string]: DataPoint[] } = {
    "Sales Conversion": [
      { month: "Jul '24", value: 3.2 },
      { month: "Aug '24", value: 3.3 },
      { month: "Sep '24", value: 3.4 },
      { month: "Oct '24", value: 3.5 },
      { month: "Nov '24", value: 3.6 },
      { month: "Dec '24", value: 3.7 },
      { month: "Jan '25", value: 3.8 },
      { month: "Feb '25", value: 3.9 },
      { month: "Mar '25", value: 4.0 },
      { month: "Apr '25", value: 4.1 },
      { month: "May '25", value: 4.2 },
      { month: "Jun '25", value: 4.3 },
    ],
    Marketing: [
      { month: "Jul '24", value: 814159 },
      { month: "Aug '24", value: 825795 },
      { month: "Sep '24", value: 836274 },
      { month: "Oct '24", value: 846582 },
      { month: "Nov '24", value: 856705 },
      { month: "Dec '24", value: 866638 },
      { month: "Jan '25", value: 876378 },
      { month: "Feb '25", value: 886920 },
      { month: "Mar '25", value: 896266 },
      { month: "Apr '25", value: 905418 },
      { month: "May '25", value: 914378 },
      { month: "Jun '25", value: 923148 },
    ],
  };

  const strategyData: StrategyData[] = [
    { category: "New Campaign", lastClose: 312, jun24: Array(9).fill(312) },
    { category: "New Ad Creative", lastClose: 312, jun24: Array(9).fill(312) },
    { category: "Affiliate Program", lastClose: 312, jun24: Array(9).fill(312) },
    { category: "Marketing Copy", lastClose: 312, jun24: Array(9).fill(312) },
  ];

  const businessCanvasData: BusinessCanvasData[] = [
    { category: "Customer Segments", jul: 500, aug: 510, sep: 520, oct: 530, nov: 540, dec: 550, jan: 560, feb: 570, mar: 580, apr: 590 },
    { category: "Value Proposition", jul: 600, aug: 610, sep: 620, oct: 630, nov: 640, dec: 650, jan: 660, feb: 670, mar: 680, apr: 690 },
    { category: "Channels", jul: 700, aug: 710, sep: 720, oct: 730, nov: 740, dec: 750, jan: 760, feb: 770, mar: 780, apr: 790 },
    { category: "Customer Relationships", jul: 800, aug: 810, sep: 820, oct: 830, nov: 840, dec: 850, jan: 860, feb: 870, mar: 880, apr: 890 },
    { category: "Revenue Streams", jul: 900, aug: 910, sep: 920, oct: 930, nov: 940, dec: 950, jan: 960, feb: 970, mar: 980, apr: 990 },
    { category: "Key Resources", jul: 1000, aug: 1010, sep: 1020, oct: 1030, nov: 1040, dec: 1050, jan: 1060, feb: 1070, mar: 1080, apr: 1090 },
    { category: "Key Activities", jul: 1100, aug: 1110, sep: 1120, oct: 1130, nov: 1140, dec: 1150, jan: 1160, feb: 1170, mar: 1180, apr: 1190 },
    { category: "Key Partnerships", jul: 1200, aug: 1210, sep: 1220, oct: 1230, nov: 1240, dec: 1250, jan: 1260, feb: 1270, mar: 1280, apr: 1290 },
    { category: "Cost Structure", jul: 1300, aug: 1310, sep: 1320, oct: 1330, nov: 1340, dec: 1350, jan: 1360, feb: 1370, mar: 1380, apr: 1390 },
  ];

  // Filter data based on date range
  const filterDataByDate = (data: DataPoint[]) => {
    const months = marketingSpendData.map((d) => d.month);
    const startIndex = months.indexOf(dateRange.start);
    const endIndex = months.indexOf(dateRange.end);
    if (startIndex === -1 || endIndex === -1) {
      return data;
    }
    return data.filter((_, index) => index >= startIndex && index <= endIndex);
  };

  const [marketingSpendChartData, setMarketingSpendChartData] = useState<DataPoint[]>(marketingSpendData.slice(0, 10));
  const [marketingSpendPredData, setMarketingSpendPredData] = useState<DataPoint[]>(
    linearRegression(marketingSpendData.slice(0, 10)).predictions.slice(0, 2)
  );
  const [isDraggingMarketingSpend, setIsDraggingMarketingSpend] = useState(false);
  const [dragStartMarketingSpend, setDragStartMarketingSpend] = useState<{ x: number; y: number } | null>(null);

  const burnFiltered = filterDataByDate(burnData[burnMetric]);
  const cashFiltered = filterDataByDate(cashData[cashMetric]);
  const runwayFiltered = filterDataByDate(runwayData[runwayMetric]);
  const arrFiltered = filterDataByDate(arrData[arrMetric]);
  const marketingSpendFiltered = filterDataByDate(marketingSpendChartData);

  const burnPrediction = linearRegression(burnFiltered);
  const cashPrediction = linearRegression(cashFiltered);
  const runwayPrediction = linearRegression(runwayFiltered);
  const arrPrediction = linearRegression(arrFiltered);
  const marketingSpendPrediction = linearRegression(marketingSpendFiltered);

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);
    return `${month} '${year}`;
  };

  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      setLoading(true);
      setTimeout(() => {
        setDateRange({ start: formatDate(start), end: formatDate(end) });
        setMarketingSpendChartData(filterDataByDate(marketingSpendData).slice(0, 10));
        setMarketingSpendPredData(linearRegression(filterDataByDate(marketingSpendData).slice(0, 10)).predictions.slice(0, 2));
        setShowDatePicker(false);
        setLoading(false);
        toast.success("Date range updated successfully!");
      }, 500);
    }
  };

  const handleMouseDownMarketingSpend = (e: any) => {
    const lastDataPoint = marketingSpendChartData[marketingSpendChartData.length - 1];
    if (e.activeLabel === lastDataPoint.month) {
      setIsDraggingMarketingSpend(true);
      setDragStartMarketingSpend({ x: e.chartX, y: e.chartY });
    }
  };

  const handleMouseMoveMarketingSpend = (e: any) => {
    if (!isDraggingMarketingSpend || !dragStartMarketingSpend) return;

    const yValue = e.tooltipPayload?.[0]?.value || marketingSpendChartData[marketingSpendChartData.length - 1].value;
    const newValue = yValue - (e.chartY - dragStartMarketingSpend.y) * 100;

    const updatedData = [...marketingSpendChartData];
    updatedData[marketingSpendChartData.length - 1] = {
      ...updatedData[marketingSpendChartData.length - 1],
      value: Math.max(0, Number(newValue.toFixed(0))),
    };

    const newPrediction = recalculatePrediction(updatedData);
    setMarketingSpendChartData(updatedData);
    setMarketingSpendPredData(newPrediction);
    setDragStartMarketingSpend({ x: e.chartX, y: e.chartY });
  };

  const handleMouseUpMarketingSpend = () => {
    setIsDraggingMarketingSpend(false);
    setDragStartMarketingSpend(null);
    toast.info("Marketing Spend updated!");
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
    const months = ["May '25", "Jun '25"];
    for (let i = 0; i < 2; i++) {
      const x = n + i;
      const predictedValue = slope * x + intercept;
      predictions.push({ month: months[i], value: Number(predictedValue.toFixed(0)) });
    }

    return predictions;
  };

  const resetChartData = () => {
    setLoading(true);
    setTimeout(() => {
      setMarketingSpendChartData(filterDataByDate(marketingSpendData).slice(0, 10));
      setMarketingSpendPredData(linearRegression(filterDataByDate(marketingSpendData).slice(0, 10)).predictions.slice(0, 2));
      setLoading(false);
      toast.success("Chart data reset successfully!");
    }, 500);
  };

  const addAnnotation = (month: string, note: string) => {
    setAnnotations([...annotations, { month, note }]);
    toast.success("Annotation added!");
  };

  const downloadPDF = async () => {
    if (!dashboardRef.current) return;

    setLoading(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("OptimScale_Dashboard.pdf");
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "black" ? "white" : "black";
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}!`);
  };

  return (
    <div
      ref={dashboardRef}
      className={`min-h-screen transition-colors duration-300 ${theme === "black" ? "bg-gray-900 text-white" : "bg-white text-black"}`}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      )}

      {/* Centered Navigation Links */}
      <div className="flex justify-center gap-8 py-6">
        <a href="#" className="text-lg font-semibold hover:border-b-2 hover:border-blue-500 transition-all duration-200">
          Scenario
        </a>
        <a href="#" className="text-lg font-semibold hover:border-b-2 hover:border-blue-500 transition-all duration-200">
          Plan
        </a>
        <a href="#" className="text-lg font-semibold hover:border-b-2 hover:border-blue-500 transition-all duration-200">
          State
        </a>
        <a href="#" className="text-lg font-semibold hover:border-b-2 hover:border-blue-500 transition-all duration-200">
          Financial Statement
        </a>
      </div>

      {/* Main Dashboard */}
      <main className="p-8">
        {/* Controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2 ${
                theme === "black" ? "bg-gray-800 text-gray-200 border-gray-600" : "bg-gray-200 text-gray-800 border-gray-400"
              }`}
            >
              <Calendar size={20} />
              {`${dateRange.start} - ${dateRange.end}`}
            </button>
            {showDatePicker && (
              <div className="absolute z-10 mt-2">
                <DatePicker
                  selected={startDate}
                  onChange={handleDateRangeChange}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  inline
                  className={`${theme === "black" ? "bg-gray-800 text-white" : "bg-white text-black"}`}
                />
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode("single")}
              className={`px-4 py-2 rounded-lg ${
                viewMode === "single"
                  ? "bg-blue-600 text-white"
                  : theme === "black"
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-300 text-gray-800"
              } hover:bg-blue-500 hover:text-white transition-colors shadow-sm`}
            >
              Single
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : theme === "black"
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-300 text-gray-800"
              } hover:bg-blue-500 hover:text-white transition-colors shadow-sm`}
            >
              Grid
            </button>
            <button
              onClick={downloadPDF}
              className={`px-4 py-2 rounded-lg ${
                theme === "black" ? "bg-gray-700 text-gray-200" : "bg-gray-300 text-gray-800"
              } hover:bg-blue-500 hover:text-white transition-colors shadow-sm`}
            >
              Download PDF
            </button>
            <button
              onClick={toggleTheme}
              className={`px-4 py-2 rounded-lg ${
                theme === "black" ? "bg-gray-700 text-gray-200" : "bg-gray-300 text-gray-800"
              } hover:bg-blue-500 hover:text-white transition-colors shadow-sm`}
            >
              {theme === "black" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* Main Charts */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Impact of Increasing Marketing Spend by 10% Changing</h2>
          <div className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "flex flex-col gap-6"}`}>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">Burn</h3>
                <button onClick={() => setShowBurnDropdown(!showBurnDropdown)}>
                  <span className={`inline-block w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-400 hover:border-t-gray-200 transform ${showBurnDropdown ? "rotate-180" : ""}`}></span>
                </button>
                {showBurnDropdown && (
                  <div
                    className={`absolute z-10 mt-8 rounded-lg shadow-lg ${
                      theme === "black" ? "bg-gray-800 text-gray-200" : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <ul className="py-2">
                      <li
                        className={`px-4 py-2 hover:bg-gray-600 cursor-pointer`}
                        onClick={() => {
                          setShowBurnDropdown(false);
                          toast.info("Selected Option 1 for Burn");
                        }}
                      >
                        Option 1
                      </li>
                      <li
                        className={`px-4 py-2 hover:bg-gray-600 cursor-pointer`}
                        onClick={() => {
                          setShowBurnDropdown(false);
                          toast.info("Selected Option 2 for Burn");
                        }}
                      >
                        Option 2
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <LineChart
                data={burnFiltered}
                predictionData={burnPrediction.predictions}
                dataKey="value"
                stroke="#3B82F6"
                fill="#3B82F6"
                title="Burn"
                highlight="▲ $2.31B"
                onAddAnnotation={addAnnotation}
                annotations={annotations}
                metric={burnMetric}
                setMetric={setBurnMetric}
                theme={theme}
              />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">Cash</h3>
                <button onClick={() => setShowCashDropdown(!showCashDropdown)}>
                  <span className={`inline-block w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-400 hover:border-t-gray-200 transform ${showCashDropdown ? "rotate-180" : ""}`}></span>
                </button>
                {showCashDropdown && (
                  <div
                    className={`absolute z-10 mt-8 rounded-lg shadow-lg ${
                      theme === "black" ? "bg-gray-800 text-gray-200" : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <ul className="py-2">
                      <li
                        className={`px-4 py-2 hover:bg-gray-600 cursor-pointer`}
                        onClick={() => {
                          setShowCashDropdown(false);
                          toast.info("Selected Option 1 for Cash");
                        }}
                      >
                        Option 1
                      </li>
                      <li
                        className={`px-4 py-2 hover:bg-gray-600 cursor-pointer`}
                        onClick={() => {
                          setShowCashDropdown(false);
                          toast.info("Selected Option 2 for Cash");
                        }}
                      >
                        Option 2
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <LineChart
                data={cashFiltered}
                predictionData={cashPrediction.predictions}
                dataKey="value"
                stroke="#EF4444"
                fill="#EF4444"
                title="Cash"
                highlight="▼ $4.0M"
                onAddAnnotation={addAnnotation}
                annotations={annotations}
                metric={cashMetric}
                setMetric={setCashMetric}
                theme={theme}
              />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">Runway</h3>
                <button onClick={() => setShowRunwayDropdown(!showRunwayDropdown)}>
                  <span className={`inline-block w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-400 hover:border-t-gray-200 transform ${showRunwayDropdown ? "rotate-180" : ""}`}></span>
                </button>
                {showRunwayDropdown && (
                  <div
                    className={`absolute z-10 mt-8 rounded-lg shadow-lg ${
                      theme === "black" ? "bg-gray-800 text-gray-200" : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <ul className="py-2">
                      <li
                        className={`px-4 py-2 hover:bg-gray-600 cursor-pointer`}
                        onClick={() => {
                          setShowRunwayDropdown(false);
                          toast.info("Selected Option 1 for Runway");
                        }}
                      >
                        Option 1
                      </li>
                      <li
                        className={`px-4 py-2 hover:bg-gray-600 cursor-pointer`}
                        onClick={() => {
                          setShowRunwayDropdown(false);
                          toast.info("Selected Option 2 for Runway");
                        }}
                      >
                        Option 2
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <LineChart
                data={runwayFiltered}
                predictionData={runwayPrediction.predictions}
                dataKey="value"
                stroke="#10B981"
                fill="#10B981"
                title="Runway"
                highlight="▼ $29.4M"
                onAddAnnotation={addAnnotation}
                annotations={annotations}
                metric={runwayMetric}
                setMetric={setRunwayMetric}
                theme={theme}
              />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">ARR</h3>
                <button onClick={() => setShowArrDropdown(!showArrDropdown)}>
                  <span className={`inline-block w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-400 hover:border-t-gray-200 transform ${showArrDropdown ? "rotate-180" : ""}`}></span>
                </button>
                {showArrDropdown && (
                  <div
                    className={`absolute z-10 mt-8 rounded-lg shadow-lg ${
                      theme === "black" ? "bg-gray-800 text-gray-200" : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <ul className="py-2">
                      <li
                        className={`px-4 py-2 hover:bg-gray-600 cursor-pointer`}
                        onClick={() => {
                          setShowArrDropdown(false);
                          toast.info("Selected Option 1 for ARR");
                        }}
                      >
                        Option 1
                      </li>
                      <li
                        className={`px-4 py-2 hover:bg-gray-600 cursor-pointer`}
                        onClick={() => {
                          setShowArrDropdown(false);
                          toast.info("Selected Option 2 for ARR");
                        }}
                      >
                        Option 2
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <LineChart
                data={arrFiltered}
                predictionData={arrPrediction.predictions}
                dataKey="value"
                stroke="#F59E0B"
                fill="#F59E0B"
                title="ARR"
                highlight="▲ 3.2%"
                onAddAnnotation={addAnnotation}
                annotations={annotations}
                metric={arrMetric}
                setMetric={setArrMetric}
                theme={theme}
                isArr={true}
              />
            </div>
          </div>
        </section>

        {/* Marketing Spend Over Time */}
        <section className="mb-12">
          <div
            className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${
              theme === "black" ? "bg-gray-800" : "bg-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4 text-center">Model Inputs</h2>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <select
                  value={selectedInputView}
                  onChange={(e) => setSelectedInputView(e.target.value as "View Spreadsheet" | "Business Canvas")}
                  className={`px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2 ${
                    theme === "black" ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-gray-200 text-gray-800 border-gray-400"
                  } appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="View Spreadsheet">View Spreadsheet</option>
                  <option value="Business Canvas">Business Canvas</option>
                </select>
                <span className="inline-block w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-green-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"></span>
              </div>
            </div>
            <div className="overflow-x-auto mb-6">
              {selectedInputView === "View Spreadsheet" ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${theme === "black" ? "bg-gray-700" : "bg-gray-300"}`}>
                      <th className="p-3 text-left">Marketing Spend</th>
                      {marketingSpendChartData.slice(0, 10).map((data) => (
                        <th key={data.month} className="p-3 text-right">
                          {data.month}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3">Marketing Spend - Last</td>
                      {marketingSpendChartData.slice(0, 10).map((data, index) => (
                        <td key={index} className="p-3 text-right">
                          ${data.value.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3">Marketing Growth %</td>
                      {[
                        "1.4%",
                        "1.3%",
                        "1.3%",
                        "1.2%",
                        "1.2%",
                        "1.1%",
                        "1.1%",
                        "1.1%",
                        "1.1%",
                        "1.0%",
                      ].map((growth, index) => (
                        <td key={index} className="p-3 text-right">
                          {growth}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3">Change</td>
                      {[
                        "+$10,600",
                        "+$10,600",
                        "+$10,600",
                        "+$10,600",
                        "+$10,600",
                        "+$10,600",
                        "+$10,600",
                        "+$10,600",
                        "+$10,600",
                        "-$15,000",
                      ].map((change, index) => (
                        <td key={index} className="p-3 text-right">
                          {change}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${theme === "black" ? "bg-gray-700" : "bg-gray-300"}`}>
                      <th className="p-3 text-left">Category</th>
                      {marketingSpendChartData.slice(0, 10).map((data) => (
                        <th key={data.month} className="p-3 text-right">
                          {data.month}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {businessCanvasData.map((item, index) => (
                      <tr key={index}>
                        <td className="p-3">{item.category}</td>
                        <td className="p-3 text-right">${item.jul.toLocaleString()}</td>
                        <td className="p-3 text-right">${item.aug.toLocaleString()}</td>
                        <td className="p-3 text-right">${item.sep.toLocaleString()}</td>
                        <td className="p-3 text-right">${item.oct.toLocaleString()}</td>
                        <td className="p-3 text-right">${item.nov.toLocaleString()}</td>
                        <td className="p-3 text-right">${item.dec.toLocaleString()}</td>
                        <td className="p-3 text-right">${item.jan.toLocaleString()}</td>
                        <td className="p-3 text-right">${item.feb.toLocaleString()}</td>
                        <td className="p-3 text-right">${item.mar.toLocaleString()}</td>
                        <td className="p-3 text-right">${item.apr.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Marketing Spend Over Time</h3>
              <button
                onClick={resetChartData}
                className={`px-4 py-2 rounded-lg ${
                  theme === "black" ? "bg-gray-700 text-gray-200" : "bg-gray-300 text-gray-800"
                } hover:bg-gray-600 transition-colors shadow-sm`}
              >
                Reset Chart
              </button>
            </div>
            {selectedBlock && <div className="mb-4 text-sm text-gray-400">Updated by: {selectedBlock}</div>}
            <ResponsiveContainer width="100%" height={250}>
              <RechartsLineChart
                data={[...marketingSpendChartData.slice(0, 10), ...marketingSpendPredData]}
                onMouseDown={handleMouseDownMarketingSpend}
                onMouseMove={handleMouseMoveMarketingSpend}
                onMouseUp={handleMouseUpMarketingSpend}
                onMouseLeave={handleMouseUpMarketingSpend}
              >
                <defs>
                  <linearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A3BFFA" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#A3BFFA" stopOpacity={0} />
                  </linearGradient>
                  <filter id="shadow-marketing" x="-50%" y="-50%" width="200%" height="200%">
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
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="none"
                  fill="url(#gradientFill)"
                  fillOpacity={0.5}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  data={[...marketingSpendChartData.slice(0, 10)]}
                  stroke="#60A5FA"
                  strokeWidth={2}
                  filter="url(#shadow-marketing)"
                  activeDot={{ r: 8, fill: "#60A5FA", stroke: "#fff", strokeWidth: 2 }}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  data={[...marketingSpendPredData]}
                  stroke="#60A5FA"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  filter="url(#shadow-marketing)"
                  dot={false}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
            <p className={`text-sm mt-2 ${theme === "black" ? "text-gray-400" : "text-gray-600"}`}>
              Prediction Formula: y = 9607.5x + 804551.5
            </p>
          </div>
        </section>

        {/* Dropdown Sections with Tables */}
        <section className="mb-12">
          <div
            className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${
              theme === "black" ? "bg-gray-800" : "bg-gray-200"
            }`}
          >
            <div className="mb-6">
              <button
                onClick={() => setIsMarketingOpen(!isMarketingOpen)}
                className="flex items-center gap-2 w-full text-xl font-semibold"
              >
                <span className={`inline-block w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white transform ${isMarketingOpen ? "rotate-180" : ""}`}></span>
                MARKETING
              </button>
              {isMarketingOpen && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">MARKETING STRATEGY</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`${theme === "black" ? "bg-gray-700" : "bg-gray-300"}`}>
                          <th className="p-3 text-left">Strategy</th>
                          <th className="p-3 text-right">Last Close</th>
                          {Array(9).fill("Jun’24").map((month, index) => (
                            <th key={index} className="p-3 text-right">{month}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {strategyData.map((strategy, index) => (
                          <tr key={index}>
                            <td className="p-3 flex items-center gap-2">
                              <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                              {strategy.category}
                            </td>
                            <td className="p-3 text-right">${strategy.lastClose}</td>
                            {strategy.jun24.map((value, idx) => (
                              <td key={idx} className="p-3 text-right">${value}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <button
                onClick={() => setIsSalesOpen(!isSalesOpen)}
                className="flex items-center gap-2 w-full text-xl font-semibold"
              >
                <span className={`inline-block w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white transform ${isSalesOpen ? "rotate-180" : ""}`}></span>
                SALES CONVERSION
              </button>
              {isSalesOpen && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">SALES STRATEGY</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`${theme === "black" ? "bg-gray-700" : "bg-gray-300"}`}>
                          <th className="p-3 text-left">Strategy</th>
                          <th className="p-3 text-right">Last Close</th>
                          {Array(9).fill("Jun’24").map((month, index) => (
                            <th key={index} className="p-3 text-right">{month}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {strategyData.map((strategy, index) => (
                          <tr key={index}>
                            <td className="p-3 flex items-center gap-2">
                              <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                              {strategy.category}
                            </td>
                            <td className="p-3 text-right">${strategy.lastClose}</td>
                            {strategy.jun24.map((value, idx) => (
                              <td key={idx} className="p-3 text-right">${value}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <button
                onClick={() => setIsCustomerServiceOpen(!isCustomerServiceOpen)}
                className="flex items-center gap-2 w-full text-xl font-semibold"
              >
                <span className={`inline-block w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white transform ${isCustomerServiceOpen ? "rotate-180" : ""}`}></span>
                CUSTOMER SERVICE
              </button>
              {isCustomerServiceOpen && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">CUSTOMER SERVICE STRATEGY</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`${theme === "black" ? "bg-gray-700" : "bg-gray-300"}`}>
                          <th className="p-3 text-left">Strategy</th>
                          <th className="p-3 text-right">Last Close</th>
                          {Array(9).fill("Jun’24").map((month, index) => (
                            <th key={index} className="p-3 text-right">{month}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {strategyData.map((strategy, index) => (
                          <tr key={index}>
                            <td className="p-3 flex items-center gap-2">
                              <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                              {strategy.category}
                            </td>
                            <td className="p-3 text-right">${strategy.lastClose}</td>
                            {strategy.jun24.map((value, idx) => (
                              <td key={idx} className="p-3 text-right">${value}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}