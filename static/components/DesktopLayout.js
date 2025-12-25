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
    showWebsiteGuideModal,
    setShowWebsiteGuideModal,
  } = useAppContext();

  const handleDebugData = useCallback(() => {
    const url = new URL(window.location);
    const location = url.searchParams.get("location");
    const radius = url.searchParams.get("radius");
    const careType = url.searchParams.get("careType");
    const search = url.searchParams.get("search");

    const debugUrl = `/api/debug-places-data/?location=${location || ""
      }&radius=${radius || ""}&careType=${careType || ""}&search=${search || ""}`;

    fetch(debugUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log("=== DEBUG DATA FROM SERVER ===");
        console.log("Params:", data.params);
        console.log("Places count:", data.google_places_data.length);
        console.log("Places data:", data.google_places_data);
        console.log("Metric quantiles:", data.metric_quantiles);
        console.log(
          "Data dictionary keys:",
          Object.keys(data.data_dictionary).length
        );
      })
      .catch((error) => {
        console.error("Error fetching debug data:", error);
      });
  }, []);

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
        <p>
          The data displayed on this website comes from the Centers for Medicare
          and Medicaid Services (CMS) standardized patient experience surveys
          called Consumer Assessment of Healthcare Providers and Systems
          (CAHPS). CMS sends these surveys to people covered by Medicare or
          Medicaid after they receive healthcare. Some of their responses are
          scored as a star rating to help compare quality.
        </p>

        <br />
        <p>HAI</p>
        <p>
          This data is <b>standardized</b> meaning the surveys use the same
          questions, format, timing, and collection methods across all hospitals
          and providers nationwide. Everyone is measured using the same process,
          so the results can be fairly compared from one place to another.
        </p>

        <p>
          The data is <b>validated</b> meaning the survey questions and methods
          have been scientifically tested to make sure they accurately measure
          what they're supposed to measure. Validation ensures the results
          are reliable, unbiased, and based on real-world evidence, not just
          opinions or inconsistent data.
        </p>
      </InfoModal>

      <InfoModal
        isOpen={showWebsiteGuideModal}
        onClose={() => setShowWebsiteGuideModal(false)}
        title="Website Guide 👓"
      >
        <h3>How to Use FindQualityCare.org</h3>
        <p>Website guide content will go here...</p>
      </InfoModal>

      <div className="desktop-header">
        <div className="header-content">
          <h1 className="header-title">
            CareFinder.com provides healthcare safety and quality information
          </h1>
          <p className="header-subtitle">
            Our data comes from national standardized public reporting from CMS
          </p>
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
            <button
              className="header-button debug-data-button"
              onClick={handleDebugData}
            >
              <span>Debug Data</span>
              <span className="button-icon">🐛</span>
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
      {definitionInfoPopUp}
    </div>
  );
};

export default DesktopLayout;
