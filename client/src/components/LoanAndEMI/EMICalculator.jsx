import React from "react";

const EMICalculator = ({
    loanAmount,
    setLoanAmount,
    interestRate,
    setInterestRate,
    loanTenure,
    setLoanTenure,
    calculateEMI,
}) => {
    return (
        <div className="calculator-section">
            <div className="input-group">
                <label>Loan Amount</label>
                <div className="input-wrapper">
                    <span className="currency">₹</span>
                    <input
                        type="number"
                        id="loanAmount"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Number(e.target.value))}
                    />
                </div>
            </div>

            <div className="input-row">
                <div className="input-group">
                    <label htmlFor="loanTenure">
                        Loan Tenure: <span id="tenureValue">{loanTenure}</span> yrs
                    </label>
                    <input
                        type="range"
                        id="loanTenure"
                        min="1"
                        max="50"
                        step="1"
                        value={loanTenure}
                        onInput={(e) => setLoanTenure(Number(e.target.value))}
                    />
                </div>

                <div className="input-group">
                    <label>Interest Rate % (p.a.)</label>
                    <input
                        type="number"
                        id="interestRate"
                        value={interestRate}
                        step="0.1"
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                    />
                </div>
            </div>

            <button onClick={calculateEMI} className="recalculate-btn">
                Recalculate Your EMI
            </button>
        </div>
    );
};

export default EMICalculator;
