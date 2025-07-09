import React from 'react';
import './SearchBar.css';

const SearchBar = ({ value, onChange, onClear, placeholder = 'Search facilities or locations here' }) => (
  <div className="sb-container">
    <span className="sb-icon" role="img" aria-label="search">🔍</span>
    <input
      id="search-bar"
      className="sb-input"
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
    {value && (
      <button className="sb-clear" onClick={onClear} aria-label="Clear">
        ×
      </button>
    )}
  </div>
);

export default SearchBar; 