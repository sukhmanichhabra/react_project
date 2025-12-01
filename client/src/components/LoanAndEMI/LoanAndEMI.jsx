import React, { useState, useEffect } from "react";
import "./LoanAndEMI.css";
import EMICalculator from "./EMICalculator";
import EMIResult from "./EMIResult";
import AmortizationTable from "./AmortizationTable";
import LoanInfo from "./LoanInfo";
import BankOffers from "./BankOffers";
import LoanCategories from "./LoanCategories";
import LoanApplicationForm from "./LoanApplicationForm";

const LoanAndEMI = () => {
    const [loanAmount, setLoanAmount] = useState(8000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTenure, setLoanTenure] = useState(30);
    const [emi, setEmi] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [amortizationSchedule, setAmortizationSchedule] = useState([]);

    const [selectedLoanType, setSelectedLoanType] = useState("");

    const calculateEMI = () => {
        if (!loanAmount || !interestRate || !loanTenure) {
            alert("Please fill all fields");
            return;
        }

        const monthlyInterest = interestRate / 12 / 100;
        const totalMonths = loanTenure * 12;

        const calculatedEmi =
            (loanAmount *
                monthlyInterest *
                Math.pow(1 + monthlyInterest, totalMonths)) /
            (Math.pow(1 + monthlyInterest, totalMonths) - 1);

        const calculatedTotalAmount = calculatedEmi * totalMonths;
        const calculatedTotalInterest = calculatedTotalAmount - loanAmount;

        setEmi(Math.round(calculatedEmi));
        setTotalAmount(Math.round(calculatedTotalAmount));
        setTotalInterest(Math.round(calculatedTotalInterest));

        // Calculate Amortization Schedule
        const schedule = [];
        let balance = loanAmount;
        const startYear = new Date().getFullYear();

        for (let i = 0; i < totalMonths; i++) {
            const interest = balance * monthlyInterest;
            const principal = calculatedEmi - interest;
            const newBalance = balance - principal;

            schedule.push({
                year: startYear + Math.floor(i / 12),
                month: new Date(2024, i % 12).toLocaleString("default", {
                    month: "long",
                }),
                beginningBalance: balance,
                emi: calculatedEmi,
                principal: principal,
                interest: interest,
                endingBalance: newBalance > 0 ? newBalance : 0,
            });

            balance = newBalance;
        }
        setAmortizationSchedule(schedule);
    };

    useEffect(() => {
        calculateEMI();
    }, []); // Run once on mount

    const scrollToApplication = (type) => {
        setSelectedLoanType(type);
        const element = document.getElementById("loanApplicationSection");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="loan-and-emi-container">
            <div className="container">
                <h1>Home Loan EMI Calculator</h1>
                <p className="description">
                    Home Loan EMI Calculator provides an instant estimate of your EMI by
                    requiring the loan amount, interest rate, and loan tenure. This
                    ensures manageable debt repayment and aids in budget planning.
                </p>

                <div className="calculator-container">
                    <EMICalculator
                        loanAmount={loanAmount}
                        setLoanAmount={setLoanAmount}
                        interestRate={interestRate}
                        setInterestRate={setInterestRate}
                        loanTenure={loanTenure}
                        setLoanTenure={setLoanTenure}
                        calculateEMI={calculateEMI}
                    />
                    <EMIResult
                        emi={emi}
                        loanAmount={loanAmount}
                        totalInterest={totalInterest}
                    />
                </div>
            </div>

            <AmortizationTable schedule={amortizationSchedule} />
            <LoanInfo />
            <BankOffers />
            <LoanCategories onApply={scrollToApplication} />
            <LoanApplicationForm selectedLoanType={selectedLoanType} />
        </div>
    );
};

export default LoanAndEMI;
