import React, { useState, useEffect, useRef } from 'react';

const ShareModal = ({ show, onClose, property }) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const qrRef = useRef(null);

  const propertyUrl = `${window.location.origin}/property/${property?._id || property?.id}`;

  useEffect(() => {
    if (show && property) {
      // Generate QR code using QR Server API (more reliable)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(propertyUrl)}`;
      setQrCodeUrl(qrUrl);
      console.log('QR Code URL:', qrUrl);
      console.log('Property URL:', propertyUrl);
    }
  }, [show, property, propertyUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(propertyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `property-${property?._id || property?.id}-qr.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('prop-overview-modal') || e.target.id === 'prop-overview-shareModal') {
      onClose();
    }
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  if (!show) return null;

  return (
    <>
      <div id="prop-overview-shareModal" className="prop-overview-modal" style={{ display: 'flex' }} onClick={handleOverlayClick}>
        <div className="prop-overview-modal-content" onClick={handleContentClick}>
          <span className="prop-overview-close-modal" onClick={onClose}>&times;</span>
          <h3>Share this Property</h3>
          
          <div className="prop-overview-share-link-container">
            <input
              type="text"
              id="prop-overview-shareLink"
              readOnly
              value={propertyUrl}
            />
            <button id="prop-overview-copyLinkBtn" onClick={handleCopyLink}>
              <i className="fas fa-copy"></i> {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          <div className="prop-overview-qr-code-container">
            <h4>Scan QR Code</h4>
            <p className="prop-overview-qr-subtitle">Scan this code with your phone to view the property</p>
            <div id="prop-overview-qrCode" ref={qrRef}>
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  onError={(e) => {
                    console.error('QR Code failed to load');
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<p style="color: red;">Failed to generate QR code</p>';
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <i className="fas fa-spinner fa-pulse"></i><br />Generating...
                </div>
              )}
            </div>
            <button id="prop-overview-downloadQrBtn" className="prop-overview-qr-download-btn" onClick={handleDownloadQR} disabled={!qrCodeUrl}>
              <i className="fas fa-download"></i> Download QR Code
            </button>
          </div>

          <div className="prop-overview-share-options">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out this property: ${property?.title} - ${propertyUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="prop-overview-share-option prop-overview-whatsapp"
            >
              <i className="fab fa-whatsapp"></i> WhatsApp
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent(`Property Recommendation: ${property?.title}`)}&body=${encodeURIComponent(`Check out this property: ${property?.title} - ${propertyUrl}`)}`}
              className="prop-overview-share-option prop-overview-email"
            >
              <i className="fas fa-envelope"></i> Email
            </a>
          </div>
        </div>
      </div>

      {copied && (
        <div className="prop-overview-toast prop-overview-show">
          <i className="fas fa-check"></i> Link copied to clipboard!
        </div>
      )}
    </>
  );
};

export default ShareModal;