import React from "react";
import StatItem from "./StatItem";

const FeaturedSection = () => {
  const stats = [
    {
      icon: "fas fa-home",
      number: "1200+",
      label: "Properties Listed",
    },
    {
      icon: "fas fa-users",
      number: "500+",
      label: "Happy Clients",
    },
    {
      icon: "fas fa-star",
      number: "4.8",
      label: "Average Rating",
    },
    {
      icon: "fas fa-map-marker-alt",
      number: "50+",
      label: "Cities Covered",
    },
  ];

  return (
    <section className="prop-list-featured-section">
      {/* This class name is now unique */}
      <div className="prop-list-featured-container">
        <div className="prop-list-section-header">
          <h2>Featured Properties</h2>
          <p>Explore our handpicked selection of premium properties</p>
        </div>
        <div className="prop-list-featured-stats">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              icon={stat.icon}
              number={stat.number}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;