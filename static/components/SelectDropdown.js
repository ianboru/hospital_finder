import React from 'react'
import Select from 'react-select'
import '../SelectDropdown.css'

const SelectDropdown = ({ 
    options = [], 
    selectedValue, 
    onChange, 
    placeholder = "Select an option",
    label = null,
    showLabel = true,
    className = "",
    isSearchable = true,
    isClearable = false
}) => {
    // Transform options to react-select format
    const selectOptions = options.map(option => ({
        value: option.id || option.value,
        label: option.name || option.label
    }))

    // Find the selected option
    const selectedOption = selectOptions.find(opt => opt.value === selectedValue) || null

    const handleChange = (selected) => {
        onChange(selected ? selected.value : null)
    }

    return (
        <div className={`select-dropdown-container ${className}`}>
            {showLabel && label && <span className="select-dropdown-label">{label}</span>}
            <Select
                className="react-select-container"
                classNamePrefix="react-select"
                options={selectOptions}
                value={selectedOption}
                onChange={handleChange}
                placeholder={placeholder}
                isSearchable={isSearchable}
                isClearable={isClearable}
            />
        </div>
    )
}

export default SelectDropdown