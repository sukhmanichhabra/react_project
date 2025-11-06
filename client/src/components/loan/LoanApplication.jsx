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
    propertyAddress: ""
  });

  const [documents, setDocuments] = useState({
    identityProof: null,
    addressProof: null,
    incomeProof: null,
    propertyDocuments: null,
    bankStatements: null,
    additionalDocs: []
  });

  useEffect(() => {
    checkForActiveLoan();
  }, []);

  const checkForActiveLoan = async () => {
    try {
      setCheckingActiveLoan(true);
      const response = await loanAPI.getMyApplications();
      
      if (response.data.success) {
        const applications = response.data.applications || [];
        
        // Check for pending or approved loans (active loans)
        const activeLoan = applications.find(
          app => app.applicationStatus === "pending" || 
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
      color: "#4caf50"
    },
    {
      id: "premium",
      title: "Premium Home Loan",
      range: "₹50 Lakhs - ₹1 Crore",
      interestRate: "8.5% - 8.8%",
      icon: "fa-building",
      color: "#2196f3"
    },
    {
      id: "luxury",
      title: "Luxury Home Loan",
      range: "> ₹1 Crore",
      interestRate: "8.7% - 9.2%",
      icon: "fa-gem",
      color: "#9c27b0"
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "additionalDocs") {
      setDocuments(prev => ({ ...prev, [name]: Array.from(files) }));
    } else {
      setDocuments(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleCategorySelect = (category) => {
    setActiveCategory(category.id);
    setFormData(prev => ({ ...prev, loanType: category.id }));
    
    setTimeout(() => {
      document.getElementById("loanApplicationForm")?.scrollIntoView({ 
        behavior: "smooth" 
      });
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user already has an active loan
    if (hasActiveLoan) {
      toast.error("You already have an active loan application. Please wait for it to be processed or complete your existing loan.");
      return;
    }
    
    try {
      setLoading(true);
      
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      
      Object.keys(documents).forEach(key => {
        if (key === "additionalDocs" && documents[key].length > 0) {
          documents[key].forEach(file => {
            submitData.append(key, file);
          });
        } else if (documents[key]) {
          submitData.append(key, documents[key]);
        }
      });
      
      const response = await loanAPI.submitLoanApplication(submitData);
      
      if (response.data.success) {
        toast.success("Loan application submitted successfully! Your application is under review.");
        setTimeout(() => {
          navigate("/loans/my-applications");
        }, 1500);
      }
    } catch (error) {
      console.error("Error submitting loan application:", error);
      toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
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
          <p>You already have an active loan application. Only one loan is allowed at a time.</p>
          
          <div className="active-loan-details">
            <h3>Current Loan Details:</h3>
            <div className="detail-row">
              <span className="label">Status:</span>
              <span className={`status-badge ${activeLoanDetails.applicationStatus}`}>
                {activeLoanDetails.applicationStatus?.toUpperCase()}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Loan Type:</span>
              <span>{activeLoanDetails.loanDetails?.loanType?.toUpperCase()}</span>
            </div>
            <div className="detail-row">
              <span className="label">Loan Amount:</span>
              <span>₹{activeLoanDetails.loanDetails?.loanAmount?.toLocaleString("en-IN")}</span>
            </div>
            <div className="detail-row">
              <span className="label">Applied On:</span>
              <span>{new Date(activeLoanDetails.createdAt).toLocaleDateString("en-IN")}</span>
            </div>
          </div>

          <div className="block-actions">
            <button onClick={() => navigate("/loans/my-applications")} className="view-loan-btn">
              <i className="fas fa-folder-open"></i> View My Applications
            </button>
            {activeLoanDetails.applicationStatus === "approved" && (
              <button onClick={() => navigate("/loans/my-emis")} className="view-emi-btn">
                <i className="fas fa-money-check-alt"></i> View EMI Payments
              </button>
            )}
          </div>

          <div className="info-note">
            <i className="fas fa-info-circle"></i>
            <p>You can apply for a new loan once your current loan is fully paid or rejected.</p>
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
          {loanCategories.map(category => (
            <div 
              key={category.id}
              className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategorySelect(category)}
              style={{ borderColor: category.color }}
            >
              <div className="category-icon" style={{ backgroundColor: category.color }}>
                <i className={`fas ${category.icon}`}></i>
              </div>
              <h3>{category.title}</h3>
              <div className="category-range">{category.range}</div>
              <div className="category-rate">Interest: {category.interestRate}</div>
              <button className="select-btn" style={{ backgroundColor: category.color }}>
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
            <h3><i className="fas fa-user"></i> Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Date of Birth *</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Marital Status *</label>
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} required>
                  <option value="">Select</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3><i className="fas fa-briefcase"></i> Employment Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Employment Type *</label>
                <select name="employmentType" value={formData.employmentType} onChange={handleInputChange} required>
                  <option value="">Select</option>
                  <option value="salaried">Salaried</option>
                  <option value="self-employed">Self Employed</option>
                  <option value="business">Business Owner</option>
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Income (₹) *</label>
                <input type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Work Experience (Years) *</label>
                <input type="number" name="workExperience" value={formData.workExperience} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Employer/Company Name</label>
                <input type="text" name="employerName" value={formData.employerName} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Designation/Role</label>
                <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3><i className="fas fa-file-invoice-dollar"></i> Loan Requirements</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Loan Amount (₹) *</label>
                <input type="number" name="loanAmount" value={formData.loanAmount} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Loan Tenure (Years) *</label>
                <input type="number" name="loanTenure" value={formData.loanTenure} onChange={handleInputChange} min="1" max="30" required />
              </div>
              <div className="form-group">
                <label>Property Type *</label>
                <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} required>
                  <option value="">Select</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="house">Independent House</option>
                  <option value="plot">Plot</option>
                </select>
              </div>
              <div className="form-group">
                <label>Property Value (₹)</label>
                <input type="number" name="propertyValue" value={formData.propertyValue} onChange={handleInputChange} />
              </div>
              <div className="form-group full-width">
                <label>Property Address</label>
                <textarea name="propertyAddress" value={formData.propertyAddress} onChange={handleInputChange} rows="3"></textarea>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3><i className="fas fa-file-upload"></i> Upload Documents</h3>
            <div className="document-upload-grid">
              <div className="upload-group">
                <label><i className="fas fa-id-card"></i> Identity Proof * <span className="file-hint">(Aadhar/PAN)</span></label>
                <input type="file" name="identityProof" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" required />
              </div>
              <div className="upload-group">
                <label><i className="fas fa-map-marker-alt"></i> Address Proof * <span className="file-hint">(Utility Bill)</span></label>
                <input type="file" name="addressProof" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" required />
              </div>
              <div className="upload-group">
                <label><i className="fas fa-file-invoice-dollar"></i> Income Proof * <span className="file-hint">(Salary Slip)</span></label>
                <input type="file" name="incomeProof" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" required />
              </div>
              <div className="upload-group">
                <label><i className="fas fa-home"></i> Property Documents <span className="file-hint">(Optional)</span></label>
                <input type="file" name="propertyDocuments" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
              </div>
              <div className="upload-group">
                <label><i className="fas fa-university"></i> Bank Statements * <span className="file-hint">(Last 6 months)</span></label>
                <input type="file" name="bankStatements" onChange={handleFileChange} accept=".pdf" required />
              </div>
              <div className="upload-group">
                <label><i className="fas fa-paperclip"></i> Additional Documents <span className="file-hint">(Max 3)</span></label>
                <input type="file" name="additionalDocs" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" multiple />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (<><i className="fas fa-spinner fa-spin"></i> Submitting...</>) : (<><i className="fas fa-paper-plane"></i> Submit Application</>)}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default LoanApplication;
