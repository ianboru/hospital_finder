import ReactDOM from "react-dom";
import React from "react";
import PlaceResults from "./components/PlaceResults";
import PlaceDetail from "./components/PlaceDetail";
import SearchButton from "./components/SearchButton";
import HeaderInformation from "./components/HeaderInformation";
import Map from "./components/Map";
import CareTypeFilter from "./components/CareTypeFilter";
import TabComponent from "./components/TabComponent";
import "./App.css";
import StartingModal from "./components/StartingModal";
import PlaceResultsMobile from "./components/PlaceResultsMobile";
import MobileLayout from "./components/MobileLayout";
import { AppProvider, useAppContext } from "./context/AppContext";

function AppContent() {
  console.log("version 0.9");
  
  const {
    placesData,
    metricQuantiles,
    dataDictionary,
    selectedPlace,
    setSelectedPlace,
    initialLocation,
    initialCareType,
    initialCareTypeParam,
    searchTerm,
    setSearchTerm,
    zoomRadius,
    setZoomRadius,
    shownDefinition,
    setShownDefinition,
    currentGPSLocation,
    onSelectCareType,
    onSearchInputChange,
    onSearchSubmit,
    definitionInfoPopUp,
    isMobile,
  } = useAppContext();

  console.log("initial placeresults", placesData);
  console.log("initial quantiles", metricQuantiles);
  console.log("initial dictionary", dataDictionary);
  console.log("initial care type", initialCareType);
  console.log("initial map location", initialLocation);
  console.log("is mobile", isMobile);
  
  if (isMobile) {
    return (
      <MobileLayout />
    );
  }

  return (
    <div className="app">
      <HeaderInformation />
      <div className="main-app">
        <div className="search-container">
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

          <div>
            <PlaceResults
              placesData={placesData}
              selectedPlace={selectedPlace}
              setSelectedPlace={setSelectedPlace}
              selectedCareType={initialCareTypeParam}
            />
          </div>
        </div>
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
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
