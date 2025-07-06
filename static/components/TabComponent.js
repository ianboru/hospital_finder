import React from 'react';
import './TabComponent.css';

const TabComponent = ({ 
  activeTab, 
  onTabChange, 
  searchResults, 
  mapView, 
}) => {
  return (
    <div className="tab-container">
      <div className="tab-header">
        <button 
          className={`tab-button ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => onTabChange('search')}
        >
          <span className="tab-icon">🔍</span>
          Search Results
        </button>
        <button 
          className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => onTabChange('map')}
        >
          <span className="tab-icon">🗺️</span>
          Map View
        </button>
      </div>
      
      <div className="tab-content">
        <div style={{display: activeTab === 'search' ? 'block' : 'none'}} className="tab-panel">
          {searchResults}
        </div>
        
        <div style={{display: activeTab === 'map' ? 'block' : 'none'}} className="tab-panel">
          {mapView}
        </div>
      </div>
    </div>
  );
};

export default TabComponent; 