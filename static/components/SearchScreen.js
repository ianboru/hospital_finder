import React from "react";
import { useAppContext } from "../context/AppContext";
import LocationResults from "./LocationResults";
import "./SearchScreen.css";

const SearchScreen = () => {
  const {
    placesData,
    setSelectedPlace,
    setShownDefinition,
    dataDictionary,
  } = useAppContext();
  return (
    <div className="search-screen">
      <LocationResults
        results={placesData}
        onClose={() => setSelectedPlace(null)}
        onCompare={() => setSelectedPlace(null)}
        title="Hospitals"
        setShownDefinition={setShownDefinition}
        dataDictionary={dataDictionary}
      />
    </div>
  );
};

export default SearchScreen;
