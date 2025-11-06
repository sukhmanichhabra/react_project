import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loanAPI } from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import { selectAuth } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import "./PayEMI.css";

const PayEMI = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLoanId = searchParams.get("loanId");
  
  const { user } = useAppSelector(selectAuth);
  const [loading, setLoading] = useState(true);
  const [emiData, setEmiData] = useState(null);
  const [filteredEmiData, setFilteredEmiData] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEmi, setSelectedEmi] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("account");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (!mounted) return;
      
      try {
        await fetchEmiData();
      } catch (error) {
        console.error('Error loading EMI data:', error);
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEmiData = async () => {
    try {
      setLoading(true);
      const response = await loanAPI.getMyEmis();
      
      console.log("EMI Data Response:", response.data);
      
      if (response.data.success) {
        const allData = response.data.data;
        setEmiData(allData);
        
        // Filter data if specific loan is selected
        if (selectedLoanId) {
          const filtered = filterDataByLoan(allData, selectedLoanId);
          setFilteredEmiData(filtered);
        } else {
          setFilteredEmiData(allData);
        }
      } else {
        console.log("No EMI data available");
      }
    } catch (error) {
      console.error("Error fetching EMI data:", error);
      if (error.response?.status === 404) {
        // Silent fail for 404 - empty state will handle it
        console.log("No EMI payments found");
      } else {
        toast.error(error.response?.data?.message || "Failed to load EMI information");
      }
    } finally {
      setLoading(false);
    }
  };

  const filterDataByLoan = (data, loanId) => {
    if (!data) return null;
    
    return {
      emiPayments: data.emiPayments?.filter(emi => emi.loanId?._id === loanId || emi.loanId === loanId) || [],
      loanSummaries: data.loanSummaries?.filter(loan => loan._id === loanId) || [],
      emiSummary: data.emiSummary, // Keep overall summary or recalculate
      overdueEmis: data.overdueEmis?.filter(emi => emi.loanId?._id === loanId || emi.loanId === loanId) || [],
      missedEmis: data.missedEmis?.filter(emi => emi.loanId?._id === loanId || emi.loanId === loanId) || []
    };
  };

  const handlePayEmi = async () => {
    if (!selectedEmi) return;
    
    try {
      setProcessing(true);
      const response = await loanAPI.payEmi(selectedEmi._id, {
        paymentMethod,
        transactionId: `TXN${Date.now()}`
      });
      
      if (response.data.success) {
        toast.success("EMI payment successful!");
        setShowPaymentModal(false);
        setSelectedEmi(null);
        fetchEmiData();
      }
    } catch (error) {
      console.error("Error paying EMI:", error);
      toast.error(error.response?.data?.message || "Failed to process payment");
    } finally {
      setProcessing(false);
    }
  };

  const generateInvoice = (emi, loanInfo) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text("EMI Payment Invoice", 105, 20, { align: "center" });
    
    // Company Info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Real Estate Management System", 105, 30, { align: "center" });
    doc.text("www.realestate.com | support@realestate.com", 105, 35, { align: "center" });
    
    // Line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 40, 190, 40);
    
    // Invoice Details
    doc.setFontSize(12);
    doc.text("Invoice Details", 20, 50);
    doc.setFontSize(10);
    doc.text(`Invoice No: INV-${emi._id.substring(0, 8).toUpperCase()}`, 20, 58);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 64);
    doc.text(`EMI Number: ${emi.emiNumber || 1}`, 20, 70);
    
    // Customer Details
    doc.setFontSize(12);
    doc.text("Customer Details", 20, 85);
    doc.setFontSize(10);
    doc.text(`Name: ${user?.name || 'N/A'}`, 20, 93);
    doc.text(`Email: ${user?.email || 'N/A'}`, 20, 99);
    doc.text(`Phone: ${user?.phone || 'N/A'}`, 20, 105);
    
    // Loan Details
    doc.setFontSize(12);
    doc.text("Loan Details", 20, 120);
    doc.setFontSize(10);
    doc.text(`Loan Type: ${loanInfo?.loanType?.replace('_', ' ').toUpperCase() || 'Home Loan'}`, 20, 128);
    doc.text(`Loan Amount: ₹${loanInfo?.loanAmount?.toLocaleString('en-IN') || '0'}`, 20, 134);
    doc.text(`Interest Rate: ${loanInfo?.interestRate || 0}%`, 20, 140);
    doc.text(`Tenure: ${loanInfo?.tenure || 0} years`, 20, 146);
    
    // Payment Breakdown
    doc.setFontSize(12);
    doc.text("Payment Breakdown", 20, 161);
    
    // Table
    const tableY = 170;
    doc.setFontSize(10);
    doc.setFillColor(102, 126, 234);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, tableY, 170, 8, 'F');
    doc.text("Description", 25, tableY + 5);
    doc.text("Amount", 160, tableY + 5);
    
    doc.setTextColor(0, 0, 0);
    let currentY = tableY + 15;
    
    doc.text("Principal Amount", 25, currentY);
    doc.text(`₹${(emi.principalAmount || 0).toLocaleString('en-IN')}`, 160, currentY);
    currentY += 8;
    
    doc.text("Interest Amount", 25, currentY);
    doc.text(`₹${(emi.interestAmount || 0).toLocaleString('en-IN')}`, 160, currentY);
    currentY += 8;
    
    if (emi.latePaymentFee && emi.latePaymentFee > 0) {
      doc.text("Late Payment Fee", 25, currentY);
      doc.text(`₹${emi.latePaymentFee.toLocaleString('en-IN')}`, 160, currentY);
      currentY += 8;
    }
    
    // Total
    doc.setDrawColor(200, 200, 200);
    doc.line(20, currentY, 190, currentY);
    currentY += 8;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("Total Amount", 25, currentY);
    const totalAmount = (emi.amount || 0) + (emi.latePaymentFee || 0);
    doc.text(`₹${totalAmount.toLocaleString('en-IN')}`, 160, currentY);
    
    // Payment Info
    if (emi.status === 'paid' || emi.status === 'late') {
      currentY += 15;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text("Payment Information", 20, currentY);
      currentY += 8;
      doc.text(`Payment Date: ${emi.paymentDate ? new Date(emi.paymentDate).toLocaleDateString('en-IN') : 'N/A'}`, 20, currentY);
      currentY += 6;
      doc.text(`Payment Method: ${emi.paymentMethod || 'N/A'}`, 20, currentY);
      currentY += 6;
      doc.text(`Transaction ID: ${emi.transactionId || 'N/A'}`, 20, currentY);
      currentY += 6;
      doc.setTextColor(76, 175, 80);
      doc.text("Status: PAID", 20, currentY);
    }
    
    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Thank you for your payment!", 105, 280, { align: "center" });
    doc.text("This is a computer-generated invoice and does not require a signature.", 105, 285, { align: "center" });
    
    // Save
    doc.save(`EMI-Invoice-${emi._id.substring(0, 8)}.pdf`);
    toast.success("Invoice downloaded successfully!");
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getStatusClass = (status) => {
    const classes = {
      paid: "status-paid",
      pending: "status-pending",
      overdue: "status-overdue",
      late: "status-late",
      missed: "status-missed"
    };
    return classes[status] || "status-pending";
  };

  const openPaymentModal = (emi) => {
    setSelectedEmi(emi);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedEmi(null);
    setPaymentMethod("account");
  };

  if (loading) {
    return (
      <div className="pay-emi-loading">
        <div className="spinner"></div>
        <p>Loading EMI information...</p>
      </div>
    );
  }

  // Use filtered data for display
  const displayData = filteredEmiData || emiData;

  if (!displayData || !displayData.emiPayments || displayData.emiPayments.length === 0) {
    return (
      <div className="pay-emi-container">
        <div className="pay-emi-header">
          <h1>EMI Payments</h1>
          {selectedLoanId && (
            <button onClick={() => {
              setSearchParams({});
              setFilteredEmiData(emiData);
            }} className="view-all-btn">
              <i className="fas fa-list"></i> View All Loans
            </button>
          )}
        </div>
        <div className="pay-emi-empty">
          <i className="fas fa-money-check-alt"></i>
          <h3>No EMI Payments Found</h3>
          <p>You don't have any approved loans with EMI payments yet.</p>
          <div className="empty-state-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Apply for a Loan</h4>
                <p>Submit your loan application with required documents</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Wait for Approval</h4>
                <p>Admin will review and approve your application</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>EMI Schedule Created</h4>
                <p>Your EMI payments will appear here automatically</p>
              </div>
            </div>
          </div>
          <div className="empty-state-actions">
            <button onClick={() => navigate("/loans/apply")} className="apply-loan-btn">
              <i className="fas fa-plus"></i> Apply for Loan
            </button>
            <button onClick={() => navigate("/loans/my-applications")} className="view-apps-btn">
              <i className="fas fa-folder-open"></i> View My Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { emiPayments, loanSummaries, emiSummary, overdueEmis, missedEmis } = displayData;

  return (
    <div className="pay-emi-container">
      {/* Header */}
      <div className="pay-emi-header">
        <div>
          <h1>EMI Payments</h1>
          {selectedLoanId && loanSummaries && loanSummaries.length > 0 && (
            <p className="filter-indicator">
              <i className="fas fa-filter"></i> Showing EMIs for: {loanSummaries[0].loanType?.toUpperCase()} Loan - ₹{loanSummaries[0].loanAmount?.toLocaleString("en-IN")}
            </p>
          )}
        </div>
        <div className="header-actions">
          {selectedLoanId && (
            <button onClick={() => {
              setSearchParams({});
              setFilteredEmiData(emiData);
            }} className="view-all-btn">
              <i className="fas fa-list"></i> View All Loans
            </button>
          )}
          <button onClick={fetchEmiData} className="refresh-btn">
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      {/* Dashboard Cards */}
      {emiSummary && (
        <div className="emi-dashboard">
          <div className="dashboard-card">
            <div className="card-icon">
              <i className="fas fa-wallet"></i>
            </div>
            <div className="card-content">
              <h3>Total Paid</h3>
              <p className="card-value">{formatCurrency(emiSummary.paidAmount || 0)}</p>
            </div>
          </div>
          <div className="dashboard-card warning">
            <div className="card-icon">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <div className="card-content">
              <h3>Overdue</h3>
              <p className="card-value">{emiSummary.overdueEmis || 0} EMIs</p>
            </div>
          </div>
          <div className="dashboard-card success">
            <div className="card-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="card-content">
              <h3>Paid</h3>
              <p className="card-value">{emiSummary.paidEmis || 0} EMIs</p>
            </div>
          </div>
          <div className="dashboard-card info">
            <div className="card-icon">
              <i className="fas fa-calendar"></i>
            </div>
            <div className="card-content">
              <h3>Next Payment</h3>
              <p className="card-value">
                {emiSummary.nextDueEmi ? formatDate(emiSummary.nextDueEmi.dueDate) : "No upcoming"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {emiSummary && (
        <div className="progress-container">
          <div className="progress-details">
            <h3>Payment Progress</h3>
            <span>{Math.round(emiSummary.paymentProgress || 0)}% Complete</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${emiSummary.paymentProgress || 0}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Loan Summaries */}
      {loanSummaries && loanSummaries.length > 0 && (
        <div className="loan-summaries-section">
          <h2>Your Active Loans</h2>
          <div className="loan-summary-cards">
            {loanSummaries.map((loan, index) => (
              <div key={index} className="loan-summary-card">
                <div className="loan-summary-header">
                  <div className="loan-type-badge">
                    {loan.loanType?.replace('_', ' ').toUpperCase() || 'HOME LOAN'}
                  </div>
                  <h3 className="loan-amount">{formatCurrency(loan.loanAmount || 0)}</h3>
                </div>
                <div className="loan-summary-body">
                  <div className="summary-row">
                    <span>Paid:</span>
                    <span>{formatCurrency(loan.totalPaid || 0)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Principal Paid:</span>
                    <span>{formatCurrency(loan.totalPrincipalPaid || 0)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Interest Paid:</span>
                    <span>{formatCurrency(loan.totalInterestPaid || 0)}</span>
                  </div>
                  <div className="summary-row highlighted">
                    <span>Remaining Balance:</span>
                    <span>{formatCurrency(loan.remainingBalance || 0)}</span>
                  </div>
                </div>
                <div className="loan-summary-footer">
                  <div className="emi-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress" 
                        style={{ 
                          width: `${((loan.paidEmiCount || 0) / Math.max((loan.paidEmiCount || 0) + (loan.pendingEmiCount || 0), 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      <span>{loan.paidEmiCount || 0} of {(loan.paidEmiCount || 0) + (loan.pendingEmiCount || 0)} EMIs paid</span>
                      <span>{Math.round(((loan.paidEmiCount || 0) / Math.max((loan.paidEmiCount || 0) + (loan.pendingEmiCount || 0), 1)) * 100)}% Complete</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overdue EMIs Alert */}
      {overdueEmis && overdueEmis.length > 0 && (
        <div className="overdue-section">
          <div className="section-header">
            <h2>Overdue Payments</h2>
            <span className="badge overdue-badge">{overdueEmis.length} Overdue</span>
          </div>
          <div className="overdue-cards">
            {overdueEmis.map((emi) => (
              <div key={emi._id} className="overdue-card">
                <div className="overdue-details">
                  <div className="overdue-loan-info">
                    <div className="loan-type-badge">
                      {emi.loanId?.loanDetails?.loanType?.replace('_', ' ').toUpperCase() || 'HOME LOAN'}
                    </div>
                    <div className="overdue-date">
                      Due: <strong>{formatDate(emi.dueDate)}</strong>
                    </div>
                  </div>
                  <div className="overdue-amount">
                    <h3>{formatCurrency(emi.amount)}</h3>
                    <div className="days-overdue">
                      {Math.ceil((new Date() - new Date(emi.dueDate)) / (1000 * 60 * 60 * 24))} days overdue
                    </div>
                  </div>
                </div>
                <div className="overdue-action">
                  <button className="pay-btn overdue-pay-btn" onClick={() => openPaymentModal(emi)}>
                    Pay Now
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="overdue-warning">
            <i className="fas fa-exclamation-triangle"></i>
            <p>Late payments may affect your credit score. Please clear overdue payments as soon as possible.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-container">
        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Upcoming EMIs
          </div>
          <div 
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Payment History
          </div>
          <div 
            className={`tab ${activeTab === 'missed' ? 'active' : ''}`}
            onClick={() => setActiveTab('missed')}
          >
            Missed Payments
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content-area">
          {activeTab === 'pending' && (
            <div className="tab-content active">
              {emiPayments.map((loan) => (
                <div key={loan.loanId} className="loan-emi-section">
                  <div className="loan-card-header">
                    <div className="loan-type">{loan.loanType?.replace('_', ' ').toUpperCase() || 'HOME LOAN'}</div>
                    <div className="loan-amount">{formatCurrency(loan.loanAmount)}</div>
                  </div>
                  
                  <table className="emi-table">
                    <thead>
                      <tr>
                        <th>Due Date</th>
                        <th>EMI #</th>
                        <th>Amount</th>
                        <th>Principal</th>
                        <th>Interest</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loan.payments
                        .filter(p => p.status === 'pending')
                        .slice(0, 2)
                        .map((payment) => (
                          <tr key={payment._id}>
                            <td>{formatDate(payment.dueDate)}</td>
                            <td>{payment.emiNumber || 1}</td>
                            <td>{formatCurrency(payment.amount)}</td>
                            <td>{formatCurrency(payment.principalAmount)}</td>
                            <td>{formatCurrency(payment.interestAmount)}</td>
                            <td>
                              <span className={`status-badge ${getStatusClass(payment.status)}`}>
                                {payment.status.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <button className="pay-btn" onClick={() => openPaymentModal(payment)}>
                                Pay Now
                              </button>
                              <button 
                                className="invoice-btn"
                                onClick={() => generateInvoice(payment, loan)}
                              >
                                Invoice
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-content active">
              {emiPayments.map((loan) => {
                const paidPayments = loan.payments.filter(p => p.status === 'paid' || p.status === 'late');
                return paidPayments.length > 0 && (
                  <div key={loan.loanId} className="loan-emi-section">
                    <div className="loan-card-header">
                      <div className="loan-type">{loan.loanType?.replace('_', ' ').toUpperCase() || 'HOME LOAN'}</div>
                      <div className="loan-amount">{formatCurrency(loan.loanAmount)}</div>
                    </div>
                    
                    <table className="emi-table">
                      <thead>
                        <tr>
                          <th>Due Date</th>
                          <th>Paid Date</th>
                          <th>EMI #</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paidPayments.map((payment) => (
                          <tr key={payment._id}>
                            <td>{formatDate(payment.dueDate)}</td>
                            <td>{formatDate(payment.paymentDate)}</td>
                            <td>{payment.emiNumber || 1}</td>
                            <td>{formatCurrency(payment.amount)}</td>
                            <td>
                              <span className={`status-badge ${getStatusClass(payment.status)}`}>
                                {payment.status.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="invoice-btn"
                                onClick={() => generateInvoice(payment, loan)}
                              >
                                <i className="fas fa-download"></i> Download Invoice
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'missed' && (
            <div className="tab-content active">
              {missedEmis && missedEmis.length > 0 ? (
                <div className="missed-emis-section">
                  <div className="alert-message">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p>Missed payments may significantly impact your credit score. Please clear these payments as soon as possible.</p>
                  </div>
                  <table className="emi-table">
                    <thead>
                      <tr>
                        <th>Due Date</th>
                        <th>EMI #</th>
                        <th>Days Late</th>
                        <th>Amount</th>
                        <th>Penalty</th>
                        <th>Total Due</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {missedEmis.map((payment) => (
                        <tr key={payment._id} className="overdue-row">
                          <td>{formatDate(payment.dueDate)}</td>
                          <td>{payment.emiNumber || 1}</td>
                          <td>{payment.daysLate || Math.ceil((new Date() - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24))} days</td>
                          <td>{formatCurrency(payment.amount)}</td>
                          <td>{formatCurrency(payment.latePaymentFee || 0)}</td>
                          <td>{formatCurrency((payment.amount || 0) + (payment.latePaymentFee || 0))}</td>
                          <td>
                            <button className="pay-btn overdue-btn" onClick={() => openPaymentModal(payment)}>
                              Pay Now
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <i className="fas fa-check-circle"></i>
                  <h3>No Missed Payments</h3>
                  <p>Great job! You have no missed payments.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedEmi && (
        <div className="payment-modal-overlay" onClick={closePaymentModal}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Pay EMI</h3>
              <button className="close-modal-btn" onClick={closePaymentModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="payment-details">
                <div className="detail-row">
                  <span>EMI Amount:</span>
                  <span className="amount">{formatCurrency(selectedEmi.amount)}</span>
                </div>
                {selectedEmi.latePaymentFee && selectedEmi.latePaymentFee > 0 && (
                  <div className="detail-row">
                    <span>Late Fee:</span>
                    <span className="amount">{formatCurrency(selectedEmi.latePaymentFee)}</span>
                  </div>
                )}
                <div className="detail-row total">
                  <span>Total Amount:</span>
                  <span className="amount">
                    {formatCurrency((selectedEmi.amount || 0) + (selectedEmi.latePaymentFee || 0))}
                  </span>
                </div>
              </div>

              <div className="payment-method-section">
                <label>Payment Method:</label>
                <select 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="account">Account Balance</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="net_banking">Net Banking</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              {paymentMethod === 'account' && (
                <div className="balance-info">
                  <i className="fas fa-wallet"></i>
                  <span>Available Balance: {formatCurrency(user?.accountBalance || 0)}</span>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={closePaymentModal}>
                Cancel
              </button>
              <button 
                className="confirm-pay-btn" 
                onClick={handlePayEmi}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i> Confirm Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayEMI;
