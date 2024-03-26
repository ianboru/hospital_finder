import React, { useEffect, useState } from 'react'
import '../CareTypeFilter.css'

const CareTypeFilter = (props) => { 

    let onSelectCareType = props.onSelectCareType
    let selectedCareType = props.selectedCareType

    const careTypes = [
        { 'id': 1, 'name': 'All' },
        { 'id': 2, 'name': 'Hospital' },
        { 'id': 3, 'name': 'ED' },
        { 'id': 4, 'name': 'Nursing Home' },
        { 'id': 5, 'name': 'Dialysis' },
        { 'id': 6, 'name': 'Long-Term Care' },
        { 'id': 7, 'name': 'In-Patient Rehabilitation' },
        { 'id': 8, 'name': 'Home Health' }
    ]
    const selectedCareTypeId = careTypes.find(el =>
        el["name"] === selectedCareType
    ).id
    const handleChange = (event) => { 
        const careTypeId = event.target.value 
        const careType = careTypes.find(value => value.id == careTypeId) 
        onSelectCareType(careType)
    }
    console.log("filter selected", selectedCareTypeId, selectedCareType)
    return(
    <div class="dropdown-container">
        <span class="dropdown-label">Care Type</span>
        <div class="dropdown">
            <select class="dropdown-select" value={selectedCareType ? selectedCareTypeId : ''} onChange={handleChange}>
                <option value="" disabled>Select Care Type</option>
                {careTypes.map(careType => (
                    <option key={careType.id} value={careType.id}>{careType.name}</option>
                ))}
            </select>
            <span class="dropdown-arrow">&#9662;</span>
        </div>
    </div>
    )
}

export default CareTypeFilter