import React, { useCallback, useRef, useEffect } from "react";
import HeaderInformation from "./HeaderInformation";
import CareTypeFilter from "./CareTypeFilter";
import SearchButton from "./SearchButton";
import PlaceDetail from "./PlaceDetail";
import Map from "./Map";
import PlaceResultsMobile from "./PlaceResultsMobile";
import PlaceResults from "./PlaceResults";
import { useAppContext } from "../context/AppContext";
import BottomSheet from "./BottomSheet";
import SearchBar from "./SearchBar";
import LocationResults from "./LocationResults";
import "./MobileLayout.css";
import SearchBox from "./SearchBox";
import SearchScreen from "./SearchScreen";
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

  const bottomSheetRef = useRef(null);
  // console.log("!!!!!isSearchActive", isSearchActive);
  //   if (isSearchActive) {
  //     return (
  //       <div className="app">
  //         <div
  //           style={{
  //           }}
  //         >
  //           <SearchBox
  //             onSearchSubmit={onSearchSubmit}
  //             searchTerm={searchTerm}
  //             onSearchInputChange={onSearchInputChange}
  //             setSearchTerm={setSearchTerm}
  //           />
  //         </div>
  //         <SearchScreen />
  //       </div>
  //     );
  //   }

  useEffect(() => {
    if (selectedPlace) {
      bottomSheetRef.current && bottomSheetRef.current.expand();
    }
  }, [selectedPlace]);

  const handleCompare = useCallback(
    (place) => {
      setComparisonPlaces([...comparisonPlaces, place]);
    },
    [comparisonPlaces]
  );

  const handleRemoveComparison = useCallback(
    (index) => {
      setComparisonPlaces(comparisonPlaces.filter((_, i) => i !== index));
    },
    [comparisonPlaces]
  );

  const handleAddComparison = useCallback(
    (index) => {
      setComparisonPlaces([...comparisonPlaces, index]);
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
        {/* {selectedPlace && (
          <div className="place-detail-overlay">
            {definitionInfoPopUp}
            <PlaceDetail
              selectedPlace={selectedPlace}
              setSelectedPlace={setSelectedPlace}
              setShownDefinition={setShownDefinition}
              shownDefinition={shownDefinition}
              selectedCareType={initialCareTypeParam}
              dataDictionary={dataDictionary}
              metricQuantiles={metricQuantiles}
            ></PlaceDetail>
          </div>
        )} */}
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
      {/* <PlaceResultsMobile placesData={placesData} selectedPlace={selectedPlace} setSelectedPlace={setSelectedPlace} selectedCareType={initialCareTypeParam} /> */}
    </div>
  );
};

export default MobileLayout;
