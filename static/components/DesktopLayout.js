import React, { useCallback } from "react";
import PlaceDetail from "./PlaceDetail";
import Map from "./Map";
import { useAppContext } from "../context/AppContext";
import LocationResults from "./LocationResults";
import CompareSelector from "./CompareSelector";
import ComparisonModal from "./ComparisonModal";
import InfoModal from "./InfoModal";
import AboutUsContent from "./AboutUsContent";
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
    showAboutUsModal,
    setShowAboutUsModal,
    showAboutDataModal,
    setShowAboutDataModal,
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

      {/* Info Modals */}
      <InfoModal
        isOpen={showAboutUsModal}
        onClose={() => setShowAboutUsModal(false)}
        title="About FindQualityCare.org"
      >
        <AboutUsContent />
      </InfoModal>

      <InfoModal
        isOpen={showAboutDataModal}
        onClose={() => setShowAboutDataModal(false)}
        title="About the Data"
      >
        <p>Data information content will go here...</p>
      </InfoModal>

      <div className="desktop-header">
        <div className="header-content">
          <h1 className="header-title">CareFinder.com provides healthcare safety and quality information</h1>
          <p className="header-subtitle">Our data comes from national standardized public reporting from CMS</p>
          <div className="header-buttons">
            <button 
              className="header-button about-us-button"
              onClick={() => setShowAboutUsModal(true)}
            >
              <span>About Us</span>
              <span className="button-icon">👤</span>
            </button>
            <button 
              className="header-button about-data-button"
              onClick={() => setShowAboutDataModal(true)}
            >
              <span>About the Data</span>
              <span className="button-icon">🔍</span>
            </button>
          </div>
        </div>
      </div>

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
