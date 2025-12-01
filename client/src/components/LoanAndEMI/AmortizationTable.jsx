import React, { useState, useEffect } from "react";

const AmortizationTable = ({ schedule }) => {
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [yearData, setYearData] = useState([]);

    useEffect(() => {
        const data = schedule.filter((row) => row.year === currentYear);
        setYearData(data);
    }, [schedule, currentYear]);

    const changeYear = (delta) => {
        const newYear = currentYear + delta;
        const hasData = schedule.some((row) => row.year === newYear);

        if (hasData) {
            setCurrentYear(newYear);
        }
    };

    return (
        <div className="amortization-table-container">
            <h2>Your Repayment Details</h2>
            <div className="year-navigation">
                <button id="prevYear" onClick={() => changeYear(-1)}>
                    ←
                </button>
                <span id="currentYear">{currentYear}</span>
                <button id="nextYear" onClick={() => changeYear(1)}>
                    →
                </button>
            </div>
            <div className="table-wrapper">
                <table id="amortizationTable">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Beginning Loan Balance</th>
                            <th>EMI</th>
                            <th>Principal</th>
                            <th>Monthly Interest</th>
                            <th>Outstanding Balances</th>
                        </tr>
                    </thead>
                    <tbody>
                        {yearData.map((row, index) => (
                            <tr key={index}>
                                <td>{row.month}</td>
                                <td>₹{Math.round(row.beginningBalance).toLocaleString("en-IN")}</td>
                                <td>₹{Math.round(row.emi).toLocaleString("en-IN")}</td>
                                <td>₹{Math.round(row.principal).toLocaleString("en-IN")}</td>
                                <td>₹{Math.round(row.interest).toLocaleString("en-IN")}</td>
                                <td>₹{Math.round(row.endingBalance).toLocaleString("en-IN")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AmortizationTable;
