import ReactDOM from "react-dom";
import React from "react";
import "./App.css";
import MobileLayout from "./components/MobileLayout";
import DesktopLayout from "./components/DesktopLayout";
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
