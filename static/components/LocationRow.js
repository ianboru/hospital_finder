import React from "react";
import "./LocationRow.css";

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
  infectionLabelText = "Infections",
  infectionStatus,
  onGoogleMaps,
  onCompare,
}) => (
  <div className="lr-row">
    
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
          <button className="lr-btn lr-compare" onClick={onCompare}>
            <span role="img" aria-label="compare">
              ⇄
            </span>{" "}
            Compare
          </button>
        </div>
      </div>
      <div className="lr-metrics">
        <div className="lr-metric-row">
          <div style={{
            display: "flex",
            flexDirection: "row",
            // alignItems: "center",
          }}>
          <span className="lr-info-icon" title="Patient Rating">
            ?
          </span>
          <span className="lr-metric-label">Patient Rating</span>
          </div>
          {ratingStars(patientRating)}
        </div>
        <div className="lr-metric-row">
          <div style={{
            display: "flex",
            flexDirection: "row",
            // alignItems: "center",
          }}>
          <span className="lr-info-icon" title={infectionLabelText}>
            ?
          </span>
          <span className="lr-metric-label">{infectionLabelText}</span>
          </div>
          {infectionIcon(infectionStatus)}
          {infectionLabel(infectionStatus)}
        </div>
      </div>
  </div>
);

export default LocationRow;
