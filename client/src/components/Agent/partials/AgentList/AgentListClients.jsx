import React, { useState, useEffect, useRef } from "react";
import "../../styles/AgentList/AgentListClients.css";

// Dummy testimonials for demonstration
const testimonials = [
  {
    text: "Working with Agent Name 5 was an absolute pleasure. Their knowledge of the local market helped us find our dream home within our budget. Highly recommended!",
    author: "Michael Johnson",
    role: "Homebuyer",
    image: "/assets/agent1.png",
    rating: 5,
  },
  {
    text: "Agent Name 10 helped us sell our property for more than we expected and in record time. Their marketing strategy and negotiation skills are exceptional.",
    author: "Sarah Williams",
    role: "Property Seller",
    image: "/assets/agent1.png",
    rating: 4.5,
  },
  {
    text: "As a first-time homebuyer, I was nervous about the process. Agent Name 3 guided me through every step with patience and expertise. I couldn't be happier with my new home!",
    author: "David Thompson",
    role: "First-time Buyer",
    image: "/assets/agent1.png",
    rating: 5,
  },
];

// Stats numbers
const stats = [
  { icon: "fa-home", number: 2500, label: "Properties Sold" },
  { icon: "fa-users", number: 1200, label: "Happy Clients" },
  { icon: "fa-dollar-sign", number: 500, label: "Million in Sales" },
  { icon: "fa-award", number: 48, label: "Awards Won" },
];

function AgentListClients() {
  // Stats animation
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [statValues, setStatValues] = useState([0, 0, 0, 0]);

  // Testimonials slider
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const nextTestimonial = () =>
    setTestimonialIndex((i) => (i + 1) % testimonials.length);
  const prevTestimonial = () =>
    setTestimonialIndex(
      (i) => (i - 1 + testimonials.length) % testimonials.length
    );

  // Animate stats on scroll
  useEffect(() => {
    function handleScroll() {
      if (!statsRef.current) return;
      const rect = statsRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && !statsAnimated) {
        setStatsAnimated(true);
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [statsAnimated]);

  useEffect(() => {
    if (statsAnimated) {
      let interval = setInterval(() => {
        setStatValues((prev) =>
          prev.map((v, i) => {
            if (v < stats[i].number) {
              return Math.min(
                v + Math.ceil(stats[i].number / 40),
                stats[i].number
              );
            }
            return v;
          })
        );
      }, 30);
      return () => clearInterval(interval);
    } else {
      setStatValues(stats.map((s) => 0));
    }
  }, [statsAnimated]);

  return (
    <div className="agt-list-client-page-container">
      {/* Agent Stats Section */}
      <div className="agt-list-client-stats-wrapper">
        <section
          className="agt-list-client-stats"
          data-aos="fade-up"
          data-aos-duration="800"
          ref={statsRef}
        >
          <div className="agt-list-client-wrapper-container">
            <div
              className="agt-list-client-section-header"
              style={{ textAlign: "center", marginBottom: 40 }}
            >
              <h2
                className="agt-list-client-section-title"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  fontSize: "2.8rem",
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                <i
                  className="fas fa-chart-line"
                  style={{ color: "#ff6f61", fontSize: "2.8rem" }}
                ></i>
                Our Success in Numbers
              </h2>
              <p
                className="agt-list-client-section-subtitle"
                style={{
                  fontSize: "1.25rem",
                  color: "#e0e6ed",
                  fontWeight: 400,
                  marginTop: 12,
                }}
              >
                See why thousands of clients trust our agents for their real
                estate needs
              </p>
            </div>
            <div
              className="agt-list-client-stats-container"
              style={{ justifyContent: "center" }}
            >
              {stats.map((stat, idx) => (
                <div className="agt-list-client-stat-card" key={stat.label}>
                  <div className="agt-list-client-stat-icon">
                    <i className={`fas ${stat.icon}`}></i>
                  </div>
                  <div className="agt-list-client-stat-number">
                    {statsAnimated ? statValues[idx] : stat.number}
                  </div>
                  <div className="agt-list-client-stat-title">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Testimonials Section */}
      <div className="agt-list-client-testimonials-wrapper">
        <section
          className="agt-list-client-testimonials"
          data-aos="fade-up"
          data-aos-duration="800"
        >
          <div className="agt-list-client-wrapper-container">
            <div className="agt-list-client-section-header">
              <h2 className="agt-list-client-section-title">
                <i className="fas fa-quote-left"></i> Client Testimonials
              </h2>
              <p className="agt-list-client-section-subtitle">
                What our clients say about working with our agents
              </p>
            </div>
            <div className="agt-list-client-testimonial-slider">
              {testimonials.map((t, idx) => (
                <div
                  className="agt-list-client-testimonial-card"
                  key={idx}
                  style={{
                    display: testimonialIndex === idx ? "block" : "none",
                  }}
                >
                  <div className="agt-list-client-testimonial-content">
                    <i className="fas fa-quote-left agt-list-client-quote-icon"></i>
                    <p className="agt-list-client-testimonial-text">{t.text}</p>
                  </div>
                  <div className="agt-list-client-testimonial-author">
                    <img
                      src={t.image}
                      alt="Client"
                      className="agt-list-client-author-avatar"
                    />
                    <div className="agt-list-client-author-info">
                      <h4>{t.author}</h4>
                      <p>{t.role}</p>
                      <div className="agt-list-client-rating">
                        {Array.from({ length: 5 }, (_, i) => {
                          if (t.rating >= i + 1) {
                            return <i key={i} className="fas fa-star"></i>;
                          } else if (t.rating > i && t.rating < i + 1) {
                            return (
                              <i key={i} className="fas fa-star-half-alt"></i>
                            );
                          } else {
                            return <i key={i} className="far fa-star"></i>;
                          }
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="agt-list-client-testimonial-nav">
                <button
                  className="agt-list-client-nav-btn agt-list-client-prev-btn"
                  onClick={prevTestimonial}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className="agt-list-client-dots">
                  {testimonials.map((_, idx) => (
                    <span
                      key={idx}
                      className={`agt-list-client-dot${
                        testimonialIndex === idx ? " active" : ""
                      }`}
                      onClick={() => setTestimonialIndex(idx)}
                    ></span>
                  ))}
                </div>
                <button
                  className="agt-list-client-nav-btn agt-list-client-next-btn"
                  onClick={nextTestimonial}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AgentListClients;
