import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const EMIResult = ({ emi, loanAmount, totalInterest }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext("2d");

            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            chartInstance.current = new Chart(ctx, {
                type: "doughnut",
                data: {
                    labels: ["Principal Amount", "Interest Amount"],
                    datasets: [
                        {
                            data: [loanAmount, totalInterest],
                            backgroundColor: ["#00A19C", "#FFB800"],
                            borderWidth: 0,
                        },
                    ],
                },
                options: {
                    cutout: "70%",
                    plugins: {
                        legend: {
                            display: false,
                        },
                    },
                },
            });
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [loanAmount, totalInterest]);

    return (
        <div className="result-section">
            <div className="emi-result">
                <h2>You are Eligible for EMI Amount</h2>
                <h1 className="emi-amount">₹<span id="emi">{emi.toLocaleString("en-IN")}</span></h1>
            </div>

            <div className="chart-container">
                <canvas ref={chartRef} id="emiChart"></canvas>
            </div>

            <div className="amount-details">
                <div className="principal">
                    <span className="dot principal-dot"></span>
                    Principal Amount
                    <span className="amount" id="principalAmount">
                        ₹{loanAmount.toLocaleString("en-IN")}
                    </span>
                </div>
                <div className="interest">
                    <span className="dot interest-dot"></span>
                    Interest Amount
                    <span className="amount" id="interestAmount">
                        ₹{totalInterest.toLocaleString("en-IN")}
                    </span>
                </div>
            </div>

            <div className="bank-offers">
                <h3>Top Banks home loan Offers</h3>
                <div className="bank-cards">
                    <div className="bank-card">
                        <img src="/assets/bob-logo.png" alt="Bank of Baroda" className="bank-logo" />
                        <div className="bank-info">
                            <h4>Bank of Baroda</h4>
                            <p>Rate 8.4% | Max Term 30yrs</p>
                        </div>
                        <button className="view-btn">View</button>
                    </div>
                    <div className="bank-card">
                        <img src="/assets/sbi-logo.png" alt="State Bank of India" className="bank-logo" />
                        <div className="bank-info">
                            <h4>State Bank of India</h4>
                            <p>Rate 8.5% | Max Term 30yrs</p>
                        </div>
                        <button className="view-btn">View</button>
                    </div>
                </div>
                <button className="check-offers-btn">Check Bank Offers</button>
            </div>
        </div>
    );
};

export default EMIResult;
