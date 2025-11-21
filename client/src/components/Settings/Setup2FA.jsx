import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Setup2FA.css';

const Setup2FA = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const [showManualEntry, setShowManualEntry] = useState(false);

  useEffect(() => {
    fetchSetup2FA();
  }, []);

  const fetchSetup2FA = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.getSetup2FA();

      if (response.data.success && response.data.data) {
        setQrCode(response.data.data.qrCode);
        setSecret(response.data.data.secret);
      } else {
        setError('Failed to load 2FA setup');
      }
    } catch (err) {
      console.error('Error fetching 2FA setup:', err);
      if (err.response?.status === 401) {
        navigate('/auth/signin');
      } else {
        setError(err.response?.data?.message || 'Failed to load 2FA setup');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setVerifying(true);
      setVerificationError(null);

      const response = await authAPI.enable2FA(verificationCode);

      if (response.data.success) {
        // Redirect to settings with success message
        navigate('/settings?success=2fa-enabled');
      } else {
        setVerificationError(response.data.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Error verifying 2FA:', err);
      setVerificationError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setVerifying(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    setVerificationError(null);
  };

  if (loading) {
    return (
      <div className="setup-2fa-loading">
        <div className="spinner"></div>
        <p>Loading 2FA setup...</p>
      </div>
    );
  }

  return (
    <div className="setup-2fa-page">
      <div className="setup-2fa-container">
        <div className="setup-header">
          <h1>Set Up Two-Factor Authentication</h1>
          <p>Secure your account with an additional layer of protection</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Instructions Section */}
        <div className="setup-section">
          <h2>
            <span className="step-number">1</span>
            Download an Authenticator App
          </h2>
          <p>Install one of these authenticator apps on your mobile device:</p>
          <div className="app-links">
            <a
              href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
              target="_blank"
              rel="noopener noreferrer"
              className="app-link"
            >
              <i className="fab fa-android"></i>
              Google Authenticator (Android)
            </a>
            <a
              href="https://apps.apple.com/us/app/google-authenticator/id388497605"
              target="_blank"
              rel="noopener noreferrer"
              className="app-link"
            >
              <i className="fab fa-apple"></i>
              Google Authenticator (iOS)
            </a>
            <a
              href="https://authy.com/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="app-link"
            >
              <i className="fas fa-mobile-alt"></i>
              Authy
            </a>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="setup-section">
          <h2>
            <span className="step-number">2</span>
            Scan QR Code
          </h2>
          <p>Open your authenticator app and scan this QR code:</p>
          {qrCode && (
            <div className="qr-container">
              <img src={qrCode} alt="2FA QR Code" className="qr-code" />
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowManualEntry(!showManualEntry)}
            className="toggle-manual-btn"
          >
            {showManualEntry ? (
              <>
                <i className="fas fa-qrcode"></i> Show QR Code
              </>
            ) : (
              <>
                <i className="fas fa-keyboard"></i> Can't Scan? Enter Manually
              </>
            )}
          </button>

          {showManualEntry && secret && (
            <div className="manual-entry-section">
              <p>Enter this secret key manually in your authenticator app:</p>
              <div className="secret-key-container">
                <code className="secret-key">{secret}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(secret);
                    alert('Secret key copied to clipboard!');
                  }}
                  className="copy-btn"
                  title="Copy to clipboard"
                >
                  <i className="fas fa-copy"></i>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Verification Section */}
        <div className="setup-section verification-section">
          <h2>
            <span className="step-number">3</span>
            Verify Setup
          </h2>
          <p>Enter the 6-digit code from your authenticator app to complete setup:</p>

          <form onSubmit={handleVerify} className="verification-form">
            <div className="form-group">
              <label htmlFor="verificationCode">Verification Code</label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={handleCodeChange}
                placeholder="000000"
                maxLength="6"
                inputMode="numeric"
                className="verification-input"
                disabled={verifying}
                autoFocus
              />
              {verificationError && (
                <div className="input-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {verificationError}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={verifying || verificationCode.length !== 6}
              className="btn btn-primary btn-large"
            >
              {verifying ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Verifying...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i> Verify and Complete Setup
                </>
              )}
            </button>
          </form>
        </div>

        {/* Important Notes */}
        <div className="setup-section important-notes">
          <h3>
            <i className="fas fa-lightbulb"></i>
            Important Notes
          </h3>
          <ul>
            <li>Save your secret key in a safe place as a backup</li>
            <li>You'll need your authenticator app to log in to your account</li>
            <li>If you lose access to your authenticator app, you won't be able to log in</li>
            <li>You can disable 2FA anytime from your account settings</li>
          </ul>
        </div>

        {/* Back Button */}
        <div className="setup-footer">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="btn btn-secondary"
          >
            <i className="fas fa-arrow-left"></i> Back to Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setup2FA;
