import React from "react";
import "./ComparisonModal.css";
import HospitalComparisonTable from "./ComparisonTable";

const ratingLabels = [null, "1★", "2★", "3★", "4★", "5★"];
const riskIcons = {
  below: <span className="risk-icon below">🟢</span>,
  average: <span className="risk-icon average">🟡</span>,
  above: <span className="risk-icon above">🔴</span>,
};
const riskLabels = {
  below: "Below Av.",
  average: "Average",
  above: "Above Av.",
};

const patientMeasures = [
  { label: "Nurse Communication", key: "nurse" },
  { label: "Doctor Communication", key: "doctor" },
  { label: "Staff Responsiveness", key: "staff" },
  { label: "Medicine Communication", key: "medicine" },
  { label: "Discharge Information", key: "discharge" },
];
const infectionRisks = [
  { label: "CLABSI", key: "clabsi" },
  { label: "CAUTI", key: "cauti" },
  { label: "C. diff", key: "cdiff" },
  { label: "SSI Hysterectomy", key: "ssiHyst" },
  { label: "SSI Colon Surgery", key: "ssiColon" },
];

export default function ComparisonModal({
  comparisonPlaces = [],
  onClose,
  onBack,
}) {
  return (
    <div className="comparison-modal-overlay">
      <div className="comparison-modal">
        <HospitalComparisonTable hospitals={comparisonPlaces} />
        <button className="comparison-modal-back" onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  );
  return (
    <div className="comparison-modal-overlay">
      <div className="comparison-modal">
        <button className="comparison-modal-close" onClick={onClose}>
          ×
        </button>
        <div className="comparison-modal-header">
          <div className="comparison-modal-measure">Measure</div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="comparison-modal-col-header">
              {comparisonPlaces[i] ? (
                <>
                  <div className="comparison-modal-place-name">
                    {comparisonPlaces[i].name}
                  </div>
                  <div className="comparison-modal-place-meta">
                    Open 24 hours
                  </div>
                  <div className="comparison-modal-place-meta">
                    {comparisonPlaces[i].distance} mi · 🚗{" "}
                    {comparisonPlaces[i].driveTime} min
                  </div>
                </>
              ) : (
                <div className="comparison-modal-add">Add another facility</div>
              )}
            </div>
          ))}
        </div>
        <div className="comparison-modal-section">
          <div className="comparison-modal-row comparison-modal-row-label">
            <b>Patient’s Rating</b>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="comparison-modal-row">
              <div className="comparison-modal-rating">
                {comparisonPlaces[i] && comparisonPlaces[i].overallRating
                  ? ratingLabels[comparisonPlaces[i].overallRating]
                  : "-"}
              </div>
            </div>
          ))}
        </div>
        {patientMeasures.map((measure) => (
          <div className="comparison-modal-section" key={measure.key}>
            <div className="comparison-modal-row comparison-modal-row-label">
              {measure.label}
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="comparison-modal-row">
                <div className="comparison-modal-rating">
                  {comparisonPlaces[i] &&
                  comparisonPlaces[i].ratings &&
                  comparisonPlaces[i].ratings[measure.key]
                    ? ratingLabels[comparisonPlaces[i].ratings[measure.key]]
                    : "-"}
                </div>
              </div>
            ))}
          </div>
        ))}
        <div className="comparison-modal-section">
          <div className="comparison-modal-row comparison-modal-row-label">
            <b>Infection Risk</b>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="comparison-modal-row">
              <div className="comparison-modal-risk">
                {comparisonPlaces[i] &&
                comparisonPlaces[i].infectionRisk &&
                comparisonPlaces[i].infectionRisk.overall
                  ? riskIcons[comparisonPlaces[i].infectionRisk.overall]
                  : "-"}
                <span className="comparison-modal-risk-label">
                  {comparisonPlaces[i] &&
                  comparisonPlaces[i].infectionRisk &&
                  comparisonPlaces[i].infectionRisk.overall
                    ? riskLabels[comparisonPlaces[i].infectionRisk.overall]
                    : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
        {infectionRisks.map((risk) => (
          <div className="comparison-modal-section" key={risk.key}>
            <div className="comparison-modal-row comparison-modal-row-label">
              {risk.label}
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="comparison-modal-row">
                <div className="comparison-modal-risk">
                  {comparisonPlaces[i] &&
                  comparisonPlaces[i].infectionRisk &&
                  comparisonPlaces[i].infectionRisk[risk.key]
                    ? riskIcons[comparisonPlaces[i].infectionRisk[risk.key]]
                    : "-"}
                  <span className="comparison-modal-risk-label">
                    {comparisonPlaces[i] &&
                    comparisonPlaces[i].infectionRisk &&
                    comparisonPlaces[i].infectionRisk[risk.key]
                      ? riskLabels[comparisonPlaces[i].infectionRisk[risk.key]]
                      : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
