import React from "react";
import { useAppContext } from "../context/AppContext";
import "./SearchBar.css";

const SearchBar = ({ placeholder = "Search facilities or locations here" }) => {
  const { searchTerm, setSearchTerm, onSearchSubmit, setIsSearchActive } =
    useAppContext();
  return (
    <form
      onSubmit={(e) => {
        console.log("!!onSubmit", searchTerm);
        e.preventDefault();
        onSearchSubmit();
      }}
    >
      <div className="sb-container">
        <span className="sb-icon" role="img" aria-label="search">
          🔍
        </span>
        <input
          id="search-bar"
          className="sb-input"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setIsSearchActive(true)}
          onBlur={() => setTimeout(() => setIsSearchActive(false), 200)}
        />
        {/* {value && (
        <button className="sb-clear" onClick={onClear} aria-label="Clear">
          ×
        </button>
      )} */}
      </div>
    </form>
  );
};

export default SearchBar;
