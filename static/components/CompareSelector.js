import React from 'react';
import './CompareSelector.css';

const CompareSelector = ({
  selectedHospitals = [],
  onRemove = () => {},
  navigateToComparison = () => {},
}) => {
  // Fill up to 3 slots
  const slots = [0, 1, 2].map((i) => selectedHospitals[i] || null);
  const canCompare = selectedHospitals.filter(Boolean).length >= 2;
  console.log("canCompare", canCompare)
  console.log("selectedHospitals", selectedHospitals)
  console.log("slots", slots)
  return (
    <div className="compare-selector-root">
      <div className="compare-selector-header">
        <span className="compare-selector-title">Select more Hospitals to compare</span>
      </div>
      <div className="compare-selector-slots">
        {slots.map((hospital, i) => (
          <div key={i} className={`compare-selector-slot${hospital ? ' filled' : ''}`}> 
            <div className="compare-selector-slot-number">{i + 1}</div>
            {hospital ? (
              <>
                <div className="compare-selector-hospital-name">{hospital.name}</div>
                <button className="compare-selector-remove" onClick={() => onRemove(i)} aria-label="Remove">×</button>
              </>
            ) : (
              <div className="compare-selector-add" >
                Add another facility
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        className="compare-selector-compare-btn"
        onClick={navigateToComparison}
        disabled={!canCompare}
      >
        Compare
      </button>
    </div>
  );
};

export default CompareSelector; 