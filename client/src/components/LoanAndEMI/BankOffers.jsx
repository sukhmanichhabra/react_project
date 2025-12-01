import React from "react";

const BankOffers = () => {
    return (
        <div className="bank-offers-container">
            <div className="offers-header">
                <h2>
                    Home Loan Offers <span className="new-tag">New Schemes</span>
                </h2>
                <p className="offers-subtitle">
                    Get personalised home loan offers from top banks in{" "}
                    <strong>just 2 mins...</strong>
                </p>
            </div>

            <div className="loan-stats">
                <div className="stat-pill">Loan req. - ₹50,00,000</div>
                <div className="stat-pill">Credit Score - 820</div>
                <div className="stat-pill">Ongoing EMI. - ₹10,000</div>
                <div className="stat-pill">Monthly Income - ₹1,00,000</div>
            </div>

            <div className="banks-carousel">
                {/* SBI */}
                <div className="bank-card">
                    <div className="bank-header">
                        <img src="/assets/sbi-logo.png" alt="SBI" className="bank-logo" />
                        <h3>State Bank of India</h3>
                    </div>
                    <div className="loan-details">
                        <div className="detail-item">
                            <span className="value">8.5%</span>
                            <span className="label">Interest</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">₹50L</span>
                            <span className="label">Loan Amount</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">30 Yr</span>
                            <span className="label">Tenure</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">₹38.4K</span>
                            <span className="label">Monthly EMI</span>
                        </div>
                    </div>
                    <div className="disbursement-info">
                        Get Loan disbursed under <strong>18 Days</strong>
                    </div>
                    <div className="reward-section">
                        <div className="reward-amount">
                            <span className="upto">UPTO</span>
                            <span className="amount">₹10,000</span>
                            <span className="text">Cash Reward</span>
                        </div>
                        <button className="claim-btn">Claim Now</button>
                    </div>
                </div>

                {/* Bank of Maharashtra */}
                <div className="bank-card">
                    <div className="bank-header">
                        <img
                            src="/assets/bom-logo.png"
                            alt="Bank of Maharashtra"
                            className="bank-logo"
                        />
                        <h3>Bank of Maharashtra</h3>
                    </div>
                    <div className="loan-details">
                        <div className="detail-item">
                            <span className="value">8.3%</span>
                            <span className="label">Interest</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">₹1Cr</span>
                            <span className="label">Loan Amount</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">30 Yr</span>
                            <span className="label">Tenure</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">₹75.5K</span>
                            <span className="label">Monthly EMI</span>
                        </div>
                    </div>
                    <div className="disbursement-info">
                        Get Loan disbursed under <strong>18 Days</strong>
                    </div>
                    <div className="reward-section">
                        <div className="reward-amount">
                            <span className="upto">UPTO</span>
                            <span className="amount">₹20,000</span>
                            <span className="text">Cash Reward</span>
                        </div>
                        <button className="claim-btn">Claim Now</button>
                    </div>
                </div>

                {/* HDFC Bank */}
                <div className="bank-card">
                    <div className="bank-header">
                        <img
                            src="/assets/hdfc-logo.png"
                            alt="HDFC Bank"
                            className="bank-logo"
                        />
                        <h3>HDFC Bank</h3>
                    </div>
                    <div className="loan-details">
                        <div className="detail-item">
                            <span className="value">8.4%</span>
                            <span className="label">Interest</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">₹75L</span>
                            <span className="label">Loan Amount</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">25 Yr</span>
                            <span className="label">Tenure</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">₹58.2K</span>
                            <span className="label">Monthly EMI</span>
                        </div>
                    </div>
                    <div className="disbursement-info">
                        Get Loan disbursed under <strong>15 Days</strong>
                    </div>
                    <div className="reward-section">
                        <div className="reward-amount">
                            <span className="upto">UPTO</span>
                            <span className="amount">₹14,000</span>
                            <span className="text">Cash Reward</span>
                        </div>
                        <button className="claim-btn">Claim Now</button>
                    </div>
                </div>

                {/* ICICI Bank */}
                <div className="bank-card">
                    <div className="bank-header">
                        <img
                            src="/assets/icici-logo.png"
                            alt="ICICI Bank"
                            className="bank-logo"
                        />
                        <h3>ICICI Bank</h3>
                    </div>
                    <div className="loan-details">
                        <div className="detail-item">
                            <span className="value">8.6%</span>
                            <span className="label">Interest</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">₹60L</span>
                            <span className="label">Loan Amount</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">30 Yr</span>
                            <span className="label">Tenure</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">₹46.5K</span>
                            <span className="label">Monthly EMI</span>
                        </div>
                    </div>
                    <div className="disbursement-info">
                        Get Loan disbursed under <strong>20 Days</strong>
                    </div>
                    <div className="reward-section">
                        <div className="reward-amount">
                            <span className="upto">UPTO</span>
                            <span className="amount">₹15,000</span>
                            <span className="text">Cash Reward</span>
                        </div>
                        <button className="claim-btn">Claim Now</button>
                    </div>
                </div>

                {/* Axis Bank */}
                <div className="bank-card">
                    <div className="bank-header">
                        <img
                            src="/assets/axis-logo.png"
                            alt="Axis Bank"
                            className="bank-logo"
                        />
                        <h3>Axis Bank</h3>
                    </div>
                    <div className="loan-details">
                        <div className="detail-item">
                            <span className="value">8.7%</span>
                            <span className="label">Interest</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">₹80L</span>
                            <span className="label">Loan Amount</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">28 Yr</span>
                            <span className="label">Tenure</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">₹63.2K</span>
                            <span className="label">Monthly EMI</span>
                        </div>
                    </div>
                    <div className="disbursement-info">
                        Get Loan disbursed under <strong>21 Days</strong>
                    </div>
                    <div className="reward-section">
                        <div className="reward-amount">
                            <span className="upto">UPTO</span>
                            <span className="amount">₹12,000</span>
                            <span className="text">Cash Reward</span>
                        </div>
                        <button className="claim-btn">Claim Now</button>
                    </div>
                </div>

                {/* Punjab National Bank */}
                <div className="bank-card">
                    <div className="bank-header">
                        <img
                            src="/assets/pnb-logo.png"
                            alt="Punjab National Bank"
                            className="bank-logo"
                        />
                        <h3>Punjab National Bank</h3>
                    </div>
                    <div className="loan-details">
                        <div className="detail-item">
                            <span className="value">8.5%</span>
                            <span className="label">Interest</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">₹45L</span>
                            <span className="label">Loan Amount</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">25 Yr</span>
                            <span className="label">Tenure</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">₹35.1K</span>
                            <span className="label">Monthly EMI</span>
                        </div>
                    </div>
                    <div className="disbursement-info">
                        Get Loan disbursed under <strong>22 Days</strong>
                    </div>
                    <div className="reward-section">
                        <div className="reward-amount">
                            <span className="upto">UPTO</span>
                            <span className="amount">₹8,000</span>
                            <span className="text">Cash Reward</span>
                        </div>
                        <button className="claim-btn">Claim Now</button>
                    </div>
                </div>

                {/* Bank of Baroda */}
                <div className="bank-card">
                    <div className="bank-header">
                        <img
                            src="/assets/bob-logo.png"
                            alt="Bank of Baroda"
                            className="bank-logo"
                        />
                        <h3>Bank of Baroda</h3>
                    </div>
                    <div className="loan-details">
                        <div className="detail-item">
                            <span className="value">8.4%</span>
                            <span className="label">Interest</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">₹65L</span>
                            <span className="label">Loan Amount</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">30 Yr</span>
                            <span className="label">Tenure</span>
                        </div>
                        <div className="detail-item">
                            <span className="value">₹49.8K</span>
                            <span className="label">Monthly EMI</span>
                        </div>
                    </div>
                    <div className="disbursement-info">
                        Get Loan disbursed under <strong>19 Days</strong>
                    </div>
                    <div className="reward-section">
                        <div className="reward-amount">
                            <span className="upto">UPTO</span>
                            <span className="amount">₹11,000</span>
                            <span className="text">Cash Reward</span>
                        </div>
                        <button className="claim-btn">Claim Now</button>
                    </div>
                </div>
            </div>

            <div className="explore-more">
                <button className="explore-btn">Explore More Offers</button>
            </div>
        </div>
    );
};

export default BankOffers;
