import React, { useCallback, useRef, useEffect } from "react";
import PlaceDetail from "./PlaceDetail";
import Map from "./Map";
import { useAppContext } from "../context/AppContext";
import BottomSheet from "./BottomSheet";
import LocationResults from "./LocationResults";
import "./MobileLayout.css";
import SearchBox from "./SearchBox";
import CompareSelector from "./CompareSelector";
import ComparisonModal from "./ComparisonModal";
import InfoModal from "./InfoModal";
import AboutUsContent from "./AboutUsContent";

const MobileLayout = () => {
  const {
    placesData,
    selectedPlace,
    setSelectedPlace,
    initialCareTypeParam,
    dataDictionary,
    metricQuantiles,
    onSearchSubmit,
    setShownDefinition,
    shownDefinition,
    initialLocation,
    setZoomRadius,
    currentGPSLocation,
    comparisonPlaces,
    setComparisonPlaces,
    showComparisonModal,
    setShowComparisonModal,
    definitionInfoPopUp,
    showAboutUsModal,
    setShowAboutUsModal,
    showAboutDataModal,
    setShowAboutDataModal,
  } = useAppContext();

  const bottomSheetRef = useRef(null);

  useEffect(() => {
    if (selectedPlace) {
      bottomSheetRef.current && bottomSheetRef.current.expand();
    }
  }, [selectedPlace]);




  const handleRemoveComparison = useCallback(
    (index) => {
      setComparisonPlaces(comparisonPlaces.filter((_, i) => i !== index));
    },
    [comparisonPlaces]
  );


  const BottomSheetContent = () => {
    if (selectedPlace) {
      return (
        <PlaceDetail
          selectedPlace={selectedPlace}
          setSelectedPlace={setSelectedPlace}
          setShownDefinition={setShownDefinition}
          shownDefinition={shownDefinition}
          selectedCareType={initialCareTypeParam}
          dataDictionary={dataDictionary}
          metricQuantiles={metricQuantiles}
        />
      );
    }

    return (
      <>
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
          setShownDefinition={setShownDefinition}
          dataDictionary={dataDictionary}
        />
      </>
    );
  };

  const aboutTheDataModal = <InfoModal
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
      This data is <b>standardized</b> meaning the surveys use the same
      questions, format, timing, and collection methods across all hospitals
      and providers nationwide. Everyone is measured using the same process,
      so the results can be fairly compared from one place to another.
    </p>

    <p>
      The data is <b>validated</b> meaning the survey questions and methods
      have been scientifically tested to make sure they accurately measure
      what they're supposed to measure. Validation ensures the results
      are reliable, unbiased, and based on real-world evidence, not just
      opinions or inconsistent data.
    </p>
  </InfoModal>

  const mobileHeader = <div className="mobile-header">
    <div className="mobile-header-content">
      <h1 className="mobile-header-title">CareFinder.com</h1>
      <div className="mobile-header-buttons">
        <button
          className="mobile-header-button"
          onClick={() => setShowAboutUsModal(true)}
        >
          About Us
        </button>
        <button
          className="mobile-header-button"
          onClick={() => setShowAboutDataModal(true)}
        >
          About Data
        </button>
      </div>
    </div>
  </div>

  return (
    <div className="app">
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

      {aboutTheDataModal}

      {/* Compact Mobile Header */}
      {mobileHeader}

      <SearchBox />
      <div className="map-container">
        <Map
          placesData={placesData}
          initialLocation={initialLocation}
          setSelectedPlace={setSelectedPlace}
          selectedPlace={selectedPlace}
          metricQuantiles={metricQuantiles}
          onSearchSubmit={onSearchSubmit}
          setZoomRadius={setZoomRadius}
          currentGPSLocation={currentGPSLocation}
        ></Map>
      </div>
      <BottomSheet ref={bottomSheetRef}>
        <BottomSheetContent />
      </BottomSheet>
      {definitionInfoPopUp}
    </div>
  );
};

export default MobileLayout;
