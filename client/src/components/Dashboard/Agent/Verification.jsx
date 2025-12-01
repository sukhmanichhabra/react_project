import React, { useState } from "react";
import { agentAPI } from "../../../services/api";
import "./Verification.css";

const Verification = ({ agentProfile, onProfileUpdate }) => {
  const [idProof, setIdProof] = useState(null);
  const [license, setLicense] = useState(null);
  const [businessProof, setBusinessProof] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [additionalDocs, setAdditionalDocs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: "", message: "" });

  // Check verification status to determine what to show
  const verificationStatus = agentProfile?.verificationStatus || "unverified";
  const verificationMessage = agentProfile?.verificationMessage || "";

  // Determine if user can upload documents
  const canUpload = ["unverified", "rejected"].includes(verificationStatus);
  const hasBeenRejected = verificationStatus === "rejected";
  const isPending = verificationStatus === "pending";
  const isVerified = verificationStatus === "verified";
  // const isUnverified = verificationStatus === "unverified";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!idProof || !license) {
      setUploadStatus({
        type: "error",
        message:
          "Please select both ID Proof and Real Estate License documents.",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: "", message: "" });

    try {
      const formData = new FormData();

      // Append required documents
      if (idProof) formData.append("idProof", idProof);
      if (license) formData.append("license", license);
      if (businessProof) formData.append("businessProof", businessProof);
      if (profilePhoto) formData.append("profilePhoto", profilePhoto);

      // Append additional documents
      if (additionalDocs.length > 0) {
        additionalDocs.forEach((doc) => {
          formData.append("additionalDocs", doc);
        });
      }

      const response = await agentAPI.uploadDocuments(formData);

      if (response.status === 200 || response.status === 302) {
        setUploadStatus({
          type: "success",
          message:
            "Documents uploaded successfully! Your verification is now pending review.",
        });

        // Clear form
        setIdProof(null);
        setLicense(null);
        setBusinessProof(null);
        setProfilePhoto(null);
        setAdditionalDocs([]);

        // Reset file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach((input) => (input.value = ""));

        // Update parent component if callback provided
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      }
    } catch (error) {
      console.error("Error uploading documents:", error);

      let errorMessage = "Failed to upload documents. Please try again.";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 400) {
        errorMessage =
          "Please complete your profile before submitting documents.";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (error.response?.status === 404) {
        errorMessage = "Agent profile not found. Please contact support.";
      }

      setUploadStatus({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdditionalDocsChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setUploadStatus({
        type: "error",
        message: "You can upload maximum 5 additional documents.",
      });
      return;
    }
    setAdditionalDocs(files);
  };

  const getStatusIcon = (status) => {
    if (status === "verified") return "fa-check-circle";
    if (status === "pending") return "fa-clock";
    if (status === "rejected") return "fa-times-circle";
    if (status === "unverified") return "fa-upload";
    return "fa-exclamation-circle";
  };

  const getStatusColor = (status) => {
    if (status === "verified") return "success";
    if (status === "pending") return "warning";
    if (status === "rejected") return "error";
    if (status === "unverified") return "info";
    return "info";
  };

  const getStatusText = (status) => {
    switch (status) {
      case "verified":
        return "VERIFIED";
      case "pending":
        return "PENDING REVIEW";
      case "rejected":
        return "REJECTED";
      case "unverified":
        return "NOT VERIFIED";
      default:
        return "NOT VERIFIED";
    }
  };

  return (
    <section id="verification">
      <div className="dash-section-header">
        <h2>Agent Verification</h2>
        <p>Submit your documents to get your "Verified" badge.</p>
      </div>

      {/* Status Display */}
      <div
        className={`dash-verification-status-box ${getStatusColor(
          verificationStatus
        )}`}
      >
        <i className={`fas ${getStatusIcon(verificationStatus)}`}></i>
        <div className="dash-status-text">
          <strong>Status: {getStatusText(verificationStatus)}</strong>
          <p>
            {verificationMessage ||
              "Complete your profile and submit documents for verification."}
          </p>
        </div>
      </div>

      {/* Rejection Notice */}
      {hasBeenRejected && (
        <div className="dash-rejection-notice">
          <div className="dash-rejection-header">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Verification Rejected</h3>
          </div>
          <div className="dash-rejection-body">
            <p>
              <strong>Reason for rejection:</strong>
            </p>
            <p className="rejection-message">{verificationMessage}</p>
            <p className="rejection-help">
              Please review the feedback above and upload new documents that
              address the concerns mentioned.
            </p>
          </div>
        </div>
      )}

      {/* Pending Review Notice */}
      {isPending && (
        <div className="dash-pending-notice">
          <div className="dash-pending-header">
            <i className="fas fa-clock"></i>
            <h3>Documents Under Review</h3>
          </div>
          <div className="dash-pending-body">
            <p>
              Your documents have been submitted and are currently being
              reviewed by our verification team.
            </p>
            <ul>
              <li>Review typically takes 1-2 business days</li>
              <li>
                You will receive an email notification once the review is
                complete
              </li>
              <li>
                Please do not upload new documents while review is in progress
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Upload Status Messages */}
      {uploadStatus.message && (
        <div className={`dash-alert dash-alert-${uploadStatus.type}`}>
          <i
            className={`fas ${
              uploadStatus.type === "success"
                ? "fa-check-circle"
                : "fa-exclamation-triangle"
            }`}
          ></i>
          {uploadStatus.message}
        </div>
      )}

      {/* Document Upload Form */}
      {canUpload && (
        <form
          className="dash-form-section"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <h3>
            {hasBeenRejected ? "Upload Updated Documents" : "Submit Documents"}
          </h3>
          <p>
            {hasBeenRejected
              ? "Please upload updated documents that address the concerns mentioned in the rejection message above."
              : "Upload your documents to start the verification process. Your profile must be complete before submitting documents."}
          </p>

          <div className="dash-form-grid">
            <div className="dash-form-group">
              <label htmlFor="idProof">
                ID Proof (Passport, Driver's License) *
              </label>
              <input
                type="file"
                id="idProof"
                name="idProof"
                accept="image/*,application/pdf"
                onChange={(e) => setIdProof(e.target.files[0])}
                required
                disabled={isUploading}
              />
              <small>
                Required: Upload a clear image or PDF of your government-issued
                ID
              </small>
            </div>

            <div className="dash-form-group">
              <label htmlFor="license">Real Estate License *</label>
              <input
                type="file"
                id="license"
                name="license"
                accept="image/*,application/pdf"
                onChange={(e) => setLicense(e.target.files[0])}
                required
                disabled={isUploading}
              />
              <small>Required: Upload your valid real estate license</small>
            </div>
          </div>

          <div className="dash-form-grid">
            <div className="dash-form-group">
              <label htmlFor="businessProof">Proof of Business</label>
              <input
                type="file"
                id="businessProof"
                name="businessProof"
                accept="image/*,application/pdf"
                onChange={(e) => setBusinessProof(e.target.files[0])}
                disabled={isUploading}
              />
              <small>
                Optional: Business registration, company certificate, etc.
              </small>
            </div>

            <div className="dash-form-group">
              <label htmlFor="profilePhoto">Profile Photo</label>
              <input
                type="file"
                id="profilePhoto"
                name="profilePhoto"
                accept="image/*"
                onChange={(e) => setProfilePhoto(e.target.files[0])}
                disabled={isUploading}
              />
              <small>Optional: Professional headshot for your profile</small>
            </div>
          </div>

          <div className="dash-form-group full-width">
            <label htmlFor="additionalDocs">Additional Documents</label>
            <input
              type="file"
              id="additionalDocs"
              name="additionalDocs"
              accept="image/*,application/pdf"
              multiple
              onChange={handleAdditionalDocsChange}
              disabled={isUploading}
            />
            <small>
              Optional: Upload up to 5 additional supporting documents
            </small>
            {additionalDocs.length > 0 && (
              <div className="selected-files">
                <p>
                  Selected files:{" "}
                  {additionalDocs.map((file) => file.name).join(", ")}
                </p>
              </div>
            )}
          </div>

          <div className="dash-form-actions">
            <button
              type="submit"
              className="dash-submit-btn"
              disabled={isUploading || !idProof || !license}
            >
              {isUploading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Uploading...
                </>
              ) : (
                <>
                  <i className="fas fa-upload"></i>
                  {hasBeenRejected
                    ? "Resubmit for Verification"
                    : "Submit for Verification"}
                </>
              )}
            </button>
          </div>

          <div className="dash-verification-info">
            <h4>Verification Process</h4>
            <ul>
              <li>
                Ensure your profile is complete with all required information
              </li>
              <li>Upload clear, readable documents (images or PDFs)</li>
              <li>Maximum file size: 5MB per document</li>
              <li>Verification typically takes 1-2 business days</li>
              <li>You'll receive an email notification once reviewed</li>
            </ul>
          </div>
        </form>
      )}

      {/* Verified Status Info */}
      {isVerified && (
        <div className="dash-verified-info">
          <div className="dash-verified-badge">
            <i className="fas fa-check-circle"></i>
            <h3>Congratulations!</h3>
            <p>
              Your agent account has been verified. You now have access to all
              premium features and your profile displays the verified badge.
            </p>
            <div className="verified-benefits">
              <h4>Your verified status includes:</h4>
              <ul>
                <li>
                  <i className="fas fa-check"></i> Verified badge on your
                  profile
                </li>
                <li>
                  <i className="fas fa-check"></i> Access to premium agent
                  features
                </li>
                <li>
                  <i className="fas fa-check"></i> Higher visibility in search
                  results
                </li>
                <li>
                  <i className="fas fa-check"></i> Enhanced credibility with
                  clients
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Unable to Upload Notice */}
      {isPending && (
        <div className="dash-upload-disabled">
          <i className="fas fa-lock"></i>
          <h3>Document Upload Disabled</h3>
          <p>
            You cannot upload new documents while your current submission is
            being reviewed. Please wait for the review to complete.
          </p>
        </div>
      )}
    </section>
  );
};

export default Verification;
