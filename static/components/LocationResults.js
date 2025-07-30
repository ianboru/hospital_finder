import React, { useCallback, useMemo } from "react";
import LocationRow from "./LocationRow";
import "./LocationResults.css";
import { addressToUrl, formatPhoneNumber } from "../utils";
import { useAppContext } from "../context/AppContext";

const getInfectionStatus = (rating) => {
  if (rating === null || rating === undefined) return "";
  if (rating >= 4) return "Below Average";
  if (rating === 3) return "Average";
  if (rating < 3) return "Above Average";
  return "";
};

const LocationResults = ({ results = [], title = "Hospitals", onRemoveComparison = (_i) => {} }) => {
  const { setSelectedPlace, comparisonPlaces, setComparisonPlaces } =
    useAppContext();
  console.log("comparisonPlaces", comparisonPlaces);

  const handleCompare = useCallback(
    (place) => {
      if (comparisonPlaces.length >= 3) {
        return;
      }
      setComparisonPlaces([...comparisonPlaces, place]);
    },
    [comparisonPlaces]
  );

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

  return ( 
    <div className="lr-results-sheet">
      <div className="lr-results-header">
        <span className="lr-results-title">{title}</span>
      </div>
      <div className="lr-results-list">
        {results.length === 0 && (
          <div className="lr-no-results">No valid results</div>
        )}
        {results.map((place, i) => (
          <LocationRow
            disableCompare={
              comparisonPlaces.length >= 3 &&
              comparisonPlaces.findIndex((p) => comparePlaces(p, place)) === -1
            }
            compareIndex={comparisonPlaces.findIndex((p) =>
              comparePlaces(p, place)
            )}
            onSelect={() => setSelectedPlace(place)}
            key={place["Facility ID"] || i}
            name={place.name}
            address={place.address}
            openHours={place.open_hours || "Open 24 hours"}
            phone={formatPhoneNumber(place.phone_number || "")}
            distance={place.distance}
            travelTime={place.time}
            patientRating={place["Summary star rating"] || 0}
            infectionLabelText={place["Infection Label"] || "Infections"}
            infectionStatus={getInfectionStatus(place["Infection Rating"])}
            onGoogleMaps={() =>
              window.open(addressToUrl(place.address), "_blank")
            }
            onCompare={() => handleCompare(place)}
            onRemoveComparison={(index) => onRemoveComparison(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default LocationResults;
