import React from 'react'
import SelectDropdown from './SelectDropdown'
import { getSortOptions } from '../constants/sortConstants'
import { useAppContext } from '../context/AppContext'
import './SortByFilter.css'

const SortByFilter = ({ selectedSort, onSelectSort }) => {
    const { sortDirection, toggleSortDirection } = useAppContext()
    const sortOptions = getSortOptions()
    
    const foundSortOption = selectedSort ? 
        sortOptions.find(el => el.name === selectedSort || el.id === selectedSort) : null
    const selectedSortId = foundSortOption ? foundSortOption.id : null
    
    const handleChange = (sortId) => {
        const sortOption = sortOptions.find(value => value.id == sortId)
        onSelectSort(sortOption)
    }
    
    return (
        <div className="sort-by-filter-container">
            <SelectDropdown
                options={sortOptions}
                selectedValue={selectedSortId}
                onChange={handleChange}
                placeholder="Sort By"
                label="Sort By |"
                showLabel={false}
                className="sort-by-dropdown"
                isSearchable={false}
                isClearable={false}
            />
            {selectedSort && (
                <button 
                    className="sort-direction-toggle"
                    onClick={toggleSortDirection}
                    title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
                >
                    {sortDirection === 'asc' ? '↑' : '↓'}
                </button>
            )}
        </div>
    )
}

export default SortByFilter