import React, { useRef, useEffect } from 'react'
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
    const selectRef = useRef(null)
    const measureRef = useRef(null)

    // Transform options to select format
    const selectOptions = options.map(option => ({
        value: option.id || option.value,
        label: option.name || option.label
    }))

    // Find the selected option
    const selectedOption = selectOptions.find(opt => opt.value === selectedValue) || null

    const handleChange = (e) => {
        const value = e.target.value
        onChange(value ? parseInt(value) : null)
    }

    // Calculate and set width based on content
    useEffect(() => {
        if (selectRef.current && measureRef.current) {
            // Find the longest option text
            const longestText = selectOptions.reduce((longest, option) => {
                return option.label.length > longest.length ? option.label : longest
            }, '')

            // Measure the width
            measureRef.current.textContent = longestText
            const textWidth = measureRef.current.offsetWidth

            // Set select width (add padding for dropdown arrow)
            selectRef.current.style.width = `${textWidth + 40}px`
        }
    }, [selectOptions])

    return (
        <div className={`select-dropdown-container ${className}`}>
            {showLabel && label && <span className="select-dropdown-label">{label}</span>}
            <select
                ref={selectRef}
                className="native-select"
                value={selectedValue || ''}
                onChange={handleChange}
            >
                {!selectedValue && placeholder && (
                    <option value="" disabled>{placeholder}</option>
                )}
                {selectOptions.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {/* Hidden span for measuring text width */}
            <span ref={measureRef} className="select-measure" aria-hidden="true"></span>
        </div>
    )
}

export default SelectDropdown