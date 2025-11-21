import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [disabling2FA, setDisabling2FA] = useState(false);

  useEffect(() => {
    fetchSettings();
    
    // Check for success message in URL
    const successParam = searchParams.get('success');
    if (successParam === '2fa-enabled') {
      setSuccess('Two-factor authentication has been successfully enabled for your account.');
    } else if (successParam === '2fa-disabled') {
      setSuccess('Two-factor authentication has been disabled for your account.');
    }
  }, [searchParams]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.getSettings();

      if (response.data.success && response.data.data.user) {
        setUser(response.data.data.user);
      } else {
        setError('Failed to load settings');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      if (err.response?.status === 401) {
        navigate('/auth/signin');
      } else {
        setError(err.response?.data?.message || 'Failed to load settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = () => {
    navigate('/auth/setup-2fa');
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable two-factor authentication?')) {
      return;
    }

    try {
      setDisabling2FA(true);
      const response = await authAPI.disable2FA();

      if (response.data.success) {
        setSuccess('Two-factor authentication has been disabled for your account.');
        setUser(prev => ({ ...prev, twoFactorEnabled: false }));
      } else {
        setError(response.data.message || 'Failed to disable 2FA');
      }
    } catch (err) {
      console.error('Error disabling 2FA:', err);
      setError(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setDisabling2FA(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading-container">
        <div className="spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="settings-error-container">
        <p>Unable to load user settings</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1>Account Settings</h1>

        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="alert-close">×</button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i>
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="alert-close">×</button>
          </div>
        )}

        {/* Security Settings Section */}
        <div className="settings-section">
          <h2>
            <i className="fas fa-shield-alt"></i>
            Security Settings
          </h2>

          <div className="security-option">
            <div className="option-header">
              <div className="option-info">
                <h3>Two-Factor Authentication</h3>
                <p>Add an extra layer of security to your account by requiring a verification code in addition to your password.</p>
              </div>
              <div className="option-status">
                {user.twoFactorEnabled ? (
                  <span className="status-badge status-enabled">
                    <i className="fas fa-check-circle"></i> Enabled
                  </span>
                ) : (
                  <span className="status-badge status-disabled">
                    <i className="fas fa-times-circle"></i> Disabled
                  </span>
                )}
              </div>
            </div>

            <div className="option-actions">
              {user.twoFactorEnabled ? (
                <button
                  onClick={handleDisable2FA}
                  disabled={disabling2FA}
                  className="btn btn-danger"
                >
                  {disabling2FA ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Disabling...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-lock-open"></i> Disable
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleSetup2FA}
                  className="btn btn-primary"
                >
                  <i className="fas fa-lock"></i> Set Up
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Account Information Section */}
        <div className="settings-section">
          <h2>
            <i className="fas fa-user"></i>
            Account Information
          </h2>

          <div className="account-info">
            <div className="info-item">
              <label>Name</label>
              <p>{user.name}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{user.email}</p>
            </div>
            <div className="info-item">
              <label>Account Type</label>
              <p className="role-badge">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="settings-footer">
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            <i className="fas fa-arrow-left"></i> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
