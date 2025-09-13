import React from 'react';

const CompareButton = ({ compareIndex, disableCompare, onRemoveComparison, onCompare }) => {
  return (
    <button
    disabled={disableCompare}
    style={{
      backgroundColor: compareIndex !== -1 ? "#7C51B2" : disableCompare ? "grey" : "#ede7f6",
    }}
    className="lr-btn lr-compare"
    onClick={(e) => {
      e.stopPropagation();
      if (compareIndex !== -1) {
        onRemoveComparison(compareIndex);
      } else {
        onCompare();
      }
    }}
  >
    {compareIndex !== -1 ? (
      <span className="lr-compare-index">{compareIndex + 1}</span>
    ) : (
      <>
        <span role="img" aria-label="compare">
          ⇄
        </span>{" "}
        <span>Compare</span>
      </>
    )}
  </button>
  );
};

export default CompareButton;