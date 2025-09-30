import ReactDOM from "react-dom";
import React, { useCallback } from "react";
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
import DesktopLayout from "./components/DesktopLayout";
import { AppProvider, useAppContext } from "./context/AppContext";
import ComparisonModal from "./components/ComparisonModal";
import LocationResults from "./components/LocationResults";

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
    showComparisonModal,
    setShowComparisonModal,
    comparisonPlaces,
    setComparisonPlaces,
  } = useAppContext();

  // console.log("initial placeresults", placesData);
  // console.log("initial quantiles", metricQuantiles);
  // console.log("initial dictionary", dataDictionary);
  console.log("initial care type", initialCareType);
  // console.log("initial map location", initialLocation);
  // console.log("is mobile", isMobile);

  if (isMobile) {
    return <MobileLayout />;
  }

  return <DesktopLayout />;
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
