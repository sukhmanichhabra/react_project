import React from 'react';
import './Pricing.css';

const PricingCard = ({ title, price, period, features, buttonClass, cardClass }) => {
    return (
        <div className={`pricing-card ${cardClass}`}>
            <h2>{title}</h2>
            <div className="price">
                <span className="amount">{price}</span>
                <span className="period">{period}</span>
            </div>
            <ul className="features">
                {features.map((feature, index) => (
                    <li key={index} className={feature.included ? 'included' : 'excluded'}>
                        {feature.text}
                    </li>
                ))}
            </ul>
            <button className={`subscribe-btn ${buttonClass}`}>Subscribe Now</button>
        </div>
    );
};

export default PricingCard;
