import React, { useEffect, useState } from 'react';
import './Pricing.css';
import PricingCard from './PricingCard';

const Pricing = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.pageYOffset > 300) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Ensure page starts at the top
        window.scrollTo(0, 0);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const pricingPlans = [
        {
            title: "FREE PLAN",
            price: "0",
            period: "per user/month",
            features: [
                { text: "60-day chat history", included: true },
                { text: "Basic widget customization", included: true },
                { text: "Ticketing system", included: false },
                { text: "Data security", included: false }
            ],
            buttonClass: "dark",
            cardClass: "free"
        },
        {
            title: "STANDARD",
            price: "$12",
            period: "per user/month",
            features: [
                { text: "60-day chat history", included: true },
                { text: "Basic widget customization", included: true },
                { text: "Ticketing system", included: true },
                { text: "Data security", included: false }
            ],
            buttonClass: "light",
            cardClass: "standard"
        },
        {
            title: "BUSINESS",
            price: "$39",
            period: "per user/month",
            features: [
                { text: "60-day chat history", included: true },
                { text: "Basic widget customization", included: true },
                { text: "Ticketing system", included: true },
                { text: "Data security", included: true }
            ],
            buttonClass: "light",
            cardClass: "business"
        }
    ];

    return (
        <div className="pricing-container">
            <div className="pricing-header">
                <h1>No hidden charge, get your plan.</h1>
                <p>Try Free plan features for 14 days · No credit card required for exploration.</p>
            </div>

            <div className="pricing-cards">
                {pricingPlans.map((plan, index) => (
                    <PricingCard
                        key={index}
                        title={plan.title}
                        price={plan.price}
                        period={plan.period}
                        features={plan.features}
                        buttonClass={plan.buttonClass}
                        cardClass={plan.cardClass}
                    />
                ))}
            </div>

            <button
                id="backToTop"
                aria-label="Back to top"
                style={{ display: showBackToTop ? 'flex' : 'none' }}
                onClick={scrollToTop}
            >
                <i className="fas fa-chevron-up"></i>
            </button>
        </div>
    );
};

export default Pricing;
