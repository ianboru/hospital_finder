import React, { useState } from "react";
import SearchBar from "./SearchBar";
import FloatingFilterButton from "./FloatingFilterButton";
import FloatingSortButton from "./FloatingSortButton";
import CareTypeFilter from "./CareTypeFilter";
import "./SearchBox.css";
import { useAppContext } from "../context/AppContext";

const SearchBox = ({ placeholder = "Search facilities or locations here" }) => {
  const [showCareTypeFilter, setShowCareTypeFilter] = useState(false);
  const {
    careType,
    onSelectCareType,
  } = useAppContext();

  const handleFilterClick = () => {
    setShowCareTypeFilter(!showCareTypeFilter);
  };

  return (
    <div className="search-box-container">
      <div className="search-tile search-bar-tile">
        <SearchBar
          placeholder={placeholder}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        <div className="search-tile filter-tile">
          <FloatingFilterButton
            label={careType || "Care Type"}
            icon="▼"
            onClick={handleFilterClick}
          />
        </div>

        {/* Sort Button Tile */}
        {/* <div className="search-tile sort-tile">
          <FloatingSortButton label="Sort By" icon="≡" onClick={() => {}} />
        </div> */}

        {/* Care Type Filter Dropdown Tile - Conditionally Rendered */}
        {showCareTypeFilter && (
          <div className="search-tile care-type-tile">
            <CareTypeFilter
              selectedCareType={careType}
              onSelectCareType={(_careType) => {
                // setCareType(_careType);
                onSelectCareType(_careType);
                setShowCareTypeFilter(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
