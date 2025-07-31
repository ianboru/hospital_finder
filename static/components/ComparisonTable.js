import React from "react";
import "./ComparisonTable.css";

const HospitalComparisonTable = ({ hospitals: propHospitals }) => {
  // Ensure we always have exactly 3 columns by padding with empty placeholders
  const padHospitals = (hospitalList) => {
    const paddedList = [...hospitalList];
    while (paddedList.length < 3) {
      paddedList.push(null); // null represents empty placeholder
    }
    return paddedList.slice(0, 3); // Ensure max 3 hospitals
  };

  const hospitals = padHospitals(propHospitals || []);

  // Convert numeric infection scores to status text
  const getInfectionStatus = (score) => {
    if (score === null || score === undefined) return "N/A";
    if (score <= 2) return "Below Av.";
    if (score >= 4) return "Above Av.";
    return "Average";
  };

  // Get CSS class based on score
  const getInfectionStatusClass = (score) => {
    if (score === null || score === undefined)
      return "hospital-comparison-status-na";
    if (score <= 2) return "hospital-comparison-status-below";
    if (score >= 4) return "hospital-comparison-status-above";
    return "hospital-comparison-status-average";
  };

  // Get icon based on score
  const getInfectionIcon = (score) => {
    if (score === null || score === undefined) return "○";
    if (score <= 2) return "●";
    if (score >= 4) return "●";
    return "◐";
  };

  // Render stars for ratings
  const renderStars = (rating) => {
    if (isNaN(rating) || rating === null)
      return <span className="hospital-comparison-no-rating">No rating</span>;
    return (
      <span className="hospital-comparison-stars">{Math.round(rating)}★</span>
    );
  };

  // Format distance and time
  const formatDistance = (distance) => {
    const miles = parseFloat(distance);
    const minutes = Math.round(miles * 1.5);
    return `${distance} • ~${minutes} min`;
  };

  // Patient's Rating sub-metrics - matching PlaceDetail component
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

  return (
    <div className="hospital-comparison-container">
      <table className="hospital-comparison-table">
        <thead>
          <tr>
            <th className="hospital-comparison-header-cell">Measure</th>
            {[1, 2, 3].map((num) => (
              <th key={num} className="hospital-comparison-header-cell-center">
                {num}
              </th>
            ))}
          </tr>
          <tr>
            <td></td>
            {hospitals.map((hospital, index) => (
              <td key={index} className="hospital-comparison-cell">
                {hospital ? (
                  <>
                    <div className="hospital-comparison-name">
                      {hospital.name}
                    </div>
                    <div className="hospital-comparison-info">
                      {hospital.caretype}
                    </div>
                    <div className="hospital-comparison-info">
                      {formatDistance(hospital.distance)}
                    </div>
                  </>
                ) : (
                  <div className="hospital-comparison-placeholder">
                    No hospital selected
                  </div>
                )}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Patient's Rating Section */}
          <tr>
            <td className="hospital-comparison-section-header">
              <span>⭐ Patient's Rating</span>
            </td>
          </tr>
          <tr className="hospital-comparison-data-row">
            <td className="hospital-comparison-label-cell-bold">Overall</td>
            {hospitals.map((hospital, index) => (
              <td key={index} className="hospital-comparison-data-cell">
                {hospital ? (
                  renderStars(hospital["Summary star rating"])
                ) : (
                  <span className="hospital-comparison-empty">—</span>
                )}
              </td>
            ))}
          </tr>
          {Object.keys(detailedExperienceMetricsMap).map((metricName) => {
            const metricLabel = detailedExperienceMetricsMap[metricName];
            return (
              <tr key={metricName} className="hospital-comparison-data-row">
                <td className="hospital-comparison-label-cell">
                  {metricLabel}
                </td>
                {hospitals.map((hospital, index) => (
                  <td key={index} className="hospital-comparison-data-cell">
                    {hospital ? (
                      renderStars(hospital[metricName])
                    ) : (
                      <span className="hospital-comparison-empty">—</span>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
          <tr className="hospital-comparison-data-row">
            <td className="hospital-comparison-label-cell">Phone</td>
            {hospitals.map((hospital, index) => (
              <td key={index} className="hospital-comparison-data-cell">
                {hospital ? (
                  hospital.phone_number.replace(
                    /(\d{3})(\d{3})(\d{4})/,
                    "($1) $2-$3"
                  )
                ) : (
                  <span className="hospital-comparison-empty">—</span>
                )}
              </td>
            ))}
          </tr>

          {/* Infection Risk Section */}
          <tr className="hospital-comparison-data-row">
            <td
              className="hospital-comparison-section-header"
              style={{ paddingTop: "24px" }}
            >
              <span>🛡️ Infection Risk</span>
            </td>
            {hospitals.map((hospital, index) => (
              <td key={index} className="hospital-comparison-data-cell">
                {hospital ? (
                  <span
                    className={getInfectionStatusClass(
                      hospital["Infection Rating"]
                    )}
                  >
                    <span className="hospital-comparison-icon">
                      {getInfectionIcon(hospital["Infection Rating"])}
                    </span>
                    {getInfectionStatus(hospital["Infection Rating"])}
                  </span>
                ) : (
                  <span className="hospital-comparison-empty">—</span>
                )}
              </td>
            ))}
          </tr>
          {[
            {
              key: "Central Line Associated Bloodstream Infection",
              label: "CLABSI",
            },
            {
              key: "Catheter Associated Urinary Tract Infections",
              label: "CAUTI",
            },
            { key: "Clostridium Difficile (C.Diff)", label: "C. diff" },
            { key: "MRSA Bacteremia", label: "MRSA" },
            { key: "SSI - Abdominal Hysterectomy", label: "SSI Hysterectomy" },
            { key: "SSI - Colon Surgery", label: "SSI Colon Surgery" },
          ].map((item) => (
            <tr key={item.key} className="hospital-comparison-data-row">
              <td className="hospital-comparison-label-cell">{item.label}</td>
              {hospitals.map((hospital, index) => (
                <td key={index} className="hospital-comparison-data-cell">
                  {hospital ? (
                    <span
                      className={getInfectionStatusClass(hospital[item.key])}
                    >
                      <span className="hospital-comparison-icon">
                        {getInfectionIcon(hospital[item.key])}
                      </span>
                      {getInfectionStatus(hospital[item.key])}
                    </span>
                  ) : (
                    <span className="hospital-comparison-empty">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr className="hospital-comparison-data-row">
            <td className="hospital-comparison-label-cell">Mean SIR</td>
            {hospitals.map((hospital, index) => {
              let formattedSir 
              try {
                const sir = hospital["Mean SIR"];
                formattedSir = sir.toFixed(3);
              } catch (error) {
                formattedSir = "—";
              }
              return (
                <td key={index} className="hospital-comparison-data-cell">
                  {formattedSir ? (
                    <span
                      className={
                        !!sir && sir < 1
                          ? "hospital-comparison-sir-good"
                          : "hospital-comparison-sir-bad"
                      }
                    >
                      {formattedSir}
                    </span>
                  ) : (
                    <span className="hospital-comparison-empty">—</span>
                  )}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default HospitalComparisonTable;
