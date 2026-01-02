import ReactDOM from "react-dom";
import React from "react";
import "./App.css";
import MobileLayout from "./components/MobileLayout";
import DesktopLayout from "./components/DesktopLayout";
import { AppProvider, DefinitionProvider, useAppContext } from "./context/AppContext";

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
    currentGPSLocation,
    onSelectCareType,
    onSearchInputChange,
    onSearchSubmit,
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
  // Get dataDictionary from DOM for DefinitionProvider
  const dataDictionary = JSON.parse(
    document.getElementById("data_dictionary").textContent
  );

  return (
    <DefinitionProvider dataDictionary={dataDictionary}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </DefinitionProvider>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
