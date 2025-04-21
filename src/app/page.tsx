"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar, Sun, Moon, Download, RotateCcw, TrendingUp } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Chart from "chart.js/auto";
import { Chart as ChartJS, LineController, LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend } from "chart.js";
import { motion, AnimatePresence } from "framer-motion";
import annotationPlugin from "chartjs-plugin-annotation";
import 'chartjs-adapter-date-fns';

// Register Chart.js components and plugins
ChartJS.register(LineController, LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, annotationPlugin);

// Types for data
interface DataPoint {
  month: string;
  value: number;
  scenario?: string;
}

interface StrategyData {
  strategy: string;
  parameter: string;
  values: number[];
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
  const [showStartDateInput, setShowStartDateInput] = useState(false);
  const [showEndDateInput, setShowEndDateInput] = useState(false);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"black" | "white">("white");
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Dropdown states for each graph
  const [burnMetric, setBurnMetric] = useState("Default");
  const [cashMetric, setCashMetric] = useState("Default");
  const [runwayMetric, setRunwayMetric] = useState("Default");
  const [arrMetric, setArrMetric] = useState("Default");

  // Dropdown visibility states
  const [showBurnDropdown, setShowBurnDropdown] = useState(false);
  const [showCashDropdown, setShowCashDropdown] = useState(false);
  const [showRunwayDropdown, setShowRunwayDropdown] = useState(false);
  const [showArrDropdown, setShowArrDropdown] = useState(false);

  // State for draggable predictions
  const [isPredictMode, setIsPredictMode] = useState<{ [key: string]: boolean }>({
    burn: false,
    cash: false,
    runway: false,
    arr: false,
    marketingSpend: false,
  });

  // State for Model Inputs
  const [selectedInputCategory, setSelectedInputCategory] = useState<"Marketing Spend" | "Sales Conversion" | "Customer Service">("Marketing Spend");
  const [natureOfChange, setNatureOfChange] = useState("");
  const [modelStartDate, setModelStartDate] = useState("");
  const [modelEndDate, setModelEndDate] = useState("");
  const [percentageChange, setPercentageChange] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);

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
  };

  const arrData: { [key: string]: DataPoint[] } = {
    Default: [
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
  };

  const strategyData: StrategyData[] = [
    { strategy: "New Campaign", parameter: "Marketing Spend", values: Array(9).fill(332) },
    { strategy: "New Ads Creative", parameter: "Viral Coeffient", values: Array(9).fill(332) },
    { strategy: "Affiliate Program", parameter: "Refrel Coef.", values: Array(9).fill(332) },
    { strategy: "Marketing Copy", parameter: "Opt-in Rate", values: Array(9).fill(332) },
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

  // State for modified prediction data
  const [modifiedBurnData, setModifiedBurnData] = useState<DataPoint[]>(burnData.Default);
  const [modifiedCashData, setModifiedCashData] = useState<DataPoint[]>(cashData.Default);
  const [modifiedRunwayData, setModifiedRunwayData] = useState<DataPoint[]>(runwayData.Default);
  const [modifiedArrData, setModifiedArrData] = useState<DataPoint[]>(arrData.Default);
  const [modifiedMarketingSpendData, setModifiedMarketingSpendData] = useState<DataPoint[]>(marketingSpendData);

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

  const burnFiltered = filterDataByDate(modifiedBurnData);
  const cashFiltered = filterDataByDate(modifiedCashData);
  const runwayFiltered = filterDataByDate(modifiedRunwayData);
  const arrFiltered = filterDataByDate(modifiedArrData);
  const marketingSpendFiltered = filterDataByDate(modifiedMarketingSpendData);

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);
    return `${month} '${year}`;
  };

  // Generate table headers based on start date
  const generateTableHeaders = () => {
    if (!startDate) return Array(9).fill("Jun '24");
    const months = [];
    const start = new Date(startDate);
    for (let i = 0; i < 9; i++) {
      const date = new Date(start);
      date.setMonth(start.getMonth() + i);
      months.push(formatDate(date));
    }
    return months;
  };

  const tableHeaders = generateTableHeaders();

  const handleStartDateSubmit = () => {
    const date = new Date(tempStartDate);
    if (!isNaN(date.getTime())) {
      setStartDate(date);
      setShowStartDateInput(false);
      setShowEndDateInput(true);
      setTempStartDate("");
    } else {
      toast.error("Invalid start date format. Please use YYYY-MM-DD.");
    }
  };

  const handleEndDateSubmit = () => {
    const date = new Date(tempEndDate);
    if (!isNaN(date.getTime()) && startDate && date >= startDate) {
      setEndDate(date);
      setDateRange({ start: formatDate(startDate), end: formatDate(date) });
      setShowEndDateInput(false);
      setTempEndDate("");
      setLoading(true);
      setTimeout(() => {
        setModifiedMarketingSpendData(filterDataByDate(marketingSpendData));
        setLoading(false);
      }, 500);
    } else {
      toast.error("Invalid end date format or end date is before start date. Please use YYYY-MM-DD.");
    }
  };

  const resetChartData = (chart: string) => {
    setLoading(true);
    setTimeout(() => {
      if (chart === "burn") setModifiedBurnData(burnData.Default);
      if (chart === "cash") setModifiedCashData(cashData.Default);
      if (chart === "runway") setModifiedRunwayData(runwayData.Default);
      if (chart === "arr") setModifiedArrData(arrData.Default);
      if (chart === "marketingSpend") setModifiedMarketingSpendData(marketingSpendData);
      setIsPredictMode((prev) => ({ ...prev, [chart]: false }));
      setLoading(false);
    }, 500);
  };

  const downloadChart = async (chartId: string, chartName: string) => {
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    if (!canvas) return;

    setLoading(true);
    try {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${chartName}.pdf`);
      toast.success(`${chartName} downloaded successfully!`);
    } catch (error) {
      console.error("Error generating chart PDF:", error);
      toast.error(`Failed to download ${chartName}`);
    } finally {
      setLoading(false);
    }
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
  };

  // Chart.js setup for graphs with draggable predictions
  useEffect(() => {
    const createChart = (
      ctx: HTMLCanvasElement,
      data: DataPoint[],
      label: string,
      color: string,
      chartKey: string,
      setData: React.Dispatch<React.SetStateAction<DataPoint[]>>
    ) => {
      const historicalData = data.slice(0, 10);
      const predictionData = data.slice(10);
      let isDragging = false;
      let draggedPointIndex: number | null = null;

      const chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: data.map((d) => d.month),
          datasets: [
            {
              label: label,
              data: historicalData.map((d) => d.value),
              borderColor: color,
              backgroundColor: `${color}33`,
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 0,
            },
            {
              label: `${label} Prediction`,
              data: [...historicalData.slice(-1), ...predictionData].map((d) => d.value),
              borderColor: color,
              borderDash: [5, 5],
              fill: false,
              tension: 0.4,
              borderWidth: 2,
              pointRadius: (context: any) => (isPredictMode[chartKey] && context.dataIndex >= historicalData.length ? 5 : 0),
              pointHoverRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: theme === "black" ? "#1F2937" : "#FFFFFF",
              titleColor: theme === "black" ? "#FFFFFF" : "#000000",
              bodyColor: theme === "black" ? "#FFFFFF" : "#000000",
              borderColor: theme === "black" ? "4B5563" : "#D1D5DB",
              borderWidth: 1,
              callbacks: {
                label: (context: any) => {
                  const value = context.raw;
                  if (label.includes("Burn") || label.includes("Cash")) {
                    return `$${value}M`;
                  } else if (label.includes("Runway")) {
                    return `${value}`;
                  } else if (label.includes("Marketing Spend")) {
                    return `$${value.toLocaleString()}`;
                  } else {
                    return `${value}%`;
                  }
                },
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: theme === "black" ? "#9CA3AF" : "#4B5563" },
            },
            y: {
              grid: { color: theme === "black" ? "#4B5563" : "#D1D5DB" },
              ticks: {
                color: theme === "black" ? "#9CA3AF" : "#4B5563",
                callback: (value: any) => {
                  if (label.includes("Burn") || label.includes("Cash")) {
                    return `$${value}M`;
                  } else if (label.includes("Runway")) {
                    return `${value}`;
                  } else if (label.includes("Marketing Spend")) {
                    return `$${value.toLocaleString()}`;
                  } else {
                    return `${value}%`;
                  }
                },
              },
            },
          },
          elements: {
            line: {
              shadowOffsetX: 0,
              shadowOffsetY: 4,
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.3)",
            },
          },
          interaction: {
            mode: "nearest",
            intersect: false,
          },
          onHover: (event: any, elements: any) => {
            if (isPredictMode[chartKey] && elements.length > 0) {
              const element = elements[0];
              if (element.datasetIndex === 1 && element.index >= historicalData.length) {
                ctx.style.cursor = "grab";
              } else {
                ctx.style.cursor = "default";
              }
            } else {
              ctx.style.cursor = "default";
            }
          },
        },
      });

      // Dragging logic
      ctx.addEventListener("mousedown", (event: MouseEvent) => {
        if (!isPredictMode[chartKey]) return;
        const points = chart.getElementsAtEventForMode(event, "nearest", { intersect: true }, false);
        if (points.length > 0) {
          const point = points[0];
          if (point.datasetIndex === 1 && point.index >= historicalData.length) {
            isDragging = true;
            draggedPointIndex = point.index;
            ctx.style.cursor = "grabbing";
          }
        }
      });

      ctx.addEventListener("mousemove", (event: MouseEvent) => {
        if (isDragging && draggedPointIndex !== null) {
          const rect = ctx.getBoundingClientRect();
          const y = event.clientY - rect.top;
          const yAxis = chart.scales.y;
          const value = yAxis.getValueForPixel(y);
          if (value !== undefined) {
            const newData = [...data];
            newData[draggedPointIndex].value = Math.max(0, value);
            setData(newData);
            chart.data.datasets[1].data = [...historicalData.slice(-1), ...newData.slice(10)].map((d) => d.value);
            chart.update();
            toast.info(`Updated ${label} prediction for ${newData[draggedPointIndex].month}`);
          }
        }
      });

      ctx.addEventListener("mouseup", () => {
        isDragging = false;
        draggedPointIndex = null;
        ctx.style.cursor = isPredictMode[chartKey] ? "grab" : "default";
      });

      ctx.addEventListener("mouseleave", () => {
        isDragging = false;
        draggedPointIndex = null;
        ctx.style.cursor = "default";
      });

      return chart;
    };

    const burnCtx = document.getElementById("burnChart") as HTMLCanvasElement;
    const cashCtx = document.getElementById("cashChart") as HTMLCanvasElement;
    const runwayCtx = document.getElementById("runwayChart") as HTMLCanvasElement;
    const arrCtx = document.getElementById("arrChart") as HTMLCanvasElement;
    const marketingSpendCtx = document.getElementById("marketingSpendChart") as HTMLCanvasElement;

    const burnChart = createChart(burnCtx, modifiedBurnData, "Burn", "#3B82F6", "burn", setModifiedBurnData);
    const cashChart = createChart(cashCtx, modifiedCashData, "Cash", "#EF4444", "cash", setModifiedCashData);
    const runwayChart = createChart(runwayCtx, modifiedRunwayData, "Runway", "#10B981", "runway", setModifiedRunwayData);
    const arrChart = createChart(arrCtx, modifiedArrData, "ARR", "#F59E0B", "arr", setModifiedArrData);
    const marketingSpendChart = createChart(
      marketingSpendCtx,
      modifiedMarketingSpendData,
      selectedInputCategory,
      "#60A5FA",
      "marketingSpend",
      setModifiedMarketingSpendData
    );

    return () => {
      burnChart.destroy();
      cashChart.destroy();
      runwayChart.destroy();
      arrChart.destroy();
      marketingSpendChart.destroy();
    };
  }, [
    modifiedBurnData,
    modifiedCashData,
    modifiedRunwayData,
    modifiedArrData,
    modifiedMarketingSpendData,
    theme,
    isPredictMode,
    selectedInputCategory,
  ]);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.2 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <div
      ref={dashboardRef}
      className={`min-h-screen transition-colors duration-300 ${
        theme === "black" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500"></div>
        </div>
      )}

      {/* Centered Navigation Links */}
      <motion.div
        className="flex justify-center gap-8 py-6"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <motion.a
          href="#"
          className="text-lg font-semibold hover:border-b-2 hover:border-green-500 transition-all duration-200"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Scenario
        </motion.a>
        <motion.a
          href="#"
          className="text-lg font-semibold hover:border-b-2 hover:border-green-500 transition-all duration-200"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Plan
        </motion.a>
        <motion.a
          href="#"
          className="text-lg font-semibold hover:border-b-2 hover:border-green-500 transition-all duration-200"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          State
        </motion.a>
        <motion.a
          href="#"
          className="text-lg font-semibold hover:border-b-2 hover:border-green-500 transition-all duration-200"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Financial Statement
        </motion.a>
      </motion.div>

      {/* Main Dashboard */}
      <main className="p-8">
        {/* Controls */}
        <motion.div
          className="flex justify-between items-center mb-4"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <motion.div className="relative" variants={cardVariants}>
            <motion.button
              onClick={() => setShowStartDateInput(true)}
              className={`px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2 ${
                theme === "black"
                  ? "bg-gray-800 text-gray-200 border-gray-600"
                  : "bg-white text-gray-800 border-gray-300"
              } hover:border-green-500 transition-colors duration-200`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Calendar size={20} className="text-green-500" />
              {`${dateRange.start} - ${dateRange.end}`}
            </motion.button>
            <AnimatePresence>
              {showStartDateInput && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute z-10 mt-2 p-4 rounded-lg shadow-lg border ${
                    theme === "black" ? "bg-gray-800 text-white border-gray-600" : "bg-white text-black border-gray-300"
                  }`}
                >
                  <label className="block mb-2">Enter Start Date (YYYY-MM-DD):</label>
                  <input
                    type="text"
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    placeholder="e.g., 2024-07-01"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === "black" ? "bg-gray-700 text-white border-gray-600" : "bg-gray-200 text-black border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                  <motion.button
                    onClick={handleStartDateSubmit}
                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Submit Start Date
                  </motion.button>
                </motion.div>
              )}
              {showEndDateInput && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute z-10 mt-2 p-4 rounded-lg shadow-lg border ${
                    theme === "black" ? "bg-gray-800 text-white border-gray-600" : "bg-white text-black border-gray-300"
                  }`}
                >
                  <label className="block mb-2">Enter End Date (YYYY-MM-DD):</label>
                  <input
                    type="text"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    placeholder="e.g., 2025-06-30"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === "black" ? "bg-gray-700 text-white border-gray-600" : "bg-gray-200 text-black border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                  <motion.button
                    onClick={handleEndDateSubmit}
                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Submit End Date
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <motion.div className="flex gap-4" variants={cardVariants}>
            <motion.button
              onClick={() => setViewMode("single")}
              className={`px-4 py-2 rounded-lg ${
                viewMode === "single"
                  ? "bg-green-600 text-white"
                  : theme === "black"
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-200 text-gray-800"
              } hover:bg-green-500 hover:text-white transition-colors shadow-sm`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Single View
            </motion.button>
            <motion.button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg ${
                viewMode === "grid"
                  ? "bg-green-600 text-white"
                  : theme === "black"
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-200 text-gray-800"
              } hover:bg-green-500 hover:text-white transition-colors shadow-sm`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Grid View
            </motion.button>
            <motion.button
              onClick={downloadPDF}
              className={`px-4 py-2 rounded-lg ${
                theme === "black" ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"
              } hover:bg-green-500 hover:text-white transition-colors shadow-sm`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Download PDF
            </motion.button>
            <motion.button
              onClick={toggleTheme}
              className={`px-4 py-2 rounded-lg ${
                theme === "black" ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-800"
              } hover:bg-green-500 hover:text-white transition-colors shadow-sm`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {theme === "black" ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Four Cards Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <motion.div
            className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${
              theme === "black" ? "bg-gray-800" : "bg-white"
            } border ${theme === "black" ? "border-gray-700" : "border-gray-200"}`}
            variants={cardVariants}
          >
            <h3 className="text-lg font-semibold mb-2 text-green-500">Total Cash</h3>
            <p className={`text-2xl font-bold ${theme === "black" ? "text-gray-200" : "text-gray-800"}`}>
              $5.0M
            </p>
            <p className={`text-sm ${theme === "black" ? "text-gray-400" : "text-gray-600"}`}>
              As of {dateRange.end}
            </p>
          </motion.div>
          <motion.div
            className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${
              theme === "black" ? "bg-gray-800" : "bg-white"
            } border ${theme === "black" ? "border-gray-700" : "border-gray-200"}`}
            variants={cardVariants}
          >
            <h3 className="text-lg font-semibold mb-2 text-green-500">Marketing Spend</h3>
            <p className={`text-2xl font-bold ${theme === "black" ? "text-gray-200" : "text-gray-800"}`}>
              $846,582
            </p>
            <p className={`text-sm ${theme === "black" ? "text-gray-400" : "text-gray-600"}`}>
              Current Month (Oct '24)
            </p>
          </motion.div>
          <motion.div
            className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${
              theme === "black" ? "bg-gray-800" : "bg-white"
            } border ${theme === "black" ? "border-gray-700" : "border-gray-200"}`}
            variants={cardVariants}
          >
            <h3 className="text-lg font-semibold mb-2 text-green-500">Burn Rate</h3>
            <p className={`text-2xl font-bold ${theme === "black" ? "text-gray-200" : "text-gray-800"}`}>
              $2.31M
            </p>
            <p className={`text-sm ${theme === "black" ? "text-gray-400" : "text-gray-600"}`}>
              Monthly Average
            </p>
          </motion.div>
          <motion.div
            className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${
              theme === "black" ? "bg-gray-800" : "bg-white"
            } border ${theme === "black" ? "border-gray-700" : "border-gray-200"}`}
            variants={cardVariants}
          >
            <h3 className="text-lg font-semibold mb-2 text-green-500">Runway</h3>
            <p className={`text-2xl font-bold ${theme === "black" ? "text-gray-200" : "text-gray-800"}`}>
              2.0 Months
            </p>
            <p className={`text-sm ${theme === "black" ? "text-gray-400" : "text-gray-600"}`}>
              Remaining
            </p>
          </motion.div>
        </motion.div>

        {/* Main Charts */}
        <motion.section className="mb-12" initial="hidden" animate="visible" variants={sectionVariants}>
          <motion.h2 className="text-2xl font-semibold mb-4" variants={cardVariants}>
            Impact of Increasing Marketing Spend by 10%
          </motion.h2>
          <motion.div
            className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "flex flex-col gap-6"}`}
            variants={sectionVariants}
          >
            <motion.div className="relative" variants={cardVariants}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-green-500">Burn</h3>
                <button onClick={() => setShowBurnDropdown(!showBurnDropdown)}>
                  <span
                    className={`inline-block w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-400 hover:border-t-gray-200 transform ${
                      showBurnDropdown ? "rotate-180" : ""
                    }`}
                  ></span>
                </button>
                {showBurnDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute z-10 mt-8 rounded-lg shadow-lg ${
                      theme === "black" ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
                    } border ${theme === "black" ? "border-gray-600" : "border-gray-300"}`}
                  >
                    <ul className="py-2">
                      <li
                        className={`px-4 py-2 hover:bg-green-500 hover:text-white cursor-pointer transition-colors`}
                        onClick={() => {
                          setShowBurnDropdown(false);
                        }}
                      >
                        Option 1
                      </li>
                      <li
                        className={`px-4 py-2 hover:bg-green-500 hover:text-white cursor-pointer transition-colors`}
                        onClick={() => {
                          setShowBurnDropdown(false);
                        }}
                      >
                        Option 2
                      </li>
                    </ul>
                  </motion.div>
                )}
              </div>
              <div
                className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                  theme === "black" ? "bg-gray-800" : "bg-white"
                } border ${theme === "black" ? "border-gray-700" : "border-gray-200"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Burn</h3>
                    <span className={`text-sm font-bold ${theme === "black" ? "text-gray-400" : "text-gray-600"}`}>
                      $2.31M / $2.45M
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => downloadChart("burnChart", "Burn_Chart")}
                      className="p-1 hover:bg-green-500 hover:text-white rounded transition-colors"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Download size={16} />
                    </motion.button>
                    <motion.button
                      onClick={() => resetChartData("burn")}
                      className="p-1 hover:bg-green-500 hover:text-white rounded transition-colors"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <RotateCcw size={16} />
                    </motion.button>
                    <motion.button
                      onClick={() => setIsPredictMode((prev) => ({ ...prev, burn: !prev.burn }))}
                      className={`p-1 rounded transition-colors ${
                        isPredictMode.burn ? "bg-green-500 text-white" : "hover:bg-green-500 hover:text-white"
                      }`}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <TrendingUp size={16} />
                    </motion.button>
                  </div>
                </div>
                <div className="h-48">
                  <canvas id="burnChart"></canvas>
                </div>
              </div>
            </motion.div>
            <motion.div className="relative" variants={cardVariants}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-green-500">Cash</h3>
                <button onClick={() => setShowCashDropdown(!showCashDropdown)}>
                  <span
                    className={`inline-block w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-400 hover:border-t-gray-200 transform ${
                      showCashDropdown ? "rotate-180" : ""
                    }`}
                  ></span>
                </button>
                {showCashDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute z-10 mt-8 rounded-lg shadow-lg ${
                      theme === "black" ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
                    } border ${theme === "black" ? "border-gray-600" : "border-gray-300"}`}
                  >
                    <ul className="py-2">
                      <li
                        className={`px-4 py-2 hover:bg-green-500 hover:text-white cursor-pointer transition-colors`}
                        onClick={() => {
                          setShowCashDropdown(false);
                        }}
                      >
                        Option 1
                      </li>
                      <li
                        className={`px-4 py-2 hover:bg-green-500 hover:text-white cursor-pointer transition-colors`}
                        onClick={() => {
                          setShowCashDropdown(false);
                        }}
                      >
                        Option 2
                      </li>
                    </ul>
                  </motion.div>
                )}
              </div>
              <div
                className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                  theme === "black" ? "bg-gray-800" : "bg-white"
                } border ${theme === "black" ? "border-gray-700" : "border-gray-200"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Cash</h3>
                    <span className={`text-sm font-bold ${theme === "black" ? "text-gray-400" : "text-gray-600"}`}>
                      $5.0M / $2.8M
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => downloadChart("cashChart", "Cash_Chart")}
                      className="p-1 hover:bg-green-500 hover:text-white rounded transition-colors"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Download size={16} />
                    </motion.button>
                    <motion.button
                      onClick={() => resetChartData("cash")}
                      className="p-1 hover:bg-green-500 hover:text-white rounded transition-colors"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <RotateCcw size={16} />
                    </motion.button>
                    <motion.button
                      onClick={() => setIsPredictMode((prev) => ({ ...prev, cash: !prev.cash }))}
                      className={`p-1 rounded transition-colors ${
                        isPredictMode.cash ? "bg-green-500 text-white" : "hover:bg-green-500 hover:text-white"
                      }`}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <TrendingUp size={16} />
                    </motion.button>
                  </div>
                </div>
                <div className="h-48">
                  <canvas id="cashChart"></canvas>
                </div>
              </div>
            </motion.div>
            <motion.div className="relative" variants={cardVariants}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-green-500">Runway</h3>
                <button onClick={() => setShowRunwayDropdown(!showRunwayDropdown)}>
                  <span
                    className={`inline-block w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-400 hover:border-t-gray-200 transform ${
                      showRunwayDropdown ? "rotate-180" : ""
                    }`}
                  ></span>
                </button>
                {showRunwayDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute z-10 mt-8 rounded-lg shadow-lg ${
                      theme === "black" ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
                    } border ${theme === "black" ? "border-gray-600" : "border-gray-300"}`}
                  >
                    <ul className="py-2">
                      <li
                        className={`px-4 py-2 hover:bg-green-500 hover:text-white cursor-pointer transition-colors`}
                        onClick={() => {
                          setShowRunwayDropdown(false);
                        }}
                      >
                        Option 1
                      </li>
                      <li
                        className={`px-4 py-2 hover:bg-green-500 hover:text-white cursor-pointer transition-colors`}
                        onClick={() => {
                          setShowRunwayDropdown(false);
                        }}
                      >
                        Option 2
                      </li>
                    </ul>
                  </motion.div>
                )}
              </div>
              <div
                className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                  theme === "black" ? "bg-gray-800" : "bg-white"
                } border ${theme === "black" ? "border-gray-700" : "border-gray-200"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Runway</h3>
                    <span className={`text-sm font-bold ${theme === "black" ? "text-gray-400" : "text-gray-600"}`}>
                      2.0 / 2.1
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => downloadChart("runwayChart", "Runway_Chart")}
                      className="p-1 hover:bg-green-500 hover:text-white rounded transition-colors"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Download size={16} />
                    </motion.button>
                    <motion.button
                      onClick={() => resetChartData("runway")}
                      className="p-1 hover:bg-green-500 hover:text-white rounded transition-colors"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <RotateCcw size={16} />
                    </motion.button>
                    <motion.button
                      onClick={() => setIsPredictMode((prev) => ({ ...prev, runway: !prev.runway }))}
                      className={`p-1 rounded transition-colors ${
                        isPredictMode.runway ? "bg-green-500 text-white" : "hover:bg-green-500 hover:text-white"
                      }`}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <TrendingUp size={16} />
                    </motion.button>
                  </div>
                </div>
                <div className="h-48">
                  <canvas id="runwayChart"></canvas>
                </div>
              </div>
            </motion.div>
            <motion.div className="relative" variants={cardVariants}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-green-500">ARR</h3>
                <button onClick={() => setShowArrDropdown(!showArrDropdown)}>
                  <span
                    className={`inline-block w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-400 hover:border-t-gray-200 transform ${
                      showArrDropdown ? "rotate-180" : ""
                    }`}
                  ></span>
                </button>
                {showArrDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute z-10 mt-8 rounded-lg shadow-lg ${
                      theme === "black" ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
                    } border ${theme === "black" ? "border-gray-600" : "border-gray-300"}`}
                  >
                    <ul className="py-2">
                      <li
                        className={`px-4 py-2 hover:bg-green-500 hover:text-white cursor-pointer transition-colors`}
                        onClick={() => {
                          setShowArrDropdown(false);
                        }}
                      >
                        Option 1
                      </li>
                      <li
                        className={`px-4 py-2 hover:bg-green-500 hover:text-white cursor-pointer transition-colors`}
                        onClick={() => {
                          setShowArrDropdown(false);
                        }}
                      >
                        Option 2
                      </li>
                    </ul>
                  </motion.div>
                )}
              </div>
              <div
                className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                  theme === "black" ? "bg-gray-800" : "bg-white"
                } border ${theme === "black" ? "border-gray-700" : "border-gray-200"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">ARR</h3>
                    <span className={`text-sm font-bold ${theme === "black" ? "text-gray-400" : "text-gray-600"}`}>
                      3.2% / 4.3%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => downloadChart("arrChart", "ARR_Chart")}
                      className="p-1 hover:bg-green-500 hover:text-white rounded transition-colors"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Download size={16} />
                    </motion.button>
                    <motion.button
                      onClick={() => resetChartData("arr")}
                      className="p-1 hover:bg-green-500 hover:text-white rounded transition-colors"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <RotateCcw size={16} />
                    </motion.button>
                    <motion.button
                      onClick={() => setIsPredictMode((prev) => ({ ...prev, arr: !prev.arr }))}
                      className={`p-1 rounded transition-colors ${
                        isPredictMode.arr ? "bg-green-500 text-white" : "hover:bg-green-500 hover:text-white"
                      }`}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <TrendingUp size={16} />
                    </motion.button>
                  </div>
                </div>
                <div className="h-48">
                  <canvas id="arrChart"></canvas>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Model Inputs Section */}
        <motion.section className="mb-12" initial="hidden" animate="visible" variants={sectionVariants}>
          <motion.div
            className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${
              theme === "black" ? "bg-gray-800" : "bg-white"
            } border ${theme === "black" ? "border-gray-700" : "border-gray-200"}`}
            variants={cardVariants}
          >
            <motion.h2 className="text-xl font-semibold mb-4 text-center" variants={cardVariants}>
              MODEL INPUTS
            </motion.h2>
            <motion.div className="flex justify-between items-center mb-4" variants={cardVariants}>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                <h3 className="text-lg font-semibold">{selectedInputCategory.toUpperCase()}</h3>
              </div>
              <div className="relative">
                <select
                  value={selectedInputCategory}
                  onChange={(e) =>
                    setSelectedInputCategory(e.target.value as "Marketing Spend" | "Sales Conversion" | "Customer Service")
                  }
                  className={`px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2 ${
                    theme === "black"
                      ? "bg-gray-700 text-gray-200 border-gray-600"
                      : "bg-gray-200 text-gray-800 border-gray-400"
                  } appearance-none focus:outline-none focus:ring-2 focus:ring-green-500`}
                >
                  <option value="Marketing Spend">Marketing Spend</option>
                  <option value="Sales Conversion">Sales Conversion</option>
                  <option value="Customer Service">Customer Service</option>
                </select>
                <span className="inline-block w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-green-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"></span>
              </div>
            </motion.div>
            <motion.div className="overflow-x-auto mb-6" variants={cardVariants}>
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${theme === "black" ? "bg-gray-700" : "bg-gray-200"}`}>
                    <th className="p-3 text-left">SELECTED IMPACT</th>
                    {tableHeaders.map((header, index) => (
                      <th key={index} className="p-3 text-right">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 flex items-center gap-2">
                      <span className="w-4 h-4 bg-gray-300 rounded-full"></span>
                      Nature of Change
                    </td>
                    {tableHeaders.map((_, index) => (
                      <td key={index} className="p-3 text-right">
                        {editingField === `nature-${index}` ? (
                          <input
                            type="text"
                            value={natureOfChange}
                            onChange={(e) => setNatureOfChange(e.target.value)}
                            onBlur={() => setEditingField(null)}
                            className={`w-full px-2 py-1 rounded border ${
                              theme === "black" ? "bg-gray-700 text-white border-gray-600" : "bg-gray-200 text-black border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-green-500`}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:text-green-500"
                            onClick={() => setEditingField(`nature-${index}`)}
                          >
                            {natureOfChange || "Enter value"}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3">Start Date</td>
                    {tableHeaders.map((_, index) => (
                      <td key={index} className="p-3 text-right">
                        {editingField === `startDate-${index}` ? (
                          <input
                            type="text"
                            value={modelStartDate}
                            onChange={(e) => setModelStartDate(e.target.value)}
                            onBlur={() => setEditingField(null)}
                            placeholder="YYYY-MM-DD"
                            className={`w-full px-2 py-1 rounded border ${
                              theme === "black" ? "bg-gray-700 text-white border-gray-600" : "bg-gray-200 text-black border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-green-500`}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:text-green-500"
                            onClick={() => setEditingField(`startDate-${index}`)}
                          >
                            {modelStartDate || "Enter date"}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3">End Date</td>
                    {tableHeaders.map((_, index) => (
                      <td key={index} className="p-3 text-right">
                        {editingField === `endDate-${index}` ? (
                          <input
                            type="text"
                            value={modelEndDate}
                            onChange={(e) => setModelEndDate(e.target.value)}
                            onBlur={() => setEditingField(null)}
                            placeholder="YYYY-MM-DD"
                            className={`w-full px-2 py-1 rounded border ${
                              theme === "black" ? "bg-gray-700 text-white border-gray-600" : "bg-gray-200 text-black border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-green-500`}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:text-green-500"
                            onClick={() => setEditingField(`endDate-${index}`)}
                          >
                            {modelEndDate || "Enter date"}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3">Percentage Change</td>
                    {tableHeaders.map((_, index) => (
                      <td key={index} className="p-3 text-right">
                        {editingField === `percentage-${index}` ? (
                          <input
                            type="text"
                            value={percentageChange}
                            onChange={(e) => setPercentageChange(e.target.value)}
                            onBlur={() => setEditingField(null)}
                            placeholder="e.g., 10%"
                            className={`w-full px-2 py-1 rounded border ${
                              theme === "black" ? "bg-gray-700 text-white border-gray-600" : "bg-gray-200 text-black border-gray-300"
                            } focus:outline-none focus:ring-2 focus:ring-green-500`}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:text-green-500"
                            onClick={() => setEditingField(`percentage-${index}`)}
                          >
                            {percentageChange || "Enter percentage"}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3">{selectedInputCategory} - Last Month</td>
                    {marketingSpendFiltered.map((data, index) => (
                      <td key={index} className="p-3 text-right">
                        ${data.value.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </motion.div>
            <motion.div className="flex items-center justify-between mb-4" variants={cardVariants}>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{selectedInputCategory}</h3>
              </div>
              <div className="flex gap-2">
                <motion.button
                  onClick={() => downloadChart("marketingSpendChart", `${selectedInputCategory}_Chart`)}
                  className="p-1 hover:bg-green-500 hover:text-white rounded transition-colors"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Download size={16} />
                </motion.button>
                <motion.button
                  onClick={() => resetChartData("marketingSpend")}
                  className="p-1 hover:bg-green-500 hover:text-white rounded transition-colors"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <RotateCcw size={16} />
                </motion.button>
                <motion.button
                  onClick={() => setIsPredictMode((prev) => ({ ...prev, marketingSpend: !prev.marketingSpend }))}
                  className={`p-1 rounded transition-colors ${
                    isPredictMode.marketingSpend ? "bg-green-500 text-white" : "hover:bg-green-500 hover:text-white"
                  }`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <TrendingUp size={16} />
                </motion.button>
              </div>
            </motion.div>
            <motion.div className="h-48" variants={cardVariants}>
              <canvas id="marketingSpendChart"></canvas>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Dropdown Sections with Tables */}
        <motion.section className="mb-12" initial="hidden" animate="visible" variants={sectionVariants}>
          <motion.div
            className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 ${
              theme === "black" ? "bg-gray-800" : "bg-white"
            } border ${theme === "black" ? "border-gray-700" : "border-gray-200"}`}
            variants={cardVariants}
          >
            <motion.div className="mb-6" variants={cardVariants}>
              <motion.button
                onClick={() => {
                  setIsMarketingOpen(!isMarketingOpen);
                  setSelectedInputCategory("Marketing Spend");
                }}
                className="flex items-center gap-2 w-full text-xl font-semibold"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                MARKETING
                <span
                  className={`inline-block w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${
                    theme === "black" ? "border-t-white" : "border-t-gray-800"
                  } transform ${isMarketingOpen ? "rotate-180" : ""}`}
                ></span>
              </motion.button>
              <AnimatePresence>
                {isMarketingOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 overflow-hidden"
                  >
                    <h3 className="text-sm font-semibold mb-2">MARKETING STRATEGY</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className={`${theme === "black" ? "bg-gray-700" : "bg-gray-200"}`}>
                            <th className="p-3 text-left">Strategy</th>
                            <th className="p-3 text-left">Parameter</th>
                            {tableHeaders.map((header, index) => (
                              <th key={index} className="p-3 text-right">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {strategyData.map((strategy, index) => (
                            <tr key={index}>
                              <td className="p-3">{strategy.strategy}</td>
                              <td className="p-3">{strategy.parameter}</td>
                              {strategy.values.map((value, idx) => (
                                <td key={idx} className={`p-3 text-right ${idx >= 5 ? "bg-blue-100" : ""}`}>
                                  ${value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div className="mb-6" variants={cardVariants}>
              <motion.button
                onClick={() => {
                  setIsSalesOpen(!isSalesOpen);
                  setSelectedInputCategory("Sales Conversion");
                }}
                className="flex items-center gap-2 w-full text-xl font-semibold"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                SALES CONVERSION
                <span
                  className={`inline-block w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${
                    theme === "black" ? "border-t-white" : "border-t-gray-800"
                  } transform ${isSalesOpen ? "rotate-180" : ""}`}
                ></span>
              </motion.button>
              <AnimatePresence>
                {isSalesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 overflow-hidden"
                  >
                    <h3 className="text-sm font-semibold mb-2">SALES STRATEGY</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className={`${theme === "black" ? "bg-gray-700" : "bg-gray-200"}`}>
                            <th className="p-3 text-left">Strategy</th>
                            <th className="p-3 text-left">Parameter</th>
                            {tableHeaders.map((header, index) => (
                              <th key={index} className="p-3 text-right">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {strategyData.map((strategy, index) => (
                            <tr key={index}>
                              <td className="p-3">{strategy.strategy}</td>
                              <td className="p-3">{strategy.parameter}</td>
                              {strategy.values.map((value, idx) => (
                                <td key={idx} className={`p-3 text-right ${idx >= 5 ? "bg-blue-100" : ""}`}>
                                  ${value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div className="mb-6" variants={cardVariants}>
              <motion.button
                onClick={() => {
                  setIsCustomerServiceOpen(!isCustomerServiceOpen);
                  setSelectedInputCategory("Customer Service");
                }}
                className="flex items-center gap-2 w-full text-xl font-semibold"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                CUSTOMER SERVICE
                <span
                  className={`inline-block w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent ${
                    theme === "black" ? "border-t-white" : "border-t-gray-800"
                  } transform ${isCustomerServiceOpen ? "rotate-180" : ""}`}
                ></span>
              </motion.button>
              <AnimatePresence>
                {isCustomerServiceOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 overflow-hidden"
                  >
                    <h3 className="text-sm font-semibold mb-2">CUSTOMER SERVICE STRATEGY</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className={`${theme === "black" ? "bg-gray-700" : "bg-gray-200"}`}>
                            <th className="p-3 text-left">Strategy</th>
                            <th className="p-3 text-left">Parameters</th>
                            {tableHeaders.map((header, index) => (
                              <th key={index} className="p-3 text-right">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {strategyData.map((strategy, index) => (
                            <tr key={index}>
                              <td className="p-3">{strategy.strategy}</td>
                              <td className="p-3">{strategy.parameter}</td>
                              {strategy.values.map((value, idx) => (
                                <td key={idx} className={`p-3 text-right ${idx >= 5 ? "bg-blue-100" : ""}`}>
                                  ${value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.section>
      </main>
    </div>
  );
}