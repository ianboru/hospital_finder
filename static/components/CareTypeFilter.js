import React, { useEffect, useState } from 'react'
import '../CareTypeFilter.css'

const CareTypeFilter = (props) => { 

    let onSelectCareType = props.onSelectCareType
    let selectedCareType = props.selectedCareType

    const careTypes = [
        { 'id': 1, 'name': 'All' },
        { 'id': 2, 'name': 'Hospital' },
        { 'id': 3, 'name': 'ED' },
        { 'id': 4, 'name': 'Outpatient' },
        { 'id': 5, 'name': 'Hospice' },
        { 'id': 8, 'name': 'Home Health' },
        { 'id': 8, 'name': 'Nursing Homes' }
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
    <div className="dropdown-container">
        <span className="dropdown-label">Care Type |</span>
        <div style={{fontSize : 20}} className="dropdown">
            <select className="dropdown-select" value={selectedCareType ? selectedCareTypeId : ''} onChange={handleChange}>
                <option style={{fontSize : 20}} value="" disabled>Select Care Type</option>
                {careTypes.map(careType => (
                    <option style={{fontSize : 20}} key={careType.id} value={careType.id}>{careType.name}</option>
                ))}
            </select>
            <span className="dropdown-arrow">&#9662;</span>
        </div>
    </div>
    )
}

export default CareTypeFilter