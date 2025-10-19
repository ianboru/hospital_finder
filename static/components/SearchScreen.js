import React from "react";
import { useAppContext } from "../context/AppContext";
import LocationResults from "./LocationResults";
import "./SearchScreen.css";

const SearchScreen = () => {
  const {
    placesData,
    setSelectedPlace,
  } = useAppContext();
  return (
    <div className="search-screen">
      <LocationResults
        results={placesData}
        onClose={() => setSelectedPlace(null)}
        onCompare={() => setSelectedPlace(null)}
        title="Hospitals"
      />
    </div>
  );
};

export default SearchScreen;
