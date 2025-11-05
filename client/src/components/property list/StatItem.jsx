import React from 'react';

const StatItem = ({ icon, number, label }) => {
  return (
    <div className="prop-list-stat-item">
      <i className={icon}></i>
      <h3>{number}</h3>
      <p>{label}</p>
    </div>
  );
};

export default StatItem;