import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "./OverviewCharts.css"; // <-- IMPORT THE NEW CSS

const OverviewCharts = ({ userRole, chartData }) => {
  const salesChartRef = useRef(null);
  const viewsChartRef = useRef(null);
  const propertyTypesChartRef = useRef(null);
  const inquiriesChartRef = useRef(null);

  useEffect(() => {
    const charts = [];

    // Chart 1: Sales Overview (Line Chart)
    if (salesChartRef.current) {
      const salesCtx = salesChartRef.current.getContext("2d");
      charts.push(
        new Chart(salesCtx, {
          type: "line",
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
              {
                label: "Sales ($)",
                data: [70000, 85000, 79000, 81000, 100000, 130000],
                borderColor: "#3b82f6", // Blue
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.4,
              },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false },
        })
      );
    }

    // Chart 2: Property Views (Bar Chart)
    if (viewsChartRef.current) {
      const viewsCtx = viewsChartRef.current.getContext("2d");
      charts.push(
        new Chart(viewsCtx, {
          type: "bar",
          data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [
              {
                label: "Views",
                data: [150, 230, 180, 290, 200, 250, 300],
                backgroundColor: "#22c55e", // Green
                borderRadius: 4,
              },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false },
        })
      );
    }

    // Chart 3: Property Types (Doughnut Chart)
    if (propertyTypesChartRef.current) {
      const typesCtx = propertyTypesChartRef.current.getContext("2d");
      charts.push(
        new Chart(typesCtx, {
          type: "doughnut",
          data: {
            labels: ["Houses", "Apartments", "Villas", "Cottages", "Lofts"],
            datasets: [
              {
                data: [40, 25, 15, 10, 10],
                backgroundColor: [
                  "#3b82f6",
                  "#22c55e",
                  "#f97316",
                  "#ec4899",
                  "#a855f7",
                ],
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
              },
            },
          },
        })
      );
    }

    // Chart 4: Monthly Inquiries (Line Chart)
    if (inquiriesChartRef.current) {
      const inquiriesCtx = inquiriesChartRef.current.getContext("2d");
      charts.push(
        new Chart(inquiriesCtx, {
          type: "line",
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
              {
                label: "Inquiries",
                data: [60, 80, 70, 85, 90, 110],
                borderColor: "#a855f7", // Purple
                backgroundColor: "rgba(168, 85, 247, 0.1)",
                fill: true,
                tension: 0.4,
              },
            ],
          },
          options: { responsive: true, maintainAspectRatio: false },
        })
      );
    }

    // Cleanup charts on component unmount
    return () => {
      charts.forEach((chart) => chart.destroy());
    };
  }, [userRole, chartData]); // Rerun if data changes

  return (
    <div className="dash-charts-grid">
      <div className="dash-chart-container">
        <h3>Sales Overview</h3>
        <div className="dash-chart-canvas-wrapper">
          <canvas ref={salesChartRef}></canvas>
        </div>
      </div>
      <div className="dash-chart-container">
        <h3>Property Views</h3>
        <div className="dash-chart-canvas-wrapper">
          <canvas ref={viewsChartRef}></canvas>
        </div>
      </div>
      <div className="dash-chart-container">
        <h3>Property Types</h3>
        <div className="dash-chart-canvas-wrapper">
          <canvas ref={propertyTypesChartRef}></canvas>
        </div>
      </div>
      <div className="dash-chart-container">
        <h3>Monthly Inquiries</h3>
        <div className="dash-chart-canvas-wrapper">
          <canvas ref={inquiriesChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default OverviewCharts;
