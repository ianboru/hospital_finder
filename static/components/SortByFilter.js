import React from 'react'
import SelectDropdown from './SelectDropdown'

const SortByFilter = ({ selectedSort, onSelectSort }) => {
    const sortOptions = [
        { id: 'distance', name: 'Distance' },
        { id: 'care_transition', name: 'Care Transition' },
        { id: 'cleanliness', name: 'Cleanliness' },
        { id: 'discharge_info', name: 'Discharge Information' },
        { id: 'doctor_comm', name: 'Doctor Communication' },
        { id: 'medicine_comm', name: 'Medicine Communication' },
        { id: 'nurse_comm', name: 'Nurse Communication' },
        { id: 'overall_rating', name: 'Overall Rating' },
        { id: 'patient_exp', name: 'Patient Experience' },
        { id: 'quietness', name: 'Quietness' },
        { id: 'staff_resp', name: 'Staff Responsiveness' },
        { id: 'recommend', name: 'Would Recommend' }
    ]
    
    const foundSortOption = selectedSort ? 
        sortOptions.find(el => el.name === selectedSort || el.id === selectedSort) : null
    const selectedSortId = foundSortOption ? foundSortOption.id : null
    
    const handleChange = (sortId) => {
        const sortOption = sortOptions.find(value => value.id == sortId)
        onSelectSort(sortOption)
    }
    
    return (
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
    )
}

export default SortByFilter