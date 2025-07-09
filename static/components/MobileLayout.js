import React from "react";
import HeaderInformation from "./HeaderInformation";
import CareTypeFilter from "./CareTypeFilter";
import SearchButton from "./SearchButton";
import PlaceDetail from "./PlaceDetail";
import Map from "./Map";
import PlaceResultsMobile from "./PlaceResultsMobile";
import PlaceResults from "./PlaceResults";
import { useAppContext } from "../context/AppContext";
import BottomSheet, { BottomSheetDemo } from "./BottomSheet";
import SearchBar from "./SearchBar";
import LocationResults from "./LocationResults";
import "./MobileLayout.css";
import SearchBox from "./SearchBox";

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
  } = useAppContext();

  return (
    <div className="app">
      {/* <HeaderInformation /> */}
      {/* <div className="search-container">
        <div
          style={{
            position: "-webkit-sticky", // this is for all Safari (Desktop & iOS), not for Chrome
            position: "sticky",
            top: 0,
            zIndex: 1, // any positive value, layer order is global
            background: "#fff",
            paddingRight: 15,
            paddingLeft: 10,
            width: "100%",
          }}
        >
          <CareTypeFilter
            selectedCareType={initialCareType}
            onSelectCareType={onSelectCareType}
          />
          <SearchButton
            onSearchSubmit={onSearchSubmit}
            searchTerm={searchTerm}
            onSearchInputChange={onSearchInputChange}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </div> */}
      {/* <div className="search-container">
        <SearchBar
          onChange={onSearchInputChange}
          onClear={() => setSearchTerm("")}
          value={searchTerm}
          placeholder="Search facilities or locations here"
        />
      </div> */}
      <SearchBox
        onSearchSubmit={onSearchSubmit}
        searchTerm={searchTerm}
        onSearchInputChange={onSearchInputChange}
        setSearchTerm={setSearchTerm}
      />
      <div className="map-container">
        {selectedPlace && (
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
        ></Map>
      </div>
      <BottomSheet>
        <LocationResults
          results={placesData}
          onClose={() => setSelectedPlace(null)}
          onCompare={() => setSelectedPlace(null)}
          title="Hospitals"
        />
      </BottomSheet>
      {/* <PlaceResultsMobile placesData={placesData} selectedPlace={selectedPlace} setSelectedPlace={setSelectedPlace} selectedCareType={initialCareTypeParam} /> */}
    </div>
  );
};

export default MobileLayout;
