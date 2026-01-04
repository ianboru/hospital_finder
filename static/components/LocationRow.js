import React from "react";
import "./LocationRow.css";
import CompareButton from "./CompareButton";
import { useDefinitionContext } from "../context/AppContext";
import { getHCAHPSStars, getHaiEmoji } from "../utils";

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

// Reusable Info Icon component
const InfoIcon = ({ metricKey }) => {
  const { setShownDefinition } = useDefinitionContext();

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShownDefinition(metricKey.toLowerCase());
  };

  return (
    <span
      className="lr-info-icon"
      style={{ cursor: "pointer" }}
      onClick={handleClick}
      onMouseDown={handleClick}
      onTouchStart={handleClick}
    >
      ℹ
    </span>
  );
};

// Reusable Metric Row component
const MetricRow = ({ label, metricKey, children }) => {
  return (
    <div className="lr-metric-row">
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <InfoIcon metricKey={metricKey} />
        <span className="lr-metric-label">{label}</span>
      </div>
      {children}
    </div>
  );
};

const LocationRow = ({
  name,
  address,
  openHours,
  phone,
  distance,
  travelTime,
  place,
  careType,
  onGoogleMaps,
  onCompare,
  onSelect,
  compareIndex,
  onRemoveComparison,
  disableCompare,
  dataDictionary,
}) => {
  // Helper to check if value is valid
  const isValidValue = (value) => {
    return value !== null && value !== undefined && value !== 0 && value !== "0" && value !== "" && value !== "N/A";
  };

  // Helper to get infection status
  const getInfectionStatus = (rating) => {
    if (rating >= 4) return "Below Average";
    if (rating === 3) return "Average";
    if (rating < 3) return "Above Average";
    return "";
  };

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
            <span className="lr-distance">{distance}</span>
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
        {/* Hospital metrics */}
        {careType && careType.includes('Hospital') && (
          <>
            <MetricRow label="Patient Rating" metricKey="summary star rating">
              {isValidValue(place['Summary star rating'])
                ? ratingStars(place['Summary star rating'])
                : <span className="lr-metric-na">N/A</span>
              }
            </MetricRow>
            <MetricRow label="Infections" metricKey="infection rating">
              {isValidValue(place['Infection Rating']) ? (
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {infectionIcon(getInfectionStatus(place['Infection Rating']))}
                  {infectionLabel(getInfectionStatus(place['Infection Rating']))}
                </div>
              ) : (
                <span className="lr-metric-na">N/A</span>
              )}
            </MetricRow>
          </>
        )}

        {/* Outpatient metrics */}
        {careType && careType.includes('Outpatient') && (
          <>
            <MetricRow label="Patient Rating" metricKey="patients' rating of the facility linear mean score">
              {isValidValue(place["Patients' rating of the facility linear mean score"])
                ? <span className="lr-metric-value">{place["Patients' rating of the facility linear mean score"]}</span>
                : <span className="lr-metric-na">N/A</span>
              }
            </MetricRow>
            <MetricRow label="Communication" metricKey="patients who reported that staff definitely communicated about what to expect during and after the procedure">
              {isValidValue(place['Patients who reported that staff definitely communicated about what to expect during and after the procedure'])
                ? <span className="lr-metric-value">{getHaiEmoji(place['Patients who reported that staff definitely communicated about what to expect during and after the procedure'], 3)}</span>
                : <span className="lr-metric-na">N/A</span>
              }
            </MetricRow>
          </>
        )}

        {/* Nursing Homes metrics */}
        {careType && careType.includes('Nursing Homes') && (
          <>
            <MetricRow label="Overall Rating" metricKey="overall rating">
              {isValidValue(place['Overall Rating'])
                ? ratingStars(place['Overall Rating'])
                : <span className="lr-metric-na">N/A</span>
              }
            </MetricRow>
            <MetricRow label="Potential Abuse" metricKey="abuse icon">
              {isValidValue(place['Abuse Icon'])
                ? <span className="lr-metric-value">{getHaiEmoji(place['Abuse Icon'], 3)}</span>
                : <span className="lr-metric-na">N/A</span>
              }
            </MetricRow>
          </>
        )}

        {/* Hospice metrics */}
        {careType && careType.includes('Hospice') && (
          <>
            <MetricRow label="Caregiver Rating" metricKey="family caregiver survey rating">
              {isValidValue(place['Family caregiver survey rating'])
                ? ratingStars(place['Family caregiver survey rating'])
                : <span className="lr-metric-na">N/A</span>
              }
            </MetricRow>
            <MetricRow label="Symptoms Managed" metricKey="the patient always got the help they needed for pain and symptoms">
              {isValidValue(place['The patient always got the help they needed for pain and symptoms'])
                ? ratingStars(place['The patient always got the help they needed for pain and symptoms'])
                : <span className="lr-metric-na">N/A</span>
              }
            </MetricRow>
          </>
        )}

        {/* ED metrics */}
        {careType && careType.includes('ED') && (
          <>
            <MetricRow label="Median Arrival to Discharge" metricKey="average (median) time patients spent in the emergency department before leaving from the visit a lower number of minutes is better">
              {isValidValue(place['Median time from ED arrival to ED departure for discharged ED patients'])
                ? <span className="lr-metric-value">{place['Median time from ED arrival to ED departure for discharged ED patients']} min</span>
                : <span className="lr-metric-na">N/A</span>
              }
            </MetricRow>
            <MetricRow label="Left Before Being Seen" metricKey="left before being seen">
              {isValidValue(place['Left before being seen'])
                ? <span className="lr-metric-value">{place['Left before being seen']}%</span>
                : <span className="lr-metric-na">N/A</span>
              }
            </MetricRow>
          </>
        )}

        {/* Home Health metrics */}
        {careType && careType.includes('Home Health') && (
          <>
            <MetricRow label="Patient Rating" metricKey="star rating for how patients rated overall care from agency">
              {isValidValue(place["Star Rating for how patients rated overall care from agency"])
                ? ratingStars(place["Star Rating for how patients rated overall care from agency"])
                : <span className="lr-metric-na">N/A</span>
              }
            </MetricRow>
            <MetricRow label="Provider Communication" metricKey="star rating for health team communicated well with them">
              {isValidValue(place["Star Rating for health team communicated well with them"])
                ? ratingStars(place["Star Rating for health team communicated well with them"])
                : <span className="lr-metric-na">N/A</span>
              }
            </MetricRow>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(LocationRow);
