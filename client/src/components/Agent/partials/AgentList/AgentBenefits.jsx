import React from "react";
import "../../styles/AgentList/AgentBenefits.css";

function AgentBenefits() {
  return (
    <section
      className="agt-list-benefits-section"
      data-aos="fade-up"
      data-aos-duration="800"
    >
      <div className="agt-list-benefits-header">
        <h2 className="agt-list-benefits-title">
          <i className="fas fa-award"></i> Why Choose Our Agents
        </h2>
        <p className="agt-list-benefits-subtitle">
          Our real estate professionals are carefully selected to provide you
          with exceptional service
        </p>
      </div>
      <div className="agt-list-benefits-container">
        <div
          className="agt-list-benefits-card"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <div className="agt-list-benefits-icon">
            <i className="fas fa-certificate"></i>
          </div>
          <h3>Certified Professionals</h3>
          <p>
            All our agents are licensed and certified with years of experience
            in the real estate market.
          </p>
        </div>
        <div
          className="agt-list-benefits-card"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div className="agt-list-benefits-icon">
            <i className="fas fa-handshake"></i>
          </div>
          <h3>Personalized Service</h3>
          <p>
            Our agents provide tailored solutions to meet your specific real
            estate needs and preferences.
          </p>
        </div>
        <div
          className="agt-list-benefits-card"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <div className="agt-list-benefits-icon">
            <i className="fas fa-map-marked-alt"></i>
          </div>
          <h3>Local Market Expertise</h3>
          <p>
            Deep knowledge of local markets, trends, and neighborhoods to help
            you make informed decisions.
          </p>
        </div>
        <div
          className="agt-list-benefits-card"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          <div className="agt-list-benefits-icon">
            <i className="fas fa-comments-dollar"></i>
          </div>
          <h3>Negotiation Skills</h3>
          <p>
            Expert negotiators who will work to get you the best possible deal
            on your property.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AgentBenefits;
