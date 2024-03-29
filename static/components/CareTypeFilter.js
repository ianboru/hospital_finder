import React, { useEffect, useState } from 'react'

const CareTypeFilter = (props) => { 

    let onSelectCareType = props.onSelectCareType
    let selectedCareType = props.selectedCareType

    const careTypes = [
        { 'id': 1, 'name': 'All' },
        { 'id': 2, 'name': 'Hospital' },
        { 'id': 3, 'name': 'ED' },
        { 'id': 4, 'name': 'Outpatient' },
        { 'id': 5, 'name': 'Hospice' },
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
        <div>
            <h3>Filter</h3> 
            <span>Select Care Type </span>
            <select value={selectedCareType ? selectedCareTypeId : ''} onChange={handleChange}>
                {careTypes.map(careType => (
                    <option key={careType.id} value={careType.id}>{careType.name}</option>
                ))}
            </select>
        </div>
    )
}

export default CareTypeFilter