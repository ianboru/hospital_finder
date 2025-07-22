import React from "react";
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
