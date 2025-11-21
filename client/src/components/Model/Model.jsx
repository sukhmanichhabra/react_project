import React, { useState, useEffect } from 'react';
import './Model.css';
import NavBar from '../partials/NavBar';
import Footer from '../partials/Footer';


const Model = () => {
  const [currentPage, setCurrentPage] = useState('hero');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyType: '',
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    area: 2000,
    furnishing: '',
    constructionYear: new Date().getFullYear(),
    condition: '',
    city: '',
    locality: '',
    airportDistance: 50,
    railwayDistance: 50,
    busDistance: 50,
    hospitalDistance: '',
    supermarketDistance: '',
    schoolDistance: '',
    mallDistance: '',
    storeDistance: '',
    pharmacyDistance: '',
    hoaFee: 0,
    hoaAmenities: [],
    viewType: '',
    airQuality: 50,
    noiseLevel: 50,
    electricityCost: 0,
    waterCost: 0,
  });

  const [prediction, setPrediction] = useState(null);

  const propertyTypes = [
    { icon: '🏠', title: 'Single Family' },
    { icon: '🏘️', title: 'Town Home' },
    { icon: '🏢', title: 'Condominium' },
    { icon: '🏗️', title: 'Multi-Family' },
    { icon: '🏡', title: 'Mobile / Manufactured' },
    { icon: '👷', title: 'New Construction' },
  ];

  const cities = [
    { icon: '🏙️', name: 'Mumbai', info: 'Financial capital with premium properties' },
    { icon: '🏛️', name: 'Delhi', info: 'Capital city with diverse neighborhoods' },
    { icon: '💻', name: 'Bangalore', info: 'Tech hub with modern infrastructure' },
    { icon: '🌊', name: 'Hyderabad', info: 'Growing IT and real estate hub' },
    { icon: '🏖️', name: 'Pune', info: 'Educational and IT center' },
    { icon: '🌳', name: 'Gurgaon', info: 'Corporate hub near Delhi' },
  ];

  const furnishingOptions = [
    { icon: '🪑', title: 'Fully Furnished' },
    { icon: '📦', title: 'Semi Furnished' },
    { icon: '🏠', title: 'Unfurnished' },
    { icon: '🔨', title: 'Under Construction' },
  ];

  const conditionOptions = [
    { icon: '😟', label: 'Poor' },
    { icon: '😐', label: 'Fair' },
    { icon: '🙂', label: 'Good' },
    { icon: '😊', label: 'Very Good' },
    { icon: '🤩', label: 'Excellent' },
  ];

  const conditionDescriptions = {
    'Poor': 'Needs major repairs, renovation or rebuilding. Multiple structural or mechanical issues present.',
    'Fair': 'Livable but needs significant repairs or updates. Some systems may need replacement.',
    'Good': 'Well maintained with minor repairs needed. Most systems are functional.',
    'Very Good': 'Recently updated with modern amenities. All systems in great working condition.',
    'Excellent': 'Like new condition with premium features. No repairs needed, move-in ready.'
  };

  const handleSelectCard = (value, field) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSliderChange = (e, field) => {
    setFormData(prev => ({ ...prev, [field]: parseInt(e.target.value) }));
  };

  const handleInputChange = (e, field) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleNextPage = () => {
    const pages = ['hero', 'propertyType', 'sliders', 'area', 'condition', 'city', 'amenities', 'view', 'pollution', 'utilities', 'prediction'];
    const currentIndex = pages.indexOf(currentPage);
    if (currentIndex < pages.length - 1) {
      setCurrentPage(pages[currentIndex + 1]);
      setCurrentStep(Math.ceil((currentIndex + 2) / 3));
    }
  };

  const handleBackPage = () => {
    const pages = ['hero', 'propertyType', 'sliders', 'area', 'condition', 'city', 'amenities', 'view', 'pollution', 'utilities', 'prediction'];
    const currentIndex = pages.indexOf(currentPage);
    if (currentIndex > 0) {
      setCurrentPage(pages[currentIndex - 1]);
      setCurrentStep(Math.ceil((currentIndex) / 3));
    }
  };

  const calculatePrediction = () => {
    // Simple prediction calculation based on form data
    const basePrice = 5000000; // Base price in INR
    const areaMultiplier = formData.area / 1000;
    const bedroomMultiplier = formData.bedrooms * 500000;
    const conditionMultiplier = {
      'Poor': 0.7,
      'Fair': 0.85,
      'Good': 1,
      'Very Good': 1.15,
      'Excellent': 1.3
    }[formData.condition] || 1;

    const furnishingMultiplier = {
      'Fully Furnished': 1.2,
      'Semi Furnished': 1.1,
      'Unfurnished': 1,
      'Under Construction': 0.8
    }[formData.furnishing] || 1;

    const predictedPrice = Math.round(
      (basePrice + bedroomMultiplier) * areaMultiplier * conditionMultiplier * furnishingMultiplier
    );

    setPrediction({
      price: predictedPrice,
      minPrice: Math.round(predictedPrice * 0.9),
      maxPrice: Math.round(predictedPrice * 1.1),
      accuracy: 85
    });

    setCurrentPage('prediction');
  };

  const renderHeroPage = () => (
    <div>
    <NavBar />
    <div className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <h1>When it comes to property valuation,<br />knowledge is power</h1>
          <p className="hero-subtitle">With our advanced AI-powered insights, use your property dashboard to stay on top of:</p>

          <div className="feature-grid">
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <h3>How much your property's worth</h3>
              <p>Get an estimated property value in less than a minute using our advanced prediction model.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <h3>Latest insights and data</h3>
              <p>Monitor the market trends to make informed property decisions.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏠</span>
              <h3>Comparative Analysis</h3>
              <p>Check out recently evaluated properties in your area for better insights.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <h3>Accurate Predictions</h3>
              <p>Track property values with our AI-powered prediction system for better investment decisions.</p>
            </div>
          </div>

          <button onClick={handleNextPage} className="start-btn">
            Start Valuation <i className="fas fa-arrow-right"></i>
          </button>
        </div>

        <div className="hero-image">
          <div className="prediction-card-preview">
            <div className="preview-header">
              <h3>Sample Property Valuation</h3>
              <span className="confidence-badge">High Confidence</span>
            </div>
            <div className="preview-price">₹1,20,00,000</div>
            <div className="preview-details">
              <div className="detail-row">
                <span>Location</span>
                <span>Premium Area</span>
              </div>
              <div className="detail-row">
                <span>Property Type</span>
                <span>3 BHK Apartment</span>
              </div>
              <div className="detail-row">
                <span>Area</span>
                <span>1500 sq.ft</span>
              </div>
              <div className="detail-row">
                <span>Furnishing</span>
                <span>Fully Furnished</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </div>
  );

  const renderPropertyType = () => (
    <div className="model-container">
      <div className="content-header">
        <h1>Select Property Type</h1>
        <p>What type of property are you evaluating?</p>
      </div>
      <div className="cards-grid">
        {propertyTypes.map((type, idx) => (
          <div
            key={idx}
            className={`card ${formData.propertyType === type.title ? 'selected' : ''}`}
            onClick={() => handleSelectCard(type.title, 'propertyType')}
          >
            <div className="card-icon">{type.icon}</div>
            <div className="card-title">{type.title}</div>
          </div>
        ))}
      </div>
      <div className="navigation-buttons">
        <button className="next-button" onClick={handleNextPage}>Next</button>
        <button className="back-button" onClick={handleBackPage}>← Back</button>
      </div>
    </div>
  );

  const renderSliders = () => (
    <div className="model-container">
      <div className="content-header">
        <h1>Tell us more about your requirements</h1>
        <p>Use the sliders to select your preferences</p>
      </div>

      <div className="slider-wrapper">
        <div className="slider-value">{formData.bedrooms} Bedrooms</div>
        <div className="slider-label">Number of Bedrooms</div>
        <input
          type="range"
          min="1"
          max="6"
          value={formData.bedrooms}
          onChange={(e) => handleSliderChange(e, 'bedrooms')}
          className="slider"
        />
      </div>

      <div className="slider-wrapper">
        <div className="slider-value">{formData.bathrooms} Bathrooms</div>
        <div className="slider-label">Number of Bathrooms</div>
        <input
          type="range"
          min="1"
          max="4"
          value={formData.bathrooms}
          onChange={(e) => handleSliderChange(e, 'bathrooms')}
          className="slider"
        />
      </div>

      <div className="slider-wrapper">
        <div className="slider-value">{formData.parking} Parking</div>
        <div className="slider-label">Number of Parking Spaces</div>
        <input
          type="range"
          min="0"
          max="3"
          value={formData.parking}
          onChange={(e) => handleSliderChange(e, 'parking')}
          className="slider"
        />
      </div>

      <div className="navigation-buttons">
        <button className="next-button" onClick={handleNextPage}>Next</button>
        <button className="back-button" onClick={handleBackPage}>← Back</button>
      </div>
    </div>
  );

  const renderArea = () => (
    <div className="model-container">
      <div className="content-header">
        <h1>What is the area of your house?</h1>
        <p>Use the slider to select the approximate area in square feet</p>
      </div>

      <div className="slider-wrapper">
        <div className="area-value">{formData.area} sq ft</div>
        <input
          type="range"
          min="500"
          max="5000"
          step="100"
          value={formData.area}
          onChange={(e) => handleSliderChange(e, 'area')}
          className="slider"
        />
      </div>

      <h2 style={{ textAlign: 'center', margin: '40px 0 20px' }}>Furnishing Status</h2>

      <div className="furnishing-cards">
        {furnishingOptions.map((option, idx) => (
          <div
            key={idx}
            className={`furnishing-card ${formData.furnishing === option.title ? 'selected' : ''}`}
            onClick={() => handleSelectCard(option.title, 'furnishing')}
          >
            <div className="furnishing-icon">{option.icon}</div>
            <div className="furnishing-title">{option.title}</div>
          </div>
        ))}
      </div>

      <div className="navigation-buttons">
        <button className="next-button" onClick={handleNextPage}>Next</button>
        <button className="back-button" onClick={handleBackPage}>← Back</button>
      </div>
    </div>
  );

  const renderCondition = () => (
    <div className="model-container">
      <div className="content-header">
        <h1>Tell us about your house condition</h1>
        <p>Please provide the construction year and overall condition</p>
      </div>

      <div className="year-input">
        <h3>Construction Year</h3>
        <input
          type="number"
          min="1900"
          max={new Date().getFullYear()}
          value={formData.constructionYear}
          onChange={(e) => handleInputChange(e, 'constructionYear')}
          placeholder="YYYY"
        />
      </div>

      <div className="condition-selector">
        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Overall Condition</h3>
        <div className="condition-options">
          {conditionOptions.map((option, idx) => (
            <div
              key={idx}
              className={`condition-option ${formData.condition === option.label ? 'selected' : ''}`}
              onClick={() => handleSelectCard(option.label, 'condition')}
            >
              <div className="condition-icon">{option.icon}</div>
              <div className="condition-label">{option.label}</div>
            </div>
          ))}
        </div>
        <div className="condition-description">
          {formData.condition ? conditionDescriptions[formData.condition] : 'Select a condition to see description'}
        </div>
      </div>

      <div className="navigation-buttons">
        <button className="next-button" onClick={handleNextPage}>Next</button>
        <button className="back-button" onClick={handleBackPage}>← Back</button>
      </div>
    </div>
  );

  const renderCity = () => (
    <div className="model-container">
      <div className="content-header">
        <h1>Select Your City</h1>
        <p>Choose the city where your property is located</p>
      </div>

      <div className="city-cards">
        {cities.map((city, idx) => (
          <div
            key={idx}
            className={`city-card ${formData.city === city.name ? 'selected' : ''}`}
            onClick={() => handleSelectCard(city.name, 'city')}
          >
            <div className="city-icon">{city.icon}</div>
            <div className="city-name">{city.name}</div>
            <div className="city-info">{city.info}</div>
          </div>
        ))}
      </div>

      <div className="navigation-buttons">
        <button className="next-button" onClick={handleNextPage}>Next</button>
        <button className="back-button" onClick={handleBackPage}>← Back</button>
      </div>
    </div>
  );

  const renderAmenities = () => (
    <div className="model-container">
      <div className="content-header">
        <h1>Nearby Amenities</h1>
        <p>Select distances to nearby amenities</p>
      </div>

      <div className="slider-wrapper">
        <div className="slider-header">
          <span className="slider-label">Hospital Distance</span>
          <span className="slider-value">{formData.hospitalDistance}m</span>
        </div>
        <input
          type="range"
          min="100"
          max="5000"
          step="100"
          value={formData.hospitalDistance}
          onChange={(e) => handleSliderChange(e, 'hospitalDistance')}
          className="slider"
        />
      </div>

      <div className="slider-wrapper">
        <div className="slider-header">
          <span className="slider-label">Supermarket Distance</span>
          <span className="slider-value">{formData.supermarketDistance}m</span>
        </div>
        <input
          type="range"
          min="100"
          max="5000"
          step="100"
          value={formData.supermarketDistance}
          onChange={(e) => handleSliderChange(e, 'supermarketDistance')}
          className="slider"
        />
      </div>

      <div className="navigation-buttons">
        <button className="next-button" onClick={handleNextPage}>Next</button>
        <button className="back-button" onClick={handleBackPage}>← Back</button>
      </div>
    </div>
  );

  const renderView = () => (
    <div className="model-container">
      <div className="content-header">
        <h1>Property View Classification</h1>
        <p>Select the type of view your property offers</p>
      </div>

      <div className="view-options">
        <div
          className={`view-option ${formData.viewType === 'cityscape' ? 'selected' : ''}`}
          onClick={() => handleSelectCard('cityscape', 'viewType')}
        >
          <span className="view-emoji">🌆</span>
          <span>City Skyline View</span>
        </div>
        <div
          className={`view-option ${formData.viewType === 'waterfront' ? 'selected' : ''}`}
          onClick={() => handleSelectCard('waterfront', 'viewType')}
        >
          <span className="view-emoji">🌊</span>
          <span>Waterfront View</span>
        </div>
        <div
          className={`view-option ${formData.viewType === 'garden' ? 'selected' : ''}`}
          onClick={() => handleSelectCard('garden', 'viewType')}
        >
          <span className="view-emoji">🌳</span>
          <span>Garden View</span>
        </div>
        <div
          className={`view-option ${formData.viewType === 'mountain' ? 'selected' : ''}`}
          onClick={() => handleSelectCard('mountain', 'viewType')}
        >
          <span className="view-emoji">⛰️</span>
          <span>Mountain View</span>
        </div>
      </div>

      <div className="navigation-buttons">
        <button className="next-button" onClick={handleNextPage}>Next</button>
        <button className="back-button" onClick={handleBackPage}>← Back</button>
      </div>
    </div>
  );

  const renderPollution = () => (
    <div className="model-container">
      <div className="content-header">
        <h1>Environmental Factors</h1>
        <p>Rate the air quality and noise levels</p>
      </div>

      <div className="slider-wrapper">
        <div className="slider-header">
          <span className="slider-label">Air Quality (0-100)</span>
          <span className="slider-value">{formData.airQuality}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={formData.airQuality}
          onChange={(e) => handleSliderChange(e, 'airQuality')}
          className="slider"
        />
      </div>

      <div className="slider-wrapper">
        <div className="slider-header">
          <span className="slider-label">Noise Level (0-100)</span>
          <span className="slider-value">{formData.noiseLevel}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={formData.noiseLevel}
          onChange={(e) => handleSliderChange(e, 'noiseLevel')}
          className="slider"
        />
      </div>

      <div className="navigation-buttons">
        <button className="next-button" onClick={handleNextPage}>Next</button>
        <button className="back-button" onClick={handleBackPage}>← Back</button>
      </div>
    </div>
  );

  const renderUtilities = () => (
    <div className="model-container">
      <div className="content-header">
        <h1>Utility Costs</h1>
        <p>Enter your monthly utility expenses</p>
      </div>

      <div className="utility-input">
        <label>Electricity Cost (₹/month)</label>
        <input
          type="number"
          value={formData.electricityCost}
          onChange={(e) => handleInputChange(e, 'electricityCost')}
          placeholder="0"
        />
      </div>

      <div className="utility-input">
        <label>Water Cost (₹/month)</label>
        <input
          type="number"
          value={formData.waterCost}
          onChange={(e) => handleInputChange(e, 'waterCost')}
          placeholder="0"
        />
      </div>

      <div className="navigation-buttons">
        <button className="predict-button" onClick={calculatePrediction}>Calculate Prediction</button>
        <button className="back-button" onClick={handleBackPage}>← Back</button>
      </div>
    </div>
  );

  const renderPrediction = () => (
    <div className="model-container">
      <div className="content-header">
        <h1>Your Property Valuation</h1>
        <p>Based on your inputs and market analysis</p>
      </div>

      {prediction && (
        <div className="prediction-card">
          <div className="prediction-header">
            <h2>Estimated Property Value</h2>
          </div>
          <div className="predicted-price">₹{(prediction.price / 10000000).toFixed(2)} Cr</div>

          <div className="price-range">
            <div className="range-item">
              <div className="range-label">Minimum</div>
              <div className="range-value">₹{(prediction.minPrice / 10000000).toFixed(2)} Cr</div>
            </div>
            <div className="range-item">
              <div className="range-label">Maximum</div>
              <div className="range-value">₹{(prediction.maxPrice / 10000000).toFixed(2)} Cr</div>
            </div>
          </div>

          <div className="accuracy-section">
            <div className="accuracy-label">Prediction Accuracy</div>
            <div className="accuracy-bar">
              <div className="accuracy-fill" style={{ width: `${prediction.accuracy}%` }}></div>
            </div>
            <div className="accuracy-value">{prediction.accuracy}%</div>
          </div>

          <div className="prediction-details">
            <h3>Property Details Summary</h3>
            <div className="detail-item">
              <span className="detail-label">Property Type:</span>
              <span className="detail-value">{formData.propertyType}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Bedrooms:</span>
              <span className="detail-value">{formData.bedrooms}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Bathrooms:</span>
              <span className="detail-value">{formData.bathrooms}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Area:</span>
              <span className="detail-value">{formData.area} sq ft</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">City:</span>
              <span className="detail-value">{formData.city}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Condition:</span>
              <span className="detail-value">{formData.condition}</span>
            </div>
          </div>

          <div className="navigation-buttons">
            <button className="next-button" onClick={() => setCurrentPage('hero')}>Start Over</button>
            <button className="back-button" onClick={handleBackPage}>← Back</button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="model-page">
      {currentPage === 'hero' && renderHeroPage()}
      {currentPage === 'propertyType' && renderPropertyType()}
      {currentPage === 'sliders' && renderSliders()}
      {currentPage === 'area' && renderArea()}
      {currentPage === 'condition' && renderCondition()}
      {currentPage === 'city' && renderCity()}
      {currentPage === 'amenities' && renderAmenities()}
      {currentPage === 'view' && renderView()}
      {currentPage === 'pollution' && renderPollution()}
      {currentPage === 'utilities' && renderUtilities()}
      {currentPage === 'prediction' && renderPrediction()}
    </div>
  );
};

export default Model;
