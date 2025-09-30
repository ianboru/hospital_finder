import React from 'react';
import SelectDropdown from './SelectDropdown';
import { getSortOptions } from '../constants/sortConstants';
import { useAppContext } from '../context/AppContext';
import './SortByDropdown.css';

const SortByDropdown = ({ selectedSort, onSelectSort, onSelect }) => {
  const { sortDirection, toggleSortDirection } = useAppContext();
  const sortOptions = getSortOptions();

  const foundSortOption = selectedSort
    ? sortOptions.find(el => el.name === selectedSort.name || el.id === selectedSort.id)
    : null;
  const selectedSortId = foundSortOption ? foundSortOption.id : null;

  const handleChange = (sortId) => {
    const sortOption = sortOptions.find(value => value.id == sortId);
    onSelectSort(sortOption);
    if (onSelect) onSelect(); // Close the dropdown
  };

  return (
    <div className="sort-by-dropdown-container">
      <SelectDropdown
        options={sortOptions}
        selectedValue={selectedSortId}
        onChange={handleChange}
        placeholder="Sort By"
        showLabel={false}
        className="sort-by-dropdown"
        isSearchable={false}
        isClearable={false}
      />
      {selectedSort && (
        <button
          className="sort-direction-toggle"
          onClick={(e) => {
            e.stopPropagation();
            toggleSortDirection();
          }}
          title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      )}
    </div>
  );
};

export default SortByDropdown;