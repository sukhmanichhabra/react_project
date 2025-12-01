import React, { useState, useEffect } from "react";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";

const LoanApplicationForm = ({ selectedLoanType }) => {
    const { user } = useAppSelector(selectAuth);
    const [formData, setFormData] = useState({
        fullName: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        dob: "",
        maritalStatus: "",
        employmentType: "",
        monthlyIncome: "",
        workExperience: "",
        employerName: "",
        designation: "",
        loanAmount: "",
        loanTenure: "",
        propertyType: "",
        loanType: "",
        propertyValue: "",
        propertyAddress: "",
        terms: false,
    });

    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null); // null, 'loading', 'success', 'error'
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        if (selectedLoanType) {
            setFormData((prev) => ({
                ...prev,
                loanType: selectedLoanType,
            }));
        }
    }, [selectedLoanType]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("animate");
                    }
                });
            },
            { threshold: 0.1 }
        );

        const section = document.getElementById("loanApplicationSection");
        if (section) {
            observer.observe(section);
        }

        return () => {
            if (section) {
                observer.unobserve(section);
            }
        };
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required";
            isValid = false;
        } else if (formData.fullName.trim().length < 3) {
            newErrors.fullName = "Name must be at least 3 characters long";
            isValid = false;
        } else if (!/^[a-zA-Z\s]{3,50}$/.test(formData.fullName.trim())) {
            newErrors.fullName = "Name should contain only letters and spaces (3-50 characters)";
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "Email address is required";
            isValid = false;
        } else if (!emailRegex.test(formData.email.trim())) {
            newErrors.email = "Please enter a valid email address";
            isValid = false;
        }

        const phoneRegex = /^\d{10}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
            isValid = false;
        } else if (!phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
            newErrors.phone = "Please enter a valid 10-digit phone number";
            isValid = false;
        }

        if (!formData.dob) {
            newErrors.dob = "Date of birth is required";
            isValid = false;
        } else {
            const dobDate = new Date(formData.dob);
            const today = new Date();
            let age = today.getFullYear() - dobDate.getFullYear();
            const monthDiff = today.getMonth() - dobDate.getMonth();
            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < dobDate.getDate())
            ) {
                age--;
            }
            if (age < 21 || age > 65) {
                newErrors.dob = "Age must be between 21 and 65 years";
                isValid = false;
            }
        }

        if (!formData.monthlyIncome) {
            newErrors.monthlyIncome = "Monthly income is required";
            isValid = false;
        } else if (Number(formData.monthlyIncome) < 10000) {
            newErrors.monthlyIncome = "Monthly income must be at least ₹10,000";
            isValid = false;
        } else if (Number(formData.monthlyIncome) > 10000000) {
            newErrors.monthlyIncome = "Monthly income cannot exceed ₹1 Crore";
            isValid = false;
        }

        if (!formData.workExperience) {
            newErrors.workExperience = "Work experience is required";
            isValid = false;
        } else if (Number(formData.workExperience) < 1) {
            newErrors.workExperience = "Minimum 1 year of work experience required";
            isValid = false;
        } else if (Number(formData.workExperience) > 40) {
            newErrors.workExperience = "Work experience cannot exceed 40 years";
            isValid = false;
        }

        if (!formData.loanAmount) {
            newErrors.loanAmount = "Loan amount is required";
            isValid = false;
        } else if (Number(formData.loanAmount) < 100000) {
            newErrors.loanAmount = "Loan amount must be at least ₹1 Lakh";
            isValid = false;
        } else if (Number(formData.loanAmount) > 10000000) {
            newErrors.loanAmount = "Loan amount cannot exceed ₹1 Crore";
            isValid = false;
        }

        if (!formData.loanTenure) {
            newErrors.loanTenure = "Loan tenure is required";
            isValid = false;
        } else if (Number(formData.loanTenure) < 1) {
            newErrors.loanTenure = "Loan tenure must be at least 1 year";
            isValid = false;
        } else if (Number(formData.loanTenure) > 30) {
            newErrors.loanTenure = "Loan tenure cannot exceed 30 years";
            isValid = false;
        }

        if (!formData.loanType) {
            newErrors.loanType = "Please select a loan type";
            isValid = false;
        }

        if (!formData.employmentType) {
            newErrors.employmentType = "Please select employment type";
            isValid = false;
        }

        if (!formData.terms) {
            newErrors.terms = "You must agree to the terms and conditions";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setStatus("loading");
        setStatusMessage("Submitting your application...");

        try {
            // Create FormData object for file uploads
            const submissionData = new FormData();
            Object.keys(formData).forEach((key) => {
                submissionData.append(key, formData[key]);
            });

            // Append files
            const fileInputs = document.querySelectorAll('input[type="file"]');
            fileInputs.forEach((input) => {
                if (input.files.length > 0) {
                    for (let i = 0; i < input.files.length; i++) {
                        submissionData.append(input.name, input.files[i]);
                    }
                }
            });

            // Mock API call - replace with actual API call
            // const response = await axios.post("/loan/apply", submissionData);

            // Simulating success for now as backend might not be ready
            await new Promise(resolve => setTimeout(resolve, 2000));

            setStatus("success");
            setStatusMessage("Application Submitted Successfully!");

            // Reset form
            setFormData({
                fullName: user?.name || "",
                email: user?.email || "",
                phone: user?.phone || "",
                dob: "",
                maritalStatus: "",
                employmentType: "",
                monthlyIncome: "",
                workExperience: "",
                employerName: "",
                designation: "",
                loanAmount: "",
                loanTenure: "",
                propertyType: "",
                loanType: "",
                propertyValue: "",
                propertyAddress: "",
                terms: false,
            });

        } catch (error) {
            console.error("Error submitting loan application:", error);
            setStatus("error");
            setStatusMessage("There was an error submitting your application. Please try again.");
        }
    };

    return (
        <div className="loan-application-container" id="loanApplicationSection">
            <div className="application-header">
                <h2>Apply for Home Loan</h2>
                <p>Fill in your details and get instant approval</p>
            </div>

            {user ? (
                <form
                    id="loanApplicationForm"
                    className="loan-form"
                    encType="multipart/form-data"
                    onSubmit={handleSubmit}
                >
                    <div className="form-grid">
                        {/* Personal Information */}
                        <div className="form-section">
                            <h3>Personal Information</h3>
                            <div className={`input-group ${errors.fullName ? "error" : ""}`}>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                                <label htmlFor="fullName">Full Name</label>
                                <span className={`error-message ${errors.fullName ? "show" : ""}`}>
                                    {errors.fullName}
                                </span>
                            </div>
                            <div className="input-row">
                                <div className={`input-group ${errors.email ? "error" : ""}`}>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="email">Email Address</label>
                                    <span className={`error-message ${errors.email ? "show" : ""}`}>
                                        {errors.email}
                                    </span>
                                </div>
                                <div className={`input-group ${errors.phone ? "error" : ""}`}>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="phone">Phone Number</label>
                                    <span className={`error-message ${errors.phone ? "show" : ""}`}>
                                        {errors.phone}
                                    </span>
                                </div>
                            </div>
                            <div className="input-row">
                                <div className={`input-group ${errors.dob ? "error" : ""}`}>
                                    <input
                                        type="date"
                                        id="dob"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="dob">Date of Birth</label>
                                    <span className={`error-message ${errors.dob ? "show" : ""}`}>
                                        {errors.dob}
                                    </span>
                                </div>
                                <div className="input-group">
                                    <select
                                        id="maritalStatus"
                                        name="maritalStatus"
                                        value={formData.maritalStatus}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Status</option>
                                        <option value="single">Single</option>
                                        <option value="married">Married</option>
                                        <option value="divorced">Divorced</option>
                                    </select>
                                    <label htmlFor="maritalStatus">Marital Status</label>
                                </div>
                            </div>
                        </div>

                        {/* Employment Details */}
                        <div className="form-section">
                            <h3>Employment Details</h3>
                            <div className={`input-group ${errors.employmentType ? "error" : ""}`}>
                                <select
                                    id="employmentType"
                                    name="employmentType"
                                    value={formData.employmentType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="salaried">Salaried</option>
                                    <option value="self-employed">Self Employed</option>
                                    <option value="business">Business Owner</option>
                                </select>
                                <label htmlFor="employmentType">Employment Type</label>
                                <span className={`error-message ${errors.employmentType ? "show" : ""}`}>
                                    {errors.employmentType}
                                </span>
                            </div>
                            <div className="input-row">
                                <div className={`input-group ${errors.monthlyIncome ? "error" : ""}`}>
                                    <input
                                        type="number"
                                        id="monthlyIncome"
                                        name="monthlyIncome"
                                        value={formData.monthlyIncome}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="monthlyIncome">Monthly Income (₹)</label>
                                    <span className={`error-message ${errors.monthlyIncome ? "show" : ""}`}>
                                        {errors.monthlyIncome}
                                    </span>
                                </div>
                                <div className={`input-group ${errors.workExperience ? "error" : ""}`}>
                                    <input
                                        type="number"
                                        id="workExperience"
                                        name="workExperience"
                                        value={formData.workExperience}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="workExperience">Work Experience (Years)</label>
                                    <span className={`error-message ${errors.workExperience ? "show" : ""}`}>
                                        {errors.workExperience}
                                    </span>
                                </div>
                            </div>
                            <div className="input-row">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        id="employerName"
                                        name="employerName"
                                        value={formData.employerName}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="employerName">Employer/Company Name</label>
                                </div>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        id="designation"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="designation">Designation/Role</label>
                                </div>
                            </div>
                        </div>

                        {/* Loan Requirements */}
                        <div className="form-section">
                            <h3>Loan Requirements</h3>
                            <div className="input-row">
                                <div className={`input-group ${errors.loanAmount ? "error" : ""}`}>
                                    <input
                                        type="number"
                                        id="loanAmount"
                                        name="loanAmount"
                                        value={formData.loanAmount}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="loanAmount">Loan Amount (₹)</label>
                                    <span className={`error-message ${errors.loanAmount ? "show" : ""}`}>
                                        {errors.loanAmount}
                                    </span>
                                </div>
                                <div className={`input-group ${errors.loanTenure ? "error" : ""}`}>
                                    <input
                                        type="number"
                                        id="loanTenure"
                                        name="loanTenure"
                                        value={formData.loanTenure}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label htmlFor="loanTenure">Loan Tenure (Years)</label>
                                    <span className={`error-message ${errors.loanTenure ? "show" : ""}`}>
                                        {errors.loanTenure}
                                    </span>
                                </div>
                            </div>
                            <div className="input-row">
                                <div className="input-group">
                                    <select
                                        id="propertyType"
                                        name="propertyType"
                                        value={formData.propertyType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        <option value="apartment">Apartment</option>
                                        <option value="independent">Independent House</option>
                                        <option value="villa">Villa</option>
                                        <option value="plot">Plot</option>
                                    </select>
                                    <label htmlFor="propertyType">Property Type</label>
                                </div>
                                <div className={`input-group ${errors.loanType ? "error" : ""}`}>
                                    <select
                                        id="loanType"
                                        name="loanType"
                                        value={formData.loanType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Loan Type</option>
                                        <option value="affordable">Affordable Home Loan (&lt; ₹50L)</option>
                                        <option value="premium">Premium Home Loan (₹50L - ₹1Cr)</option>
                                        <option value="luxury">Luxury Home Loan (&gt; ₹1Cr)</option>
                                        <option value="construction">Home Construction Loan</option>
                                        <option value="renovation">Home Renovation Loan</option>
                                    </select>
                                    <label htmlFor="loanType">Home Loan Type</label>
                                    <span className={`error-message ${errors.loanType ? "show" : ""}`}>
                                        {errors.loanType}
                                    </span>
                                </div>
                            </div>
                            <div className="input-row">
                                <div className="input-group">
                                    <input
                                        type="number"
                                        id="propertyValue"
                                        name="propertyValue"
                                        value={formData.propertyValue}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="propertyValue">Property Value (₹)</label>
                                </div>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        id="propertyAddress"
                                        name="propertyAddress"
                                        value={formData.propertyAddress}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="propertyAddress">Property Address</label>
                                </div>
                            </div>
                        </div>

                        {/* Document Uploads */}
                        <div className="form-section">
                            <h3>Document Uploads</h3>
                            <p className="upload-info">
                                Please upload clear scans or photos of your documents (PDF or
                                JPG/PNG format, max 5MB each)
                            </p>

                            <div className="document-group">
                                <div className="document-row">
                                    <div className="document-item">
                                        <label className="document-label">
                                            Identity Proof (Aadhar/PAN)*
                                        </label>
                                        <input
                                            type="file"
                                            id="identityProof"
                                            name="identityProof"
                                            accept=".pdf,image/*"
                                            required
                                        />
                                        <div className="file-info">No file chosen</div>
                                    </div>
                                    <div className="document-item">
                                        <label className="document-label">Address Proof*</label>
                                        <input
                                            type="file"
                                            id="addressProof"
                                            name="addressProof"
                                            accept=".pdf,image/*"
                                            required
                                        />
                                        <div className="file-info">No file chosen</div>
                                    </div>
                                </div>

                                <div className="document-row">
                                    <div className="document-item">
                                        <label className="document-label">
                                            Income Proof (Salary Slips/ITR)*
                                        </label>
                                        <input
                                            type="file"
                                            id="incomeProof"
                                            name="incomeProof"
                                            accept=".pdf,image/*"
                                            required
                                        />
                                        <div className="file-info">No file chosen</div>
                                    </div>
                                    <div className="document-item">
                                        <label className="document-label">
                                            Bank Statements (Last 6 months)*
                                        </label>
                                        <input
                                            type="file"
                                            id="bankStatements"
                                            name="bankStatements"
                                            accept=".pdf,image/*"
                                            required
                                        />
                                        <div className="file-info">No file chosen</div>
                                    </div>
                                </div>

                                <div className="document-row">
                                    <div className="document-item">
                                        <label className="document-label">Property Documents</label>
                                        <input
                                            type="file"
                                            id="propertyDocuments"
                                            name="propertyDocuments"
                                            accept=".pdf,image/*"
                                        />
                                        <div className="file-info">No file chosen</div>
                                    </div>
                                    <div className="document-item">
                                        <label className="document-label">Additional Documents</label>
                                        <input
                                            type="file"
                                            id="additionalDocs"
                                            name="additionalDocs"
                                            accept=".pdf,image/*"
                                            multiple
                                        />
                                        <div className="file-info">No file chosen</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <label className="checkbox-container">
                            <input
                                type="checkbox"
                                id="terms"
                                name="terms"
                                checked={formData.terms}
                                onChange={handleChange}
                                required
                            />
                            <span className="checkmark"></span>I agree to the terms and
                            conditions
                        </label>
                        <button type="submit" className="submit-btn" disabled={status === 'loading'}>
                            {status === 'loading' ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>

                    {/* Application Status Feedback */}
                    {status && (
                        <div id="application-status" className="application-status" style={{ display: 'block' }}>
                            {status === 'loading' && (
                                <div className="loading">
                                    <i className="fas fa-spinner fa-spin"></i> {statusMessage}
                                </div>
                            )}
                            {status === 'success' && (
                                <div className="success">
                                    <i className="fas fa-check-circle"></i>
                                    <h3>{statusMessage}</h3>
                                    <p>We will review your application and contact you shortly.</p>
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    <h3>Application Submission Failed</h3>
                                    <p>{statusMessage}</p>
                                </div>
                            )}
                        </div>
                    )}
                </form>
            ) : (
                <div className="login-prompt">
                    <p>Please log in to apply for a loan.</p>
                </div>
            )}
        </div>
    );
};

export default LoanApplicationForm;
