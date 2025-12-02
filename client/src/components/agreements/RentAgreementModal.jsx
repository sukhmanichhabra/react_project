import React, { useState } from "react";
import { agreementsAPI } from "../../services/api";
import "./RentAgreementModal.css";

const RentAgreementModal = ({ property, isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({
    startDate: "",
    months: 12,
    securityDeposit: "",
    maintenance: "",
    tenantName: "",
    tenantPhone: "",
    tenantMaritalStatus: "single",
    tenantGovtIdType: "",
    tenantGovtIdNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !property) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const payload = {
        startDate: form.startDate,
        months: form.months,
        securityDeposit: form.securityDeposit,
        maintenance: form.maintenance,
        tenantName: form.tenantName,
        tenantPhone: form.tenantPhone,
        tenantMaritalStatus: form.tenantMaritalStatus,
        tenantGovtIdType: form.tenantGovtIdType,
        tenantGovtIdNumber: form.tenantGovtIdNumber,
      };

      const response = await agreementsAPI.createRentAgreement(
        property._id,
        payload
      );
      if (response.data?.success) {
        alert("Rent agreement request submitted for seller approval.");
        if (onCreated) onCreated(response.data.data);
        onClose();
      } else {
        alert(
          response.data?.message ||
            "Failed to create rent agreement. Please try again."
        );
      }
    } catch (error) {
      console.error("Error creating rent agreement:", error);
      alert(
        error.response?.data?.message ||
          "Failed to create rent agreement. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="rent-agreement-modal-overlay" onClick={onClose}>
      <div
        className="rent-agreement-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rent-agreement-modal-header">
          <h2>Request Rent Agreement</h2>
          <button
            className="rent-agreement-close-btn"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="rent-agreement-modal-body">
          <div className="rent-agreement-property-summary">
            <h3>{property.title}</h3>
            <p className="rent-agreement-location">{property.location}</p>
            <p className="rent-agreement-price">{property.price}</p>
          </div>

          <form className="rent-agreement-form" onSubmit={handleSubmit}>
            <div className="rent-agreement-form-grid">
              <div className="rent-agreement-form-group">
                <label htmlFor="tenantName">Tenant Full Name</label>
                <input
                  id="tenantName"
                  name="tenantName"
                  type="text"
                  value={form.tenantName}
                  onChange={handleChange}
                  placeholder="Your legal name"
                  required
                />
              </div>

              <div className="rent-agreement-form-group">
                <label htmlFor="tenantMaritalStatus">Marital Status</label>
                <select
                  id="tenantMaritalStatus"
                  name="tenantMaritalStatus"
                  value={form.tenantMaritalStatus}
                  onChange={handleChange}
                  required
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="rent-agreement-form-group">
                <label htmlFor="tenantGovtIdType">Government ID Type</label>
                <input
                  id="tenantGovtIdType"
                  name="tenantGovtIdType"
                  type="text"
                  value={form.tenantGovtIdType}
                  onChange={handleChange}
                  placeholder="e.g. Aadhaar, PAN, Passport"
                  required
                />
              </div>

              <div className="rent-agreement-form-group">
                <label htmlFor="tenantGovtIdNumber">Government ID Number</label>
                <input
                  id="tenantGovtIdNumber"
                  name="tenantGovtIdNumber"
                  type="text"
                  value={form.tenantGovtIdNumber}
                  onChange={handleChange}
                  placeholder="Enter ID number"
                  required
                />
              </div>

              <div className="rent-agreement-form-group">
                <label htmlFor="tenantPhone">Tenant Phone</label>
                <input
                  id="tenantPhone"
                  name="tenantPhone"
                  type="tel"
                  value={form.tenantPhone}
                  onChange={handleChange}
                  placeholder="Contact number"
                  required
                />
              </div>

              <div className="rent-agreement-form-group">
                <label htmlFor="startDate">Agreement Start Date</label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  min={today}
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="rent-agreement-form-group">
                <label htmlFor="months">Lease Duration (months)</label>
                <input
                  id="months"
                  name="months"
                  type="number"
                  min={1}
                  max={60}
                  value={form.months}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="rent-agreement-form-group">
                <label htmlFor="securityDeposit">Security Deposit</label>
                <input
                  id="securityDeposit"
                  name="securityDeposit"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.securityDeposit}
                  onChange={handleChange}
                  placeholder="e.g. 2 months' rent"
                />
              </div>

              <div className="rent-agreement-form-group">
                <label htmlFor="maintenance">
                  Monthly Maintenance (optional)
                </label>
                <input
                  id="maintenance"
                  name="maintenance"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.maintenance}
                  onChange={handleChange}
                  placeholder="Maintenance charges, if any"
                />
              </div>
            </div>

            {/* <div className="rent-agreement-terms">
              <h4>Key Terms</h4>
              <ul>
                <li>
                  The tenant cannot cancel the rent agreement before the end of
                  the agreed lease period.
                </li>
                <li>
                  The owner may cancel the agreement in exceptional cases,
                  subject to platform and legal policies.
                </li>
                <li>
                  All rent payments will be managed through this platform for a
                  clear audit trail.
                </li>
              </ul>
            </div> */}

            <div className="rent-agreement-modal-footer">
              <button
                type="button"
                className="rent-agreement-secondary-btn"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rent-agreement-primary-btn"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Agreement Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RentAgreementModal;
