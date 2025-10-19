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
        />
      </>
    );
  };

  return (
    <div className="app">
      {showComparisonModal && (
        <ComparisonModal
          comparisonPlaces={comparisonPlaces}
          onClose={() => setShowComparisonModal(false)}
          onBack={() => setShowComparisonModal(false)}
        />
      )}
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
    </div>
  );
};

export default MobileLayout;
