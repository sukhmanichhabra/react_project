import React from "react";

const LoanCategories = ({ onApply }) => {
    return (
        <>
            <div className="pricing-header">
                <h1 className="pricing-title">Choose Us</h1>
                <div className="title-highlight">
                    <span className="highlight-tag">No Collateral Required</span>
                    <h2 className="subtitle">
                        Get Your Dream Home Loan Without Pledging Assets
                    </h2>
                    <p className="title-description">
                        Join thousands of happy homeowners who trusted us for hassle-free home
                        loans with competitive interest rates
                    </p>
                </div>
            </div>
            <div className="loan-categories-container">
                <h2 className="categories-title">Loan Categories & Interest Rates</h2>
                <p className="categories-subtitle">
                    Choose the right loan amount category for your needs
                </p>

                <div className="loan-category-cards">
                    <div className="category-card affordable">
                        <div className="card-header">
                            <div className="loan-amount">
                                <h3>Affordable Home Loan</h3>
                                <div className="amount-range">&lt; ₹50 Lakhs</div>
                            </div>
                            <div className="card-icon">
                                <i className="fas fa-home"></i>
                            </div>
                        </div>

                        <div className="card-details">
                            <div className="detail-row">
                                <div className="detail-label">Interest Rate</div>
                                <div className="detail-value">8.2% - 8.5%</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Processing Fee</div>
                                <div className="detail-value">0.5% of loan amount</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Max Tenure</div>
                                <div className="detail-value">30 Years</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Loan to Value</div>
                                <div className="detail-value">Up to 90%</div>
                            </div>
                        </div>

                        <div className="card-features">
                            <h4>Key Features</h4>
                            <ul>
                                <li>
                                    <i className="fas fa-check-circle"></i> Minimal documentation
                                </li>
                                <li>
                                    <i className="fas fa-check-circle"></i> Quick approval within
                                    3 days
                                </li>
                                <li>
                                    <i className="fas fa-check-circle"></i> No prepayment charges
                                </li>
                            </ul>
                        </div>

                        <button
                            className="apply-now-btn"
                            onClick={() => onApply("affordable")}
                        >
                            Apply Now
                        </button>
                    </div>

                    <div className="category-card premium">
                        <div className="card-header">
                            <div className="loan-amount">
                                <h3>Premium Home Loan</h3>
                                <div className="amount-range">₹50 Lakhs - ₹1 Crore</div>
                            </div>
                            <div className="card-icon">
                                <i className="fas fa-building"></i>
                            </div>
                        </div>

                        <div className="card-details">
                            <div className="detail-row">
                                <div className="detail-label">Interest Rate</div>
                                <div className="detail-value">8.5% - 8.8%</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Processing Fee</div>
                                <div className="detail-value">0.4% of loan amount</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Max Tenure</div>
                                <div className="detail-value">30 Years</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Loan to Value</div>
                                <div className="detail-value">Up to 85%</div>
                            </div>
                        </div>

                        <div className="card-features">
                            <h4>Key Features</h4>
                            <ul>
                                <li>
                                    <i className="fas fa-check-circle"></i> Dedicated relationship
                                    manager
                                </li>
                                <li>
                                    <i className="fas fa-check-circle"></i> Flexible repayment
                                    options
                                </li>
                                <li>
                                    <i className="fas fa-check-circle"></i> Special rates for
                                    women borrowers
                                </li>
                            </ul>
                        </div>

                        <button
                            className="apply-now-btn"
                            onClick={() => onApply("premium")}
                        >
                            Apply Now
                        </button>
                    </div>

                    <div className="category-card luxury">
                        <div className="card-header">
                            <div className="loan-amount">
                                <h3>Luxury Home Loan</h3>
                                <div className="amount-range">&gt; ₹1 Crore</div>
                            </div>
                            <div className="card-icon">
                                <i className="fas fa-gem"></i>
                            </div>
                        </div>

                        <div className="card-details">
                            <div className="detail-row">
                                <div className="detail-label">Interest Rate</div>
                                <div className="detail-value">8.7% - 9.2%</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Processing Fee</div>
                                <div className="detail-value">0.3% of loan amount</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Max Tenure</div>
                                <div className="detail-value">30 Years</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Loan to Value</div>
                                <div className="detail-value">Up to 75%</div>
                            </div>
                        </div>

                        <div className="card-features">
                            <h4>Key Features</h4>
                            <ul>
                                <li>
                                    <i className="fas fa-check-circle"></i> Premium concierge
                                    services
                                </li>
                                <li>
                                    <i className="fas fa-check-circle"></i> Customized repayment
                                    plans
                                </li>
                                <li>
                                    <i className="fas fa-check-circle"></i> Exclusive wealth
                                    management services
                                </li>
                            </ul>
                        </div>

                        <button
                            className="apply-now-btn"
                            onClick={() => onApply("luxury")}
                        >
                            Apply Now
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoanCategories;
