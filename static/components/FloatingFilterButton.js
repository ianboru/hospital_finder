import React from 'react';
import './FloatingFilterButton.css';

const FloatingFilterButton = ({ label = 'Care Type', icon = '▼', onClick }) => (
  <button className="ffb-btn" onClick={onClick}>
    <span className="ffb-icon">{icon}</span>
    <span className="ffb-label">{label}</span>
  </button>
);

export default FloatingFilterButton; 