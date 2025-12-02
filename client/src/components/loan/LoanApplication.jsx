import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loanAPI } from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import "./LoanApplication.css";

const LoanApplication = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(selectAuth);
  const [loading, setLoading] = useState(false);
  const [checkingActiveLoan, setCheckingActiveLoan] = useState(true);
  const [hasActiveLoan, setHasActiveLoan] = useState(false);
  const [activeLoanDetails, setActiveLoanDetails] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

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
    interestRate: "8.5",
    propertyType: "",
    loanType: "",
    propertyValue: "",
    propertyAddress: "",
  });

  const [documents, setDocuments] = useState({
    identityProof: null,
    addressProof: null,
    incomeProof: null,
    propertyDocuments: null,
    bankStatements: null,
    additionalDocs: [],
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [documentErrors, setDocumentErrors] = useState({});

  useEffect(() => {
    checkForActiveLoan();
  }, []);

  // Validation rules
  const validationRules = {
    fullName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/,
      message: "Full name must be 2-50 characters (letters and spaces only)",
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address",
    },
    phone: {
      required: true,
      pattern: /^[6-9]\d{9}$/,
      message: "Phone number must be 10 digits starting with 6-9",
    },
    dob: {
      required: true,
      minAge: 18,
      maxAge: 70,
      message: "Age must be between 18-70 years",
    },
    maritalStatus: {
      required: true,
      message: "Please select marital status",
    },
    employmentType: {
      required: true,
      message: "Please select employment type",
    },
    monthlyIncome: {
      required: true,
      min: 15000,
      max: 10000000,
      message: "Monthly income must be between ₹15,000 and ₹1 crore",
    },
    workExperience: {
      required: true,
      min: 1,
      max: 50,
      message: "Work experience must be between 1-50 years",
    },
    employerName: {
      minLength: 2,
      maxLength: 100,
      message: "Employer name must be 2-100 characters if provided",
    },
    designation: {
      minLength: 2,
      maxLength: 50,
      message: "Designation must be 2-50 characters if provided",
    },
    loanAmount: {
      required: true,
      min: 100000,
      max: 100000000,
      message: "Loan amount must be between ₹1 lakh and ₹10 crore",
    },
    loanTenure: {
      required: true,
      min: 1,
      max: 30,
      message: "Loan tenure must be between 1-30 years",
    },
    propertyType: {
      required: true,
      message: "Please select property type",
    },
    propertyValue: {
      min: 100000,
      max: 500000000,
      message:
        "Property value must be between ₹1 lakh and ₹50 crore if provided",
    },
    propertyAddress: {
      minLength: 10,
      maxLength: 500,
      message: "Property address must be 10-500 characters if provided",
    },
  };

  // Document validation rules
  const documentValidationRules = {
    identityProof: { required: true, message: "Identity proof is required" },
    addressProof: { required: true, message: "Address proof is required" },
    incomeProof: { required: true, message: "Income proof is required" },
    bankStatements: { required: true, message: "Bank statements are required" },
    propertyDocuments: {
      required: false,
      message: "Property documents are optional",
    },
    additionalDocs: {
      required: false,
      maxFiles: 3,
      message: "Maximum 3 additional documents allowed",
    },
  };

  // Validation function
  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    // Required field validation
    if (rules.required && (!value || value.toString().trim() === "")) {
      return `${
        name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1")
      } is required`;
    }

    // Skip further validation if field is empty and not required
    if (!value || value.toString().trim() === "") return null;

    const stringValue = value.toString().trim();
    const numericValue = parseFloat(value);

    // String length validation
    if (rules.minLength && stringValue.length < rules.minLength) {
      return rules.message || `Minimum ${rules.minLength} characters required`;
    }
    if (rules.maxLength && stringValue.length > rules.maxLength) {
      return rules.message || `Maximum ${rules.maxLength} characters allowed`;
    }

    // Numeric validation
    if (
      rules.min !== undefined &&
      (isNaN(numericValue) || numericValue < rules.min)
    ) {
      return rules.message || `Minimum value is ${rules.min}`;
    }
    if (
      rules.max !== undefined &&
      (isNaN(numericValue) || numericValue > rules.max)
    ) {
      return rules.message || `Maximum value is ${rules.max}`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      return rules.message || "Invalid format";
    }

    // Date/Age validation
    if (name === "dob" && rules.minAge) {
      const birthDate = new Date(value);
      const today = new Date();
      const age = Math.floor(
        (today - birthDate) / (365.25 * 24 * 60 * 60 * 1000)
      );

      if (age < rules.minAge || age > rules.maxAge) {
        return rules.message;
      }
    }

    // Custom validations
    if (name === "loanAmount" && formData.propertyValue) {
      const loanToValueRatio =
        (numericValue / parseFloat(formData.propertyValue)) * 100;
      if (loanToValueRatio > 90) {
        return "Loan amount cannot exceed 90% of property value";
      }
    }

    return null;
  };

  // Validate document
  const validateDocument = (name, file) => {
    const rules = documentValidationRules[name];
    if (!rules) return null;

    if (rules.required && !file) {
      return rules.message;
    }

    if (file) {
      // File size validation (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return "File size must be less than 5MB";
      }

      // File type validation
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      if (!allowedTypes.includes(file.type)) {
        return "Only PDF, JPEG, JPG, and PNG files are allowed";
      }
    }

    return null;
  };

  // Validate all fields
  const validateAllFields = () => {
    const errors = {};
    const docErrors = {};

    // Validate form fields
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) errors[field] = error;
    });

    // Validate documents
    Object.keys(documents).forEach((docType) => {
      if (docType === "additionalDocs") {
        const files = documents[docType];
        if (files && files.length > 3) {
          docErrors[docType] = "Maximum 3 additional documents allowed";
        } else if (files && files.length > 0) {
          // Validate each additional document
          for (let i = 0; i < files.length; i++) {
            const error = validateDocument("additionalDocs", files[i]);
            if (error) {
              docErrors[docType] = error;
              break;
            }
          }
        }
      } else {
        const error = validateDocument(docType, documents[docType]);
        if (error) docErrors[docType] = error;
      }
    });

    return { fieldErrors: errors, documentErrors: docErrors };
  };

  const checkForActiveLoan = async () => {
    try {
      setCheckingActiveLoan(true);
      const response = await loanAPI.getMyApplications();

      if (response.data.success) {
        const applications = response.data.applications || [];

        // Check for pending or approved loans (active loans)
        const activeLoan = applications.find(
          (app) =>
            app.applicationStatus === "pending" ||
            app.applicationStatus === "approved" ||
            app.applicationStatus === "under_review"
        );

        if (activeLoan) {
          setHasActiveLoan(true);
          setActiveLoanDetails(activeLoan);
        }
      }
    } catch (error) {
      console.error("Error checking active loans:", error);
    } finally {
      setCheckingActiveLoan(false);
    }
  };

  const loanCategories = [
    {
      id: "affordable",
      title: "Affordable Home Loan",
      range: "< ₹50 Lakhs",
      interestRate: "8.2% - 8.5%",
      icon: "fa-home",
      color: "#4caf50",
    },
    {
      id: "premium",
      title: "Premium Home Loan",
      range: "₹50 Lakhs - ₹1 Crore",
      interestRate: "8.5% - 8.8%",
      icon: "fa-building",
      color: "#2196f3",
    },
    {
      id: "luxury",
      title: "Luxury Home Loan",
      range: "> ₹1 Crore",
      interestRate: "8.7% - 9.2%",
      icon: "fa-gem",
      color: "#9c27b0",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Mark field as touched
    setTouchedFields((prev) => ({ ...prev, [name]: true }));

    // Validate field and update errors
    const error = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));

    // Validate on blur
    const error = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    let selectedFiles;

    if (name === "additionalDocs") {
      selectedFiles = Array.from(files);
      setDocuments((prev) => ({ ...prev, [name]: selectedFiles }));

      // Validate additional docs
      if (selectedFiles.length > 3) {
        setDocumentErrors((prev) => ({
          ...prev,
          [name]: "Maximum 3 additional documents allowed",
        }));
      } else {
        // Validate each file
        for (let i = 0; i < selectedFiles.length; i++) {
          const error = validateDocument("additionalDocs", selectedFiles[i]);
          if (error) {
            setDocumentErrors((prev) => ({ ...prev, [name]: error }));
            return;
          }
        }
        setDocumentErrors((prev) => ({ ...prev, [name]: null }));
      }
    } else {
      selectedFiles = files[0];
      setDocuments((prev) => ({ ...prev, [name]: selectedFiles }));

      // Validate single document
      const error = validateDocument(name, selectedFiles);
      setDocumentErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleCategorySelect = (category) => {
    setActiveCategory(category.id);
    setFormData((prev) => ({ ...prev, loanType: category.id }));

    setTimeout(() => {
      document.getElementById("loanApplicationForm")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user already has an active loan
    if (hasActiveLoan) {
      toast.error(
        "You already have an active loan application. Please wait for it to be processed or complete your existing loan."
      );
      return;
    }

    // Mark all fields as touched
    const allFields = Object.keys(formData);
    const touchedState = {};
    allFields.forEach((field) => {
      touchedState[field] = true;
    });
    setTouchedFields(touchedState);

    // Validate all fields and documents
    const validation = validateAllFields();
    setFieldErrors(validation.fieldErrors);
    setDocumentErrors(validation.documentErrors);

    // Check for validation errors
    const totalErrors =
      Object.keys(validation.fieldErrors).length +
      Object.keys(validation.documentErrors).length;

    if (totalErrors > 0) {
      const firstFieldError = Object.values(validation.fieldErrors)[0];
      const firstDocError = Object.values(validation.documentErrors)[0];
      const firstError = firstFieldError || firstDocError;

      toast.error(
        `Please fix ${totalErrors} validation error${
          totalErrors > 1 ? "s" : ""
        }: ${firstError}`
      );

      // Scroll to first error field
      const firstErrorField =
        Object.keys(validation.fieldErrors)[0] ||
        Object.keys(validation.documentErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }

      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      Object.keys(documents).forEach((key) => {
        if (key === "additionalDocs" && documents[key].length > 0) {
          documents[key].forEach((file) => {
            submitData.append(key, file);
          });
        } else if (documents[key]) {
          submitData.append(key, documents[key]);
        }
      });

      const response = await loanAPI.submitLoanApplication(submitData);

      if (response.data.success) {
        toast.success(
          "Loan application submitted successfully! Your application is under review."
        );
        setTimeout(() => {
          navigate("/loans/my-applications");
        }, 1500);
      }
    } catch (error) {
      console.error("Error submitting loan application:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit application"
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render form field with error
  const renderFormField = (fieldName, fieldProps, children) => {
    const hasError = touchedFields[fieldName] && fieldErrors[fieldName];
    const fieldClassName = `form-group ${hasError ? "has-error" : ""}`;

    return (
      <div className={fieldClassName}>
        {children}
        {hasError && (
          <div className="field-error">
            <i className="fas fa-exclamation-circle"></i>
            {fieldErrors[fieldName]}
          </div>
        )}
      </div>
    );
  };

  // Helper function to render document upload with error
  const renderDocumentField = (docName, children) => {
    const hasError = documentErrors[docName];
    const fieldClassName = `upload-group ${hasError ? "has-error" : ""}`;

    return (
      <div className={fieldClassName}>
        {children}
        {hasError && (
          <div className="field-error">
            <i className="fas fa-exclamation-circle"></i>
            {documentErrors[docName]}
          </div>
        )}
      </div>
    );
  };

  if (checkingActiveLoan) {
    return (
      <div className="loan-application-container">
        <div className="checking-loan-status">
          <div className="spinner"></div>
          <p>Checking your loan status...</p>
        </div>
      </div>
    );
  }

  if (hasActiveLoan) {
    return (
      <div className="loan-application-container">
        <div className="active-loan-block">
          <div className="block-icon">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h2>Active Loan Detected</h2>
          <p>
            You already have an active loan application. Only one loan is
            allowed at a time.
          </p>

          <div className="active-loan-details">
            <h3>Current Loan Details:</h3>
            <div className="detail-row">
              <span className="label">Status:</span>
              <span
                className={`status-badge ${activeLoanDetails.applicationStatus}`}
              >
                {activeLoanDetails.applicationStatus?.toUpperCase()}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Loan Type:</span>
              <span>
                {activeLoanDetails.loanDetails?.loanType?.toUpperCase()}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Loan Amount:</span>
              <span>
                ₹
                {activeLoanDetails.loanDetails?.loanAmount?.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Applied On:</span>
              <span>
                {new Date(activeLoanDetails.createdAt).toLocaleDateString(
                  "en-IN"
                )}
              </span>
            </div>
          </div>

          <div className="block-actions">
            <button
              onClick={() => navigate("/loans/my-applications")}
              className="view-loan-btn"
            >
              <i className="fas fa-folder-open"></i> View My Applications
            </button>
            {activeLoanDetails.applicationStatus === "approved" && (
              <button
                onClick={() => navigate("/loans/my-emis")}
                className="view-emi-btn"
              >
                <i className="fas fa-money-check-alt"></i> View EMI Payments
              </button>
            )}
          </div>

          <div className="info-note">
            <i className="fas fa-info-circle"></i>
            <p>
              You can apply for a new loan once your current loan is fully paid
              or rejected.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="loan-application-container">
      <div className="loan-hero">
        <h1>Apply for Home Loan</h1>
        <p>Get instant approval and competitive interest rates</p>
      </div>

      <section className="loan-categories">
        <h2>Choose Your Loan Category</h2>
        <div className="category-cards">
          {loanCategories.map((category) => (
            <div
              key={category.id}
              className={`category-card ${
                activeCategory === category.id ? "active" : ""
              }`}
              onClick={() => handleCategorySelect(category)}
              style={{ borderColor: category.color }}
            >
              <div
                className="category-icon"
                style={{ backgroundColor: category.color }}
              >
                <i className={`fas ${category.icon}`}></i>
              </div>
              <h3>{category.title}</h3>
              <div className="category-range">{category.range}</div>
              <div className="category-rate">
                Interest: {category.interestRate}
              </div>
              <button
                className="select-btn"
                style={{ backgroundColor: category.color }}
              >
                Select
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="loan-form-section" id="loanApplicationForm">
        <h2>Loan Application Form</h2>
        <form onSubmit={handleSubmit} className="loan-form">
          <div className="form-section">
            <h3>
              <i className="fas fa-user"></i> Personal Information
            </h3>
            <div className="form-grid">
              {renderFormField(
                "fullName",
                {},
                <>
                  <label>
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={
                      touchedFields.fullName && fieldErrors.fullName
                        ? "error"
                        : ""
                    }
                    placeholder="Enter your full name"
                    maxLength={50}
                    required
                  />
                  <small className="field-hint">
                    Letters and spaces only (2-50 characters)
                  </small>
                </>
              )}
              {renderFormField(
                "email",
                {},
                <>
                  <label>
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={
                      touchedFields.email && fieldErrors.email ? "error" : ""
                    }
                    placeholder="Enter your email address"
                    required
                  />
                </>
              )}
              {renderFormField(
                "phone",
                {},
                <>
                  <label>
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={
                      touchedFields.phone && fieldErrors.phone ? "error" : ""
                    }
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    required
                  />
                  <small className="field-hint">
                    10 digits starting with 6-9
                  </small>
                </>
              )}
              {renderFormField(
                "dob",
                {},
                <>
                  <label>
                    Date of Birth <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={
                      touchedFields.dob && fieldErrors.dob ? "error" : ""
                    }
                    max={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() - 18)
                      )
                        .toISOString()
                        .split("T")[0]
                    }
                    min={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() - 70)
                      )
                        .toISOString()
                        .split("T")[0]
                    }
                    required
                  />
                  <small className="field-hint">
                    Age must be between 18-70 years
                  </small>
                </>
              )}
              {renderFormField(
                "maritalStatus",
                {},
                <>
                  <label>
                    Marital Status <span className="required">*</span>
                  </label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={
                      touchedFields.maritalStatus && fieldErrors.maritalStatus
                        ? "error"
                        : ""
                    }
                    required
                  >
                    <option value="">Select marital status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                  </select>
                </>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>
              <i className="fas fa-briefcase"></i> Employment Details
            </h3>
            <div className="form-grid">
              {renderFormField(
                "employmentType",
                {},
                <>
                  <label>
                    Employment Type <span className="required">*</span>
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={
                      touchedFields.employmentType && fieldErrors.employmentType
                        ? "error"
                        : ""
                    }
                    required
                  >
                    <option value="">Select employment type</option>
                    <option value="salaried">Salaried</option>
                    <option value="self-employed">Self Employed</option>
                    <option value="business">Business Owner</option>
                  </select>
                </>
              )}
              {renderFormField(
                "monthlyIncome",
                {},
                <>
                  <label>
                    Monthly Income (₹) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={
                      touchedFields.monthlyIncome && fieldErrors.monthlyIncome
                        ? "error"
                        : ""
                    }
                    placeholder="Enter monthly income"
                    min="15000"
                    max="10000000"
                    required
                  />
                  <small className="field-hint">
                    Minimum ₹15,000 required for loan eligibility
                  </small>
                </>
              )}
              {renderFormField(
                "workExperience",
                {},
                <>
                  <label>
                    Work Experience (Years) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="workExperience"
                    value={formData.workExperience}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={
                      touchedFields.workExperience && fieldErrors.workExperience
                        ? "error"
                        : ""
                    }
                    placeholder="Years of work experience"
                    min="1"
                    max="50"
                    required
                  />
                  <small className="field-hint">
                    Minimum 1 year experience required
                  </small>
                </>
              )}
              <div className="form-group">
                <label>Employer/Company Name</label>
                <input
                  type="text"
                  name="employerName"
                  value={formData.employerName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Designation/Role</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>
              <i className="fas fa-file-invoice-dollar"></i> Loan Requirements
            </h3>
            <div className="form-grid">
              {renderFormField(
                "loanAmount",
                {},
                <>
                  <label>
                    Loan Amount (₹) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={
                      touchedFields.loanAmount && fieldErrors.loanAmount
                        ? "error"
                        : ""
                    }
                    placeholder="Enter desired loan amount"
                    min="100000"
                    max="100000000"
                    required
                  />
                  <small className="field-hint">
                    ₹1 lakh to ₹10 crore (max 90% of property value)
                  </small>
                </>
              )}
              {renderFormField(
                "loanTenure",
                {},
                <>
                  <label>
                    Loan Tenure (Years) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    name="loanTenure"
                    value={formData.loanTenure}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={
                      touchedFields.loanTenure && fieldErrors.loanTenure
                        ? "error"
                        : ""
                    }
                    placeholder="Repayment period in years"
                    min="1"
                    max="30"
                    required
                  />
                  <small className="field-hint">
                    1-30 years (longer tenure = lower EMI)
                  </small>
                </>
              )}
              <div className="form-group">
                <label>Property Type *</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="house">Independent House</option>
                  <option value="plot">Plot</option>
                </select>
              </div>
              <div className="form-group">
                <label>Property Value (₹)</label>
                <input
                  type="number"
                  name="propertyValue"
                  value={formData.propertyValue}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group full-width">
                <label>Property Address</label>
                <textarea
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleInputChange}
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>
              <i className="fas fa-file-upload"></i> Upload Documents
            </h3>
            <div className="document-upload-grid">
              {renderDocumentField(
                "identityProof",
                <>
                  <label>
                    <i className="fas fa-id-card"></i> Identity Proof{" "}
                    <span className="required">*</span>{" "}
                    <span className="file-hint">(Aadhar/PAN)</span>
                  </label>
                  <input
                    type="file"
                    name="identityProof"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className={documentErrors.identityProof ? "error" : ""}
                    required
                  />
                  <small className="field-hint">
                    PDF, JPEG, JPG, PNG (max 5MB)
                  </small>
                </>
              )}
              {renderDocumentField(
                "addressProof",
                <>
                  <label>
                    <i className="fas fa-map-marker-alt"></i> Address Proof{" "}
                    <span className="required">*</span>{" "}
                    <span className="file-hint">(Utility Bill)</span>
                  </label>
                  <input
                    type="file"
                    name="addressProof"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className={documentErrors.addressProof ? "error" : ""}
                    required
                  />
                  <small className="field-hint">
                    PDF, JPEG, JPG, PNG (max 5MB)
                  </small>
                </>
              )}
              {renderDocumentField(
                "incomeProof",
                <>
                  <label>
                    <i className="fas fa-file-invoice-dollar"></i> Income Proof{" "}
                    <span className="required">*</span>{" "}
                    <span className="file-hint">(Salary Slip)</span>
                  </label>
                  <input
                    type="file"
                    name="incomeProof"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className={documentErrors.incomeProof ? "error" : ""}
                    required
                  />
                  <small className="field-hint">
                    PDF, JPEG, JPG, PNG (max 5MB)
                  </small>
                </>
              )}
              <div className="upload-group">
                <label>
                  <i className="fas fa-home"></i> Property Documents{" "}
                  <span className="file-hint">(Optional)</span>
                </label>
                <input
                  type="file"
                  name="propertyDocuments"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
              <div className="upload-group">
                <label>
                  <i className="fas fa-university"></i> Bank Statements *{" "}
                  <span className="file-hint">(Last 6 months)</span>
                </label>
                <input
                  type="file"
                  name="bankStatements"
                  onChange={handleFileChange}
                  accept=".pdf"
                  required
                />
              </div>
              <div className="upload-group">
                <label>
                  <i className="fas fa-paperclip"></i> Additional Documents{" "}
                  <span className="file-hint">(Max 3)</span>
                </label>
                <input
                  type="file"
                  name="additionalDocs"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i> Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default LoanApplication;
