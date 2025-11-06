import React, { useState } from "react";
import "./AddFundsModal.css";

const AddFundsModal = ({ isOpen, onClose, onAddFunds, currentBalance }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const predefinedAmounts = [1000, 5000, 10000, 50000, 100000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (parsedAmount > 10000000) {
      setError("Maximum amount is $10,000,000");
      return;
    }

    try {
      setLoading(true);
      await onAddFunds(parsedAmount);
      setAmount("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add funds");
    } finally {
      setLoading(false);
    }
  };

  const handlePredefinedAmount = (value) => {
    setAmount(value.toString());
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div className="add-funds-modal-overlay" onClick={onClose}>
      <div className="add-funds-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-funds-modal-header">
          <h2>
            <i className="fas fa-wallet"></i> Add Funds
          </h2>
          <button className="add-funds-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="add-funds-modal-body">
          {/* Current Balance */}
          <div className="current-balance-display">
            <span className="balance-label">Current Balance:</span>
            <span className="balance-value">
              ${currentBalance ? currentBalance.toLocaleString() : "0.00"}
            </span>
          </div>

          {/* Quick Amount Selection */}
          <div className="quick-amounts">
            <label>Quick Select:</label>
            <div className="quick-amounts-grid">
              {predefinedAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`quick-amount-btn ${
                    amount === value.toString() ? "active" : ""
                  }`}
                  onClick={() => handlePredefinedAmount(value)}
                >
                  ${value.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="amount">
                Enter Amount <span className="required">*</span>
              </label>
              <div className="amount-input-wrapper">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError("");
                  }}
                  placeholder="0.00"
                  min="1"
                  max="10000000"
                  step="0.01"
                  required
                  autoFocus
                />
              </div>
              <small className="help-text">
                Enter an amount between $1 and $10,000,000
              </small>
            </div>

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}

            {/* New Balance Preview */}
            {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
              <div className="new-balance-preview">
                <span>New Balance:</span>
                <span className="new-balance-value">
                  ${(
                    (currentBalance || 0) + parseFloat(amount)
                  ).toLocaleString()}
                </span>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !amount}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i> Add Funds
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFundsModal;
