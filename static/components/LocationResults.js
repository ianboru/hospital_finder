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
  const { setSelectedPlace, comparisonPlaces, setComparisonPlaces, isMobile, sortBy } =
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

  // Sort results based on selected sort option
  const sortedResults = useMemo(() => {
    if (!sortBy || !sortBy.id) {
      return results; // Return unsorted if no sort option selected
    }

    const sorted = [...results];
    
    // Map sort option IDs to actual data field names
    const sortFieldMap = {
      'distance': 'distance',
      'care_transition': 'Care transition',
      'cleanliness': 'Cleanliness',
      'discharge_info': 'Discharge Information',
      'doctor_comm': 'Doctors Always Communicated Well',
      'medicine_comm': 'Communication About Medicines',
      'nurse_comm': 'Nurses Always Communicated Well',
      'overall_rating': 'Summary star rating',
      'patient_exp': 'Patient Experience',
      'quietness': 'Always Quiet at Night',
      'staff_resp': 'Staff Always Responsive',
      'recommend': 'Would Definitely Recommend'
    };

    const sortField = sortFieldMap[sortBy.id];
    
    if (sortField) {
      sorted.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        // Special handling for distance (sort ascending - closer first)
        if (sortField === 'distance') {
          // Parse distance values if they're strings like "2.5 mi"
          const parseDistance = (val) => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
              const num = parseFloat(val);
              return isNaN(num) ? Infinity : num;
            }
            return Infinity;
          };
          
          return parseDistance(aValue) - parseDistance(bValue);
        }
        
        // Sort in descending order (higher values first) for ratings
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return bValue - aValue;
        }
        
        // For string values, sort alphabetically
        return String(bValue).localeCompare(String(aValue));
      });
    }
    
    return sorted;
  }, [results, sortBy]);

  return ( 
    <div className="lr-results-sheet">
      <div className="lr-results-header">
        {isMobile && (
          <span className="lr-results-title">{title}</span>
        )}
      </div>
      <div className="lr-results-list">
        {sortedResults.length === 0 && (
          <div className="lr-no-results">No valid results</div>
        )}
        {sortedResults.map((place, i) => (
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
