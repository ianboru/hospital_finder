import React from "react";
import SearchBar from "./SearchBar";
import FloatingDropdownButton from "./FloatingDropdownButton";
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
        <FloatingDropdownButton
          label={careType || "Care Type"}
          icon="▼"
        >
          <CareTypeDropdown
            selectedCareType={careType}
            onSelectCareType={onSelectCareType}
          />
        </FloatingDropdownButton>

        <FloatingDropdownButton
          label={sortBy && sortBy.name ? sortBy.name : "Sort By"}
          icon="≡"
        >
          <SortByDropdown
            selectedSort={sortBy}
            onSelectSort={onSelectSortBy}
          />
        </FloatingDropdownButton>
      </div>
    </div>
  );
};

export default SearchBox;
