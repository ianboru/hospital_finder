import React from "react";
import SearchBar from "./SearchBar";
import CareTypeDropdown from "./CareTypeDropdown";
import SortByDropdown from "./SortByDropdown";
import "./SearchBox.css";
import { useAppContext } from "../context/AppContext";

const SearchBox = ({ placeholder = "Search facilities or locations here" }) => {
  const {
    careType,
    onSelectCareType,
    sortBy,
    onSelectSortBy,
  } = useAppContext();

  return (
    <div className="search-box-container">
      <div className="search-tile search-bar-tile">
        <SearchBar placeholder={placeholder} />
      </div>

      <div className="filter-buttons-container">
        <div className="care-type-filter-wrapper">
          <CareTypeDropdown
            selectedCareType={careType}
            onSelectCareType={onSelectCareType}
          />
        </div>

        <div className="sort-by-filter-wrapper">
          <SortByDropdown
            selectedSort={sortBy}
            onSelectSort={onSelectSortBy}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchBox;
