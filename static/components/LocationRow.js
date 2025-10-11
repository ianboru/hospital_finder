import React from "react";
import ReactTooltip from "react-tooltip";
import "./LocationRow.css";
import CompareButton from "./CompareButton";
import { SORT_FIELD_MAP } from "../constants/sortConstants";  

const ratingStars = (rating) => {
  return (
    <span className="lr-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= rating ? "lr-star-filled" : "lr-star-empty"}
        >
          ★
        </span>
      ))}
    </span>
  );
};

const infectionIcon = (status) => {
  if (status === "Above Average") {
    return <span className="lr-infection-icon lr-infection-bad">😡</span>;
  } else if (status === "Average") {
    return <span className="lr-infection-icon lr-infection-average">😊</span>;
  } else if (status === "Below Average") {
    return <span className="lr-infection-icon lr-infection-good">😊</span>;
  }
  return null;
};

const infectionLabel = (status) => {
  if (status === "Above Average")
    return <span className="lr-infection-bad">Above Average</span>;
  if (status === "Average")
    return <span className="lr-infection-average">Average</span>;
  if (status === "Below Average")
    return <span className="lr-infection-good">Below Average</span>;
  return null;
};

const LocationRow = ({
  name,
  address,
  openHours,
  phone,
  distance,
  travelTime,
  patientRating,
  sortBy,
  sortMetricValue,
  infectionLabelText = "Infections",
  infectionStatus,
  onGoogleMaps,
  onCompare,
  onSelect,
  compareIndex,
  onRemoveComparison,
  disableCompare,
  dataDictionary,
}) => {
  // Determine which metric to display based on sortBy
  const displayMetric = sortBy && sortBy.id && sortBy.id !== 'distance' 
    ? SORT_FIELD_MAP[sortBy.id] 
    : SORT_FIELD_MAP['overall_rating'];
  
  // Use sortMetricValue if sorting by something other than distance, otherwise use patientRating
  const displayValue = sortBy && sortBy.id && sortBy.id !== 'distance' 
    ? sortMetricValue 
    : patientRating;
  
  return (
  <div
    onClick={onSelect}
    onTouchStart={(e) => {
      e.currentTarget.style.opacity = "0.7";
    }}
    onTouchEnd={(e) => {
      e.currentTarget.style.opacity = "1";
    }}
    onTouchCancel={(e) => {
      e.currentTarget.style.opacity = "1";
    }}
    className="lr-row"
  >
    <div>
      <div className="lr-main-info">
        <div className="lr-title">{name}</div>
        <div className="lr-address">{address}</div>
        <div className="lr-details">
          <span className="lr-hours">{openHours}</span>
          <span className="lr-phone">{phone}</span>
          <span className="lr-distance">{distance} mi</span>
          <span className="lr-travel">
            <span role="img" aria-label="car">
              🚗
            </span>{" "}
            {travelTime} min
          </span>
        </div>
      </div>
      <div className="lr-actions">
        <button className="lr-btn lr-maps" onClick={onGoogleMaps}>
          <span role="img" aria-label="maps">
            📍
          </span>{" "}
          Google Maps
        </button>
        <CompareButton
          compareIndex={compareIndex}
          disableCompare={disableCompare}
          onRemoveComparison={onRemoveComparison}
          onCompare={onCompare}
        />
      </div>
    </div>
    <div className="lr-metrics">
      <div className="lr-metric-row">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            // alignItems: "center",
          }}
        >
          <span
            className="lr-info-icon"
            data-tip={dataDictionary && displayMetric.key && dataDictionary[displayMetric.key] ? dataDictionary[displayMetric.key].definition : ""}
            data-for={`tooltip-rating-${name}`}
            style={{ cursor: "help" }}
          >
            ℹ
          </span>
          {dataDictionary && displayMetric.key && dataDictionary[displayMetric.key] && (
            <ReactTooltip id={`tooltip-rating-${name}`} place="top" effect="solid" />
          )}
          <span className="lr-metric-label">{displayMetric.name}</span>
        </div>
        {ratingStars(displayValue || 0)}
      </div>
      <div className="lr-metric-row">
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            // alignItems: "center",
          }}
        >
          <span
            className="lr-info-icon"
            data-tip={dataDictionary && dataDictionary["infection rating"] ? dataDictionary["infection rating"].definition : ""}
            data-for={`tooltip-infection-${name}`}
            style={{ cursor: "help" }}
          >
            ℹ
          </span>
          {dataDictionary && dataDictionary["infection rating"] && (
            <ReactTooltip id={`tooltip-infection-${name}`} place="top" effect="solid" />
          )}
          <span className="lr-metric-label">{infectionLabelText}</span>
        </div>
        {infectionIcon(infectionStatus)}
        {infectionLabel(infectionStatus)}
      </div>
    </div>
  </div>
  );
};

export default LocationRow;
