import React from "react";
import ReactTooltip from "react-tooltip";
import {
  getHCAHPSStars,
  getHaiEmoji,
  addressToUrl,
  formatPhoneNumber,
} from "../utils";
import ViewOnGoogleMapsButton from "./ViewOnGoogleMapsButton";
import CompareButton from "./CompareButton";
import { useAppContext } from "../context/AppContext";
import "../styles/placedetails.css";

const PlaceDetail = (props) => {
  const {
    setSelectedPlace,
    comparisonPlaces,
    setComparisonPlaces,
    isMobile,
    onRemoveComparison,
    onCompare,
    handleRemoveComparison,
    handleCompare,
  } = useAppContext();

  // Helper to check if a value is invalid (NaN, null, undefined, or string "NaN")
  const isInvalidValue = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === "number" && isNaN(value)) return true;
    if (value === "NaN") return true;
    return false;
  };

  // Helper to normalize care type for matching (handles "ED + Others", "Hospitals", etc.)
  const normalizeCareType = (careType) => {
    if (!careType) return "hospital";
    const lower = careType.toLowerCase();
    if (lower.includes("ed")) return "ed";
    if (lower.includes("hospital")) return "hospitals";
    return lower;
  };

  // Helper to check if care types match
  const careTypesMatch = (careType1, careType2) => {
    return normalizeCareType(careType1) === normalizeCareType(careType2);
  };

  const comparePlaces = (place1, place2) => {
    return (
      place1 &&
      place2 &&
      place1["Facility ID"] === place2["Facility ID"] &&
      place1["Facility Name"] === place2["Facility Name"] &&
      place1["id"] === place2["id"] &&
      place1["name"] === place2["name"]
    );
  };
  const selectedPlace = props.selectedPlace;
  const metricQuantiles = props.metricQuantiles;
  let selectedCareType = props.selectedCareType;
  selectedCareType = selectedCareType || "Hospital";

  // If selectedPlace has a Care Type, prioritize that over the passed selectedCareType
  // This handles cases where a facility supports multiple care types
  if (selectedPlace["Care Type"]) {
    selectedCareType = selectedPlace["Care Type"];
  }

  // Parse all care types the facility supports from the caretype field
  // e.g., "Hospitals, Hospital, ED + Others, ED" -> ["Hospitals", "Hospital", "ED + Others", "ED"]
  const facilityCareTypes = selectedPlace.caretype
    ? selectedPlace.caretype.split(",").map((ct) => ct.trim())
    : [selectedCareType];

  const dataDictionary = props.dataDictionary;
  // Map patient rating metrics to their respective labels
  const detailedExperienceMetricsMap = {
    "Staff responsiveness - star rating": "Staff responsiveness",
    "Discharge information - star raing": "Discharge information",
    "Care transition - star rating": "Care transition",
    "Cleanliness - star rating": "Cleanliness",
    "Quietness - star rating": "Quietness",
    "Facilities and staff linear mean score": "Patient Rating",
    "Patients who reported that staff definitely communicated about what to expect during and after the procedure":
      "Communication",
  };

  const closePlaceDetail = () => {
    props.setSelectedPlace(null);
  };
  const getQualitativeEmoji = (value) => {
    switch (value) {
      case "High":
        // code block
        return ":/";
      case "Very High":
        // code block
        return "://";
      default:
        return ":)";
    }
  };
  // Map infection rating metrics to their respective labels
  const detailedInfectionMetricsMap = {
    "Central Line Associated Bloodstream Infection": "CLABSI",
    "Catheter Associated Urinary Tract Infections": "CAUTI",
    "SSI - Abdominal Hysterectomy": "SSI Abdominal Hysterectomy",
    "SSI - Colon Surgery": "SSI Colon Surgery",
    "MRSA Bacteremia": "MRSA Bacteremia",
    "Clostridium Difficile (C.Diff)": "C.Diff",
  };

  const detailedInfectionMetricStars = Object.keys(
    detailedInfectionMetricsMap
  ).map((metricName, index) => {
    const metricValue = selectedPlace[metricName];
    const metricLabel = detailedInfectionMetricsMap[metricName];
    const dataDictionaryEntry = dataDictionary[metricName.toLowerCase()];
    return (
      <div
        className="place-detail-metric-row"
        key={`${metricName}-${index}-metric-stars`}
      >
        <span
          style={{ cursor: "pointer", flexShrink: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            props.setShownDefinition(metricName.toLowerCase());
          }}
        >
          ⓘ
        </span>
        <span className="place-detail-metric-label">
          <b>{metricLabel}</b>
        </span>
        <span className="place-detail-metric-value">
          {metricValue && !isInvalidValue(metricValue) ? getHaiEmoji(metricValue, 2) : "No Data"}
        </span>
      </div>
    );
  });

  const metricDivStyle = { marginLeft: 5, marginRight: 5, marginTop: "4px" };
  const ratingDivStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1em",
    gap: "8px",
  };

  // Handle address as either array or string
  const addressString = Array.isArray(selectedPlace.address)
    ? selectedPlace.address[0]
    : selectedPlace.address;
  const googleMapsUrl = addressToUrl(addressString);
  const nonMetricKeys = [
    "id",
    "Facility ID",
    "Facility Name",
    "address",
    "Address",
    "caretype",
    "name",
    "location",
    "City/Town",
    "ZIP Code",
    "Care Type",
    "Mean SIR",
    "Infection Rating",
    "Mean Compared to National",
    "phone_number",
    "distance",
    "Summary star rating",
    "Overall Rating",
    "HHCAHPS Survey Summary Star Rating",
    "Family caregiver survey rating",
    "Patient Hospital Readmission Category",
  ];
  const detailMetrics = Object.keys(selectedPlace)
    .filter((_key) => {
      const key = _key.toLowerCase();
      const careTypesArray = dataDictionary[key]
        ? dataDictionary[key]["care_types"]
        : [];
      // Check if any care type in the dictionary matches ANY of the facility's care types
      const matchesFacilityCareType =
        dataDictionary[key] && careTypesArray.some((dictCareType) => {
          const normalizedDictCareType = normalizeCareType(dictCareType);
          // Check against all care types the facility supports
          return facilityCareTypes.some((facilityCt) => {
            const normalizedFacilityCareType = normalizeCareType(facilityCt);
            return normalizedDictCareType === normalizedFacilityCareType ||
              facilityCt.toLowerCase().includes(dictCareType.toLowerCase()) ||
              dictCareType.toLowerCase().includes(normalizedFacilityCareType);
          });
        });
      const isMetric =
        !nonMetricKeys.includes(_key) &&
        !detailedInfectionMetricsMap[_key] &&
        matchesFacilityCareType;

      return isMetric;
    })
    .map((key, index) => {
      // console.log("!!!key", key)
      const dataDictionaryEntry = dataDictionary[key.toLowerCase()];
      // console.log("!!dataDictionaryEntry", dataDictionaryEntry)
      let metricValue = selectedPlace[key];
      if (metricValue === "N") {
        metricValue = "N";
      } else if (metricValue === "Y") {
        metricValue = "Y";
      } else if (
        metricValue === "Not Available" ||
        metricValue === "Not Applicable" ||
        metricValue === "N/A"
      ) {
        metricValue = "No Data";
      } else if (isInvalidValue(metricValue)) {
        metricValue = "No Data";
      }
      const useStars =
        dataDictionaryEntry["unit"] &&
        dataDictionaryEntry["unit"].includes("Stars") &&
        metricValue <= 5;
      const useEmojis =
        dataDictionaryEntry["unit"] &&
        dataDictionaryEntry["unit"].includes("Emojis");
      const qualitativeMetric =
        dataDictionaryEntry["unit"] &&
        dataDictionaryEntry["unit"].includes("High");
      const unitSuffix =
        dataDictionaryEntry["unit"] &&
          dataDictionaryEntry["unit"].includes("Minutes")
          ? " min"
          : dataDictionaryEntry["unit"].includes("Percent") && metricValue
            ? "%"
            : "";
      const emojiContent = ":P";
      if (useEmojis && qualitativeMetric) {
        emojiContent = getQualitativeEmoji(metricValue);
      }
      const showSuffix =
        ((typeof metricValue == "string" && !metricValue.includes("Not")) ||
          typeof metricValue != "string") &&
        metricValue &&
        metricValue != "No Data";
      return (
        <div key={`${key}-${index}-detail-metric`} className="place-detail-metric-row">
          <span
            style={{ cursor: "pointer", flexShrink: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              props.setShownDefinition(key.toLowerCase());
            }}
          >
            {dataDictionaryEntry ? "\u24D8" : ""}
          </span>
          <span className="place-detail-metric-label">
            <b>{dataDictionaryEntry ? dataDictionaryEntry.term : key}</b>
          </span>
          {useStars ? (
            <span className="place-detail-metric-value" style={{ color: "gold" }}>
              {metricValue ? getHCAHPSStars(metricValue) : "No Data"}
            </span>
          ) : (
            <span className="place-detail-metric-value">
              {useEmojis ? emojiContent : ""}
              {metricValue}
              {showSuffix ? unitSuffix : ""}
            </span>
          )}
        </div>
      );
    });

  return (
    <div
      className="place-detail-container"
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="place-detail-name">
          {selectedPlace.name}
        </div>
        <span
          onClick={closePlaceDetail}
          style={{
            cursor: "pointer",
            fontSize: 20,
            color: "gray",
            padding: "0 5px",
            flexShrink: 0,
          }}
        >
          ×
        </span>
      </div>
      <div className="place-detail-address">{addressString}</div>
      <div>{formatPhoneNumber(selectedPlace.phone_number)}</div>
      <div className="place-detail-actions-container">
        <hr style={{ width: "calc(100% + 20px)", marginLeft: "-10px", marginRight: "-10px", border: "none", borderTop: "1px solid #f0f0f0" }} />

        <div className="place-detail-actions">
          <ViewOnGoogleMapsButton url={googleMapsUrl} />
          <CompareButton
            compareIndex={comparisonPlaces.findIndex((p) =>
              comparePlaces(p, selectedPlace)
            )}
            disableCompare={
              comparisonPlaces.length >= 3 &&
              comparisonPlaces.findIndex((p) =>
                comparePlaces(p, selectedPlace)
              ) === -1
            }
            onRemoveComparison={(index) => handleRemoveComparison(index)}
            onCompare={() => handleCompare(selectedPlace)}
          />
        </div>
        <hr style={{ width: "calc(100% + 20px)", marginLeft: "-10px", marginRight: "-10px", border: "none", borderTop: "1px solid #f0f0f0" }} />
      </div>

      {detailMetrics && Object.keys(detailMetrics).length > 0 ? (
        <>
          <div style={ratingDivStyle}>
            <b>Patient Rating:</b>
            <span style={{ color: "#fdcc0d" }}>
              {(() => {
                const rating = selectedPlace["Summary star rating"] || selectedPlace["Overall Rating"];
                return !isInvalidValue(rating) ? getHCAHPSStars(rating) : "No Data";
              })()}
            </span>
          </div>
          <hr style={{ marginTop: "0px", border: "none", borderTop: "1px solid #f0f0f0" }} />
          <div style={metricDivStyle}>{detailMetrics}</div>
        </>
      ) : (
        <></>
      )}
      {selectedPlace["Infection Rating"] &&
        !isInvalidValue(selectedPlace["Infection Rating"]) &&
        facilityCareTypes.some((ct) => ["hospitals", "ed"].includes(normalizeCareType(ct))) ? (
        <>
          <div style={ratingDivStyle}>
            <b>Infection Rating:</b>
            <span style={{ color: "#fdcc0d" }}>
              {!isInvalidValue(selectedPlace["Infection Rating"])
                ? getHaiEmoji(selectedPlace["Infection Rating"], 3)
                : "No Data"}
            </span>
          </div>
          <hr style={{ marginTop: "0px", border: "none", borderTop: "1px solid #f0f0f0" }} />
          <div style={metricDivStyle}>{detailedInfectionMetricStars}</div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default PlaceDetail;
