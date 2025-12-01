import React from "react";

const LoanInfo = () => {
    return (
        <div className="loan-info-container">
            <h1>Home Loan EMI Calculator</h1>

            <div className="info-section">
                <p className="description">
                    A home loan EMI calculator is a tool that helps you calculate your
                    monthly instalments (EMIs) with just one click. Home loan calculator
                    is really helpful and can be used easily by any individual who wants
                    to know their Home Loan EMIs in advance.
                </p>

                <p className="instruction">
                    To calculate your Home loan EMI, you need to enter the loan amount,
                    interest rate, and the tenure of the loan.
                </p>
            </div>

            <div className="info-section">
                <h2>What is Home Loan EMI?</h2>
                <p>
                    The fixed monthly payment that you make to the lender during the loan
                    term to repay a Home Loan is the EMI. The main amount and the loan
                    interest are its two constituent parts. It is easier for borrowers to
                    plan their budget because the EMI stays the same throughout the loan.
                    However, with time, the principal and interest ratio varies, with the
                    interest component being larger in the early years.
                </p>
            </div>

            <div className="info-section">
                <h2>Apply for a Home Loan and Calculate Your Home Loan EMI</h2>
                <p>
                    It's essential to know how much EMI you can pay before applying for a
                    house loan. To obtain an estimate based on your preferred loan amount,
                    interest rate, and tenure, utilize the Home Loan EMI Calculator.
                    Knowing that your repayment plan will fit into your budget after you
                    have a clear understanding of your EMI will give you the confidence to
                    apply for a house loan.
                </p>
            </div>
        </div>
    );
};

export default LoanInfo;
