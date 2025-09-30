import React, { useCallback } from "react";
import HeaderInformation from "./HeaderInformation";
import CareTypeFilter from "./CareTypeFilter";
import SearchButton from "./SearchButton";
import PlaceDetail from "./PlaceDetail";
import Map from "./Map";
import PlaceResults from "./PlaceResults";
import { useAppContext } from "../context/AppContext";
import SearchBar from "./SearchBar";
import LocationResults from "./LocationResults";
import SearchScreen from "./SearchScreen";
import CompareSelector from "./CompareSelector";
import ComparisonModal from "./ComparisonModal";
import "./DesktopLayout.css";
import SearchBox from "./SearchBox";

const DesktopLayout = () => {
  const {
    placesData,
    selectedPlace,
    setSelectedPlace,
    initialCareTypeParam,
    dataDictionary,
    metricQuantiles,
    onSearchSubmit,
    onSearchInputChange,
    setSearchTerm,
    searchTerm,
    setShownDefinition,
    shownDefinition,
    initialLocation,
    setZoomRadius,
    currentGPSLocation,
    definitionInfoPopUp,
    initialCareType,
    onSelectCareType,
    isSearchActive,
    comparisonPlaces,
    setComparisonPlaces,
    showComparisonModal,
    setShowComparisonModal,
  } = useAppContext();

  const handleRemoveComparison = useCallback(
    (index) => {
      setComparisonPlaces(comparisonPlaces.filter((_, i) => i !== index));
    },
    [comparisonPlaces]
  );

  const handleCompare = useCallback(
    (place) => {
      if (
        comparisonPlaces.length < 3 &&
        !comparisonPlaces.find((p) => p.id === place.id)
      ) {
        setComparisonPlaces([...comparisonPlaces, place]);
      }
    },
    [comparisonPlaces]
  );

  return (
    <div className="desktop-app">
      {showComparisonModal && (
        <ComparisonModal
          comparisonPlaces={comparisonPlaces}
          onClose={() => setShowComparisonModal(false)}
          onBack={() => setShowComparisonModal(false)}
        />
      )}

      <div className="desktop-header"></div>

      <div className="desktop-main-content">
        <div className="desktop-sidebar">
          <SearchBox />
          {comparisonPlaces.length > 0 && (
            <CompareSelector
              selectedHospitals={comparisonPlaces}
              onRemove={(index) => handleRemoveComparison(index)}
              navigateToComparison={() => setShowComparisonModal(true)}
            />
          )}

          <LocationResults
            results={placesData}
            onCompare={(place) => handleCompare(place)}
            title="Hospitals"
            onRemoveComparison={handleRemoveComparison}
          />
        </div>

        <div className="desktop-map-container">
          {selectedPlace && (
            <PlaceDetail
              selectedPlace={selectedPlace}
              setSelectedPlace={setSelectedPlace}
              setShownDefinition={setShownDefinition}
              shownDefinition={shownDefinition}
              selectedCareType={initialCareTypeParam}
              dataDictionary={dataDictionary}
              metricQuantiles={metricQuantiles}
            />
          )}

          <Map
            placesData={placesData}
            initialLocation={initialLocation}
            setSelectedPlace={setSelectedPlace}
            selectedPlace={selectedPlace}
            metricQuantiles={metricQuantiles}
            onSearchSubmit={onSearchSubmit}
            setZoomRadius={setZoomRadius}
            currentGPSLocation={currentGPSLocation}
          />
        </div>
      </div>
    </div>
  );
};

export default DesktopLayout;
