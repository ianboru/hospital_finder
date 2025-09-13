import React, { createContext, useContext, useEffect, useCallback, useState } from "react";
import { SORT_FIELD_MAP } from "../constants/sortConstants";

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Data from DOM
  const placesData = JSON.parse(
    document.getElementById("google_places_data").textContent
  );
  const metricQuantiles = JSON.parse(
    document.getElementById("metric_quantiles").textContent
  );
  const dataDictionary = JSON.parse(
    document.getElementById("data_dictionary").textContent
  );

  // URL parameters
  let url = new URL(window.location);
  const initialSearchParam = url.searchParams.get("search");
  const initialLocationParam = url.searchParams.get("location");
  const initialLocationSplit = initialLocationParam
    ? initialLocationParam.split(",")
    : [];
  const initialLocation = initialLocationSplit
    ? {
        lng: parseFloat(initialLocationSplit[0]),
        lat: parseFloat(initialLocationSplit[1]),
      }
    : {};
  const initialZoomRadius = url.searchParams.get("radius");
  const initialCareTypeParam = url.searchParams.get("careType");
  const initialCareType = initialCareTypeParam
    ? initialCareTypeParam
    : "Hospital";

  // State
  const [careType, setCareType] = useState(initialCareType);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  const [selectedPlace, _setSelectedPlace] = useState(null);
  const [searchTerm, setSearchTerm] = useState(
    initialSearchParam ? initialSearchParam : ""
  );
  const [zoomRadius, setZoomRadius] = useState(initialZoomRadius);
  const [shownDefinition, setShownDefinition] = useState(null);
  const [currentGPSLocation, setCurrentGPSLocation] = useState(null);
  const [width, setWidth] = useState(window.innerWidth);
  const [activeTab, setActiveTab] = useState('map');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // State for comparision
  const [comparisonPlaces, setComparisonPlaces] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);


  const onSearchSubmit = useCallback((
    newCenter = null,
    newRadius = null,
    careType = careType
  ) => {
    let url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("search", searchTerm);
    url.searchParams.set(
      "careType",
      careType ? (careType.name || careType) : initialCareType
    );
    if (newCenter && newCenter !== undefined) {
      if (newRadius) {
        url.searchParams.set("radius", `${newRadius}`);
      }
    } else {
      url.searchParams.set(
        "location",
        `${initialLocation.lng},${initialLocation.lat}`
      );
    }
    window.location.href = url;
  }, [searchTerm]);


  // Callback functions
  const setSelectedPlace = useCallback((place) => {
    _setSelectedPlace(place);
  }, []);

  const onSelectCareType = (careType) => {
    onSearchSubmit(null, null, careType);
  };

  const onSelectSortBy = (sortOption) => {
    setSortBy(sortOption);
    // Reset to default direction when changing sort field
    if (sortOption && sortOption.id) {
      const sortConfig = SORT_FIELD_MAP[sortOption.id];
      const defaultDirection = sortConfig && sortConfig.defaultAscending ? 'asc' : 'desc';
      setSortDirection(defaultDirection);
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
  };

  const onSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

 
  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  // Effects
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(
        "updating current position",
        position.coords,
        initialLocation
      );
      if (!initialLocation.lat) {
        console.log("updating url");
        let url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set(
          "location",
          `${position.coords.latitude},${position.coords.longitude}`
        );
        window.location.href = url;
      }

      setCurrentGPSLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });

    //hide definition modal
    window.addEventListener("mousedown", function (element) {
      console.log(element.target.classList);
      if (element.target.classList[0] != "definition-info-popup") {
        setShownDefinition(null);
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  // Computed values
  const isMobile = width < 768;
  
  const definitionInfoPopUp =
    shownDefinition && dataDictionary[shownDefinition] ? (
      <div className="definition-info-popup">
        <h3>{dataDictionary[shownDefinition].term}</h3>
        <div>{dataDictionary[shownDefinition].definition}</div>
      </div>
    ) : (
      <></>
    );

  const value = {
    // Data
    placesData,
    metricQuantiles,
    dataDictionary,
    initialLocation,
    initialCareType,
    initialCareTypeParam,
    
    // State
    selectedPlace,
    searchTerm,
    zoomRadius,
    shownDefinition,
    currentGPSLocation,
    width,
    activeTab,
    isSearchActive,
    isMobile,
    careType,
    sortBy,
    sortDirection,
    comparisonPlaces,
    showComparisonModal,
    // Functions
    setSelectedPlace,
    setSearchTerm,
    setZoomRadius,
    setShownDefinition,
    setCurrentGPSLocation,
    setActiveTab,
    onSelectCareType,
    onSelectSortBy,
    toggleSortDirection,
    onSearchInputChange,
    onSearchSubmit,
    setIsSearchActive,
    setCareType,
    setSortBy,
    setComparisonPlaces,
    setShowComparisonModal,
    // Computed
    definitionInfoPopUp,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 