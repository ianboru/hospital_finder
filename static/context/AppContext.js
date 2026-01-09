import React, { createContext, useContext, useEffect, useCallback, useState } from "react";
import { SORT_FIELD_MAP } from "../constants/sortConstants";

const AppContext = createContext();
const DefinitionContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const useDefinitionContext = () => {
  const context = useContext(DefinitionContext);
  if (!context) {
    throw new Error('useDefinitionContext must be used within an AppProvider');
  }
  return context;
};

// Separate provider for definition popup state - completely independent
export const DefinitionProvider = ({ children, dataDictionary }) => {
  const [shownDefinition, setShownDefinition] = useState(null);

  const value = React.useMemo(() => ({
    shownDefinition,
    setShownDefinition,
    dataDictionary,
  }), [shownDefinition, setShownDefinition, dataDictionary]);

  console.log('[DefinitionProvider] RENDERING', { shownDefinition });

  return (
    <DefinitionContext.Provider value={value}>
      {children}
    </DefinitionContext.Provider>
  );
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
  console.log('[app] placesData', placesData)

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

  // Add careType to URL if missing (without reloading)
  useEffect(() => {
    if (!initialCareTypeParam && initialLocationParam) {
      let newUrl = new URL(window.location);
      newUrl.searchParams.set("careType", "Hospital");
      window.history.replaceState({}, '', newUrl);
    }
  }, []);
  const [sortBy, setSortBy] = useState({ id: 'distance', name: 'Distance' }); // Default to distance
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc' - distance defaults to ascending

  const [selectedPlace, _setSelectedPlace] = useState(null);
  const [searchTerm, setSearchTerm] = useState(
    initialSearchParam ? initialSearchParam : ""
  );
  const [zoomRadius, setZoomRadius] = useState(initialZoomRadius);
  const [currentGPSLocation, setCurrentGPSLocation] = useState(null);
  const [width, setWidth] = useState(window.innerWidth);
  const [activeTab, setActiveTab] = useState('map');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // State for comparision
  const [comparisonPlaces, setComparisonPlaces] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // State for info modals
  const [showAboutUsModal, setShowAboutUsModal] = useState(false);
  const [showAboutDataModal, setShowAboutDataModal] = useState(false);
  const [showWebsiteGuideModal, setShowWebsiteGuideModal] = useState(false);
  const [showLocationPermissionModal, setShowLocationPermissionModal] = useState(false);


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

  // Function to request geolocation
  const requestGeolocation = useCallback(() => {
    console.log("=== requestGeolocation called ===");

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser");
      alert("Your browser doesn't support geolocation");
      return;
    }

    console.log("navigator.geolocation is available, calling getCurrentPosition...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(
          "✅ SUCCESS: Got position",
          position.coords,
          initialLocation
        );
        // Hide modal on success
        setShowLocationPermissionModal(false);

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
      },
      (error) => {
        // Error callback is required for Safari to prompt for location
        console.error("❌ ERROR: Geolocation error:", error);
        console.log("Error code:", error.code);
        console.log("Error message:", error.message);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            setShowLocationPermissionModal(true);
            break;
          case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
          case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
        }
      }
    );
  }, [initialLocation]);

  // Effects
  useEffect(() => {
    console.log("starting initial location")
    requestGeolocation();
  }, []);

  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  // Computed values
  const isMobile = width < 768;

  console.log('[AppProvider] RENDERING', {
    selectedPlace: selectedPlace ? selectedPlace.name : null,
    width,
    sortBy: sortBy ? sortBy.id : null,
  });

  const value = React.useMemo(() => ({
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
    showAboutUsModal,
    showAboutDataModal,
    showWebsiteGuideModal,
    showLocationPermissionModal,
    // Functions
    setSelectedPlace,
    setSearchTerm,
    setZoomRadius,
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
    setShowAboutUsModal,
    setShowAboutDataModal,
    setShowWebsiteGuideModal,
    setShowLocationPermissionModal,
    requestGeolocation,
  }), [
    // Data (these never change)
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
    showAboutUsModal,
    showAboutDataModal,
    showWebsiteGuideModal,
    showLocationPermissionModal,
    // Functions (these are stable due to useCallback/useState)
    setSelectedPlace,
    setSearchTerm,
    setZoomRadius,
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
    setShowAboutUsModal,
    setShowAboutDataModal,
    setShowWebsiteGuideModal,
    setShowLocationPermissionModal,
    requestGeolocation,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 