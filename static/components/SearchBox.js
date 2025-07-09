import React, { useState } from "react";
import SearchBar from "./SearchBar";
import FloatingFilterButton from "./FloatingFilterButton";
import FloatingSortButton from "./FloatingSortButton";
import CareTypeFilter from "./CareTypeFilter";
import "./SearchBox.css";

const SearchBox = ({
  searchValue,
  onSearchChange,
  onSearchClear,
  selectedCareType,
  onSelectCareType,
  onSortClick,
  placeholder = "Search facilities or locations here",
}) => {
  const [showCareTypeFilter, setShowCareTypeFilter] = useState(false);

  const handleFilterClick = () => {
    setShowCareTypeFilter(!showCareTypeFilter);
  };

  return (
    <div className="search-box-container">
      {/* Main Search Bar Tile */}
      <div className="search-tile search-bar-tile">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          onClear={onSearchClear}
          placeholder={placeholder}
        />
      </div>

      {/* Filter Button Tile */}
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        <div className="search-tile filter-tile">
          <FloatingFilterButton
            label={selectedCareType || "Care Type"}
            icon="▼"
            onClick={handleFilterClick}
          />
        </div>

        {/* Sort Button Tile */}
        <div className="search-tile sort-tile">
          <FloatingSortButton label="Sort By" icon="≡" onClick={onSortClick} />
        </div>

        {/* Care Type Filter Dropdown Tile - Conditionally Rendered */}
        {showCareTypeFilter && (
          <div className="search-tile care-type-tile">
            <CareTypeFilter
              selectedCareType={selectedCareType}
              onSelectCareType={(careType) => {
                onSelectCareType(careType);
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
