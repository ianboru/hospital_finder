import React from 'react';
import './FloatingSortButton.css';

const FloatingSortButton = ({ label = 'Sort By', icon = '≡', onClick }) => (
  <button className="fsb-btn" onClick={onClick}>
    <span className="fsb-icon">{icon}</span>
    <span className="fsb-label">{label}</span>
  </button>
);

export default FloatingSortButton; 