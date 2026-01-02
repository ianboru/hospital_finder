import React, { useCallback, useMemo } from "react";
import LocationRow from "./LocationRow";
import "./LocationResults.css";
import { addressToUrl, formatPhoneNumber } from "../utils";
import { useAppContext } from "../context/AppContext";
import { SORT_FIELD_MAP } from "../constants/sortConstants";

const getInfectionStatus = (rating) => {
  if (rating === null || rating === undefined) return "";
  if (rating >= 4) return "Below Average";
  if (rating === 3) return "Average";
  if (rating < 3) return "Above Average";
  return "";
};

const LocationResults = ({
  results = [],
  title = "Hospitals",
  onRemoveComparison = (_i) => { },
  dataDictionary,
}) => {
  const {
    setSelectedPlace,
    comparisonPlaces,
    setComparisonPlaces,
    isMobile,
    sortBy,
    sortDirection,
  } = useAppContext();

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

  // Sort results based on selected sort option
  const sortedResults = useMemo(() => {

    if (!sortBy || !sortBy.id) {
      return results; // Return unsorted if no sort option selected
    }

    const sortConfig = SORT_FIELD_MAP[sortBy.id];

    if (sortConfig) {
      // Helper function to check if a value is valid for sorting
      const isValidValue = (val) => {
        if (
          val === null ||
          val === undefined ||
          val === "" ||
          val === "N/A" ||
          val === "Not Available"
        )
          return false;

        // For rating fields, also filter out 0 ratings
        if (
          sortConfig.field.includes("star rating") &&
          (val === 0 || val === "0")
        )
          return false;

        return true;
      };

      // Separate results into those with valid values and those without
      const withValidValues = [];
      const withoutValidValues = [];

      results.forEach((item) => {
        const fieldValue = item[sortConfig.field];
        if (isValidValue(fieldValue)) {
          withValidValues.push(item);
        } else {
          withoutValidValues.push(item);
        }
      });

      // Sort the results that have valid values
      withValidValues.sort((a, b) => {
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];

        let comparison = 0;

        // Special handling for distance
        if (sortConfig.id === "distance") {
          // Parse distance values if they're strings like "2.5 mi"
          const parseDistance = (val) => {
            if (typeof val === "number") return val;
            if (typeof val === "string") {
              const num = parseFloat(val);
              return isNaN(num) ? Infinity : num;
            }
            return Infinity;
          };

          comparison = parseDistance(aValue) - parseDistance(bValue);
        } else {
          // For numeric values
          if (typeof aValue === "number" && typeof bValue === "number") {
            comparison = aValue - bValue;
          } else {
            // Convert to numbers if they're strings
            const numA = parseFloat(aValue);
            const numB = parseFloat(bValue);
            if (!isNaN(numA) && !isNaN(numB)) {
              comparison = numA - numB;
            } else {
              // For string values, sort alphabetically
              comparison = String(aValue).localeCompare(String(bValue));
            }
          }
        }

        // Use the user-selected sort direction
        const isAscending = sortDirection === "asc";
        return isAscending ? comparison : -comparison;
      });

      // Return sorted results with valid values first, followed by those without
      return [...withValidValues, ...withoutValidValues];
    }

    return results;
  }, [results, sortBy, sortDirection]);

  return (
    <div className="lr-results-sheet">
      {sortedResults.length === 0 && (
        <div className="lr-no-results">No valid results</div>
      )}
      {sortedResults.map((place, i) => {
        // Get the value for the current sort metric
        const sortConfig = sortBy && sortBy.id ? SORT_FIELD_MAP[sortBy.id] : null;
        const sortMetricValue = sortConfig ? place[sortConfig.field] : place["Summary star rating"];

        return (
          <LocationRow
            disableCompare={
              comparisonPlaces.length >= 3 &&
              comparisonPlaces.findIndex((p) => comparePlaces(p, place)) === -1
            }
            compareIndex={comparisonPlaces.findIndex((p) =>
              comparePlaces(p, place)
            )}
            onSelect={() => setSelectedPlace(place)}
            key={place["Facility ID"] + i}
            name={place.name}
            address={place.address}
            openHours={place.open_hours || "Open 24 hours"}
            phone={formatPhoneNumber(place.phone_number || "")}
            distance={place.distance}
            travelTime={place.time}
            patientRating={place["Summary star rating"] || 0}
            sortBy={sortBy}
            sortMetricValue={sortMetricValue}
            infectionLabelText={place["Infection Label"] || "Infections"}
            infectionStatus={getInfectionStatus(place["Infection Rating"])}
            onGoogleMaps={() =>
              window.open(addressToUrl(place.address), "_blank")
            }
            onCompare={() => handleCompare(place)}
            onRemoveComparison={(index) => onRemoveComparison(index)}
            dataDictionary={dataDictionary}
          />
        );
      })}
    </div>
  );
};

export default LocationResults;
