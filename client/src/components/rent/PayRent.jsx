import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { rentAPI } from "../../services/api";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { selectAuth, fetchUserBalance } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import "./PayRent.css";

const PayRent = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const [loading, setLoading] = useState(true);
  const [rentData, setRentData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRent, setSelectedRent] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("account");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (!mounted) return;
      
      try {
        await fetchRentData();
        
        // Fetch latest user balance
        if (user && mounted) {
          dispatch(fetchUserBalance());
        }
      } catch (error) {
        console.error('Error loading rent data:', error);
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRentData = async () => {
    try {
      setLoading(true);
      const response = await rentAPI.getRentPaymentPage();
      if (response.data.success) {
        setRentData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching rent data:", error);
      toast.error("Failed to load rent information");
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = (rent, propertyTitle) => {
    setSelectedRent({ ...rent, propertyTitle });
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedRent(null);
    setPaymentMethod("account");
  };

  const handlePayRent = async (e) => {
    e.preventDefault();
    
    if (!selectedRent) return;

    // Check if user has sufficient balance
    const userBalance = user?.accountBalance || 0;
    const rentAmount = selectedRent.amount;

    if (paymentMethod === "account" && userBalance < rentAmount) {
      toast.error("Insufficient account balance!");
      return;
    }

    try {
      setProcessing(true);
      const response = await rentAPI.payRent(selectedRent._id, paymentMethod);
      
      if (response.data.success) {
        toast.success("Rent payment successful!");
        closePaymentModal();
        // Refresh data
        fetchRentData();
        dispatch(fetchUserBalance());
      }
    } catch (error) {
      console.error("Error paying rent:", error);
      const errorMessage = error.response?.data?.message || "Failed to process payment";
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="rent-loading">
        <div className="spinner"></div>
        <p>Loading rent information...</p>
      </div>
    );
  }

  if (!rentData) {
    return (
      <div className="rent-error">
        <i className="fas fa-exclamation-triangle"></i>
        <p>Failed to load rent information</p>
      </div>
    );
  }

  const { properties, upcomingRents, paidRents, overdueRents, totalPaid, totalDue } = rentData;

  return (
    <div className="pay-rent-container">
      <div className="rent-header">
        <h1>My Rent Dashboard</h1>
        <button className="refresh-btn" onClick={fetchRentData}>
          <i className="fas fa-sync-alt"></i> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="rent-summary">
        <div className="summary-card total-paid">
          <div className="card-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="card-content">
            <h3>Total Paid</h3>
            <div className="amount">{formatCurrency(totalPaid)}</div>
          </div>
        </div>

        <div className="summary-card total-due">
          <div className="card-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="card-content">
            <h3>Total Due</h3>
            <div className="amount">{formatCurrency(totalDue)}</div>
          </div>
        </div>

        <div className="summary-card overdue">
          <div className="card-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="card-content">
            <h3>Overdue Payments</h3>
            <div className="amount">{overdueRents?.length || 0}</div>
          </div>
        </div>

        <div className="summary-card account-balance">
          <div className="card-icon">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="card-content">
            <h3>Account Balance</h3>
            <div className="amount">{formatCurrency(user?.accountBalance || 0)}</div>
          </div>
        </div>
      </div>

      {/* Rental Properties */}
      <section className="rent-section">
        <h2>
          <i className="fas fa-home"></i> My Rental Properties
        </h2>
        {properties && properties.length > 0 ? (
          <div className="property-grid">
            {properties.map((property) => {
              const pendingRent = property.rentHistory?.find(
                (rent) => rent.status === "pending" || rent.status === "overdue"
              );

              return (
                <div key={property._id} className="property-rent-card">
                  <div className="property-image">
                    <img
                      src={property.images?.[0] || "/assets/default-property.jpg"}
                      alt={property.title}
                    />
                    {property.hasPendingRent && (
                      <span className="rent-due-badge">Rent Due</span>
                    )}
                  </div>
                  <div className="property-info">
                    <h3>{property.title}</h3>
                    <p className="property-location">
                      <i className="fas fa-map-marker-alt"></i> {property.location}
                    </p>
                    <div className="property-rent-price">{property.price}</div>
                    <div className="property-actions">
                      <button
                        className="view-details-btn"
                        onClick={() => navigate(`/property/${property._id}`)}
                      >
                        View Details
                      </button>
                      {pendingRent ? (
                        <button
                          className="pay-now-btn"
                          onClick={() => openPaymentModal(pendingRent, property.title)}
                        >
                          Pay Rent
                        </button>
                      ) : (
                        <button className="no-rent-btn" disabled>
                          No Rent Due
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-home"></i>
            <h3>No Rental Properties</h3>
            <p>You haven't rented any properties yet.</p>
            <button onClick={() => navigate("/properties")} className="browse-btn">
              Browse Properties
            </button>
          </div>
        )}
      </section>

      {/* Overdue Payments */}
      {overdueRents && overdueRents.length > 0 && (
        <section className="rent-section">
          <h2 className="urgent">
            <i className="fas fa-exclamation-circle"></i> Overdue Payments
          </h2>
          <div className="rent-table-wrapper">
            <table className="rent-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {overdueRents.map((rent) => {
                  const daysOverdue = Math.floor(
                    (new Date() - new Date(rent.dueDate)) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <tr key={rent._id} className="overdue-row">
                      <td>
                        <div className="property-cell">
                          <img
                            src={rent.propertyImage || "/assets/default-property.jpg"}
                            alt={rent.propertyTitle}
                          />
                          <span>{rent.propertyTitle}</span>
                        </div>
                      </td>
                      <td className="amount-cell">{formatCurrency(rent.amount)}</td>
                      <td>{formatDate(rent.dueDate)}</td>
                      <td className="overdue-days">{daysOverdue} days</td>
                      <td>
                        <button
                          className="pay-urgent-btn"
                          onClick={() => openPaymentModal(rent, rent.propertyTitle)}
                        >
                          Pay Now
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Upcoming Payments */}
      {upcomingRents && upcomingRents.length > 0 && (
        <section className="rent-section">
          <h2>
            <i className="fas fa-calendar-alt"></i> Upcoming Payments
          </h2>
          <div className="rent-table-wrapper">
            <table className="rent-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {upcomingRents.map((rent) => (
                  <tr key={rent._id}>
                    <td>
                      <div className="property-cell">
                        <img
                          src={rent.propertyImage || "/assets/default-property.jpg"}
                          alt={rent.propertyTitle}
                        />
                        <span>{rent.propertyTitle}</span>
                      </div>
                    </td>
                    <td className="amount-cell">{formatCurrency(rent.amount)}</td>
                    <td>{formatDate(rent.dueDate)}</td>
                    <td>
                      <span className="status-badge status-pending">Pending</span>
                    </td>
                    <td>
                      <button
                        className="pay-btn"
                        onClick={() => openPaymentModal(rent, rent.propertyTitle)}
                      >
                        Pay Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Payment History */}
      <section className="rent-section">
        <h2>
          <i className="fas fa-history"></i> Payment History
        </h2>
        {paidRents && paidRents.length > 0 ? (
          <div className="rent-table-wrapper">
            <table className="rent-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Paid Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paidRents.map((rent) => (
                  <tr key={rent._id}>
                    <td>
                      <div className="property-cell">
                        <img
                          src={rent.propertyImage || "/assets/default-property.jpg"}
                          alt={rent.propertyTitle}
                        />
                        <span>{rent.propertyTitle}</span>
                      </div>
                    </td>
                    <td className="amount-cell">{formatCurrency(rent.amount)}</td>
                    <td>{formatDate(rent.dueDate)}</td>
                    <td>{rent.paidDate ? formatDate(rent.paidDate) : "N/A"}</td>
                    <td>
                      <span className="status-badge status-paid">Paid</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-receipt"></i>
            <h3>No Payment History</h3>
            <p>You haven't made any rent payments yet.</p>
          </div>
        )}
      </section>

      {/* Payment Modal */}
      {showPaymentModal && selectedRent && (
        <div className="payment-modal-overlay" onClick={closePaymentModal}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-credit-card"></i> Pay Rent
              </h3>
              <button className="close-modal-btn" onClick={closePaymentModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="payment-info">
                <div className="info-row">
                  <span className="info-label">Property:</span>
                  <span className="info-value">{selectedRent.propertyTitle}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Amount Due:</span>
                  <span className="info-value amount-highlight">
                    {formatCurrency(selectedRent.amount)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Due Date:</span>
                  <span className="info-value">{formatDate(selectedRent.dueDate)}</span>
                </div>
              </div>

              <div className="balance-info">
                <i className="fas fa-wallet"></i>
                <span>Your Account Balance: {formatCurrency(user?.accountBalance || 0)}</span>
              </div>

              {user?.accountBalance < selectedRent.amount && (
                <div className="insufficient-funds-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>
                    Insufficient funds! You need{" "}
                    {formatCurrency(selectedRent.amount - (user?.accountBalance || 0))} more.
                  </span>
                </div>
              )}

              <form onSubmit={handlePayRent}>
                <div className="form-group">
                  <label htmlFor="paymentMethod">Payment Method</label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-select"
                  >
                    <option value="account">Account Balance</option>
                    <option value="credit_card">Credit/Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="confirm-payment-btn"
                  disabled={
                    processing ||
                    (paymentMethod === "account" && user?.accountBalance < selectedRent.amount)
                  }
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
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayRent;
