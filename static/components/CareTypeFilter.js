import React, { useEffect, useState } from 'react'

const CareTypeFilter = (props) => { 
    let setCareTypeFilter = props.setCareTypeFilter
    let selectedCareType = props.selectedCareType
    const careTypes = [
        { 'id': 1, 'name': 'Home Health' },
        { 'id': 2, 'name': 'Hospital' },
        { 'id': 3, 'name': 'Emergency Department (ED or ER)' },
        { 'id': 4, 'name': 'Nursing Home' },
        { 'id': 5, 'name': 'Dialysis' },
        { 'id': 6, 'name': 'Long-Term Care' },
        { 'id': 7, 'name': 'In-Patient Rehabilitation' }
    ]
    const filterCareType = (careType) => {
        console.log(
            'careType, ', careType
        )
        setCareTypeFilter(careType)
    }
    const handleChange = (event) => {
        console.log('event handlechange', event)
        const careTypeId = event.target.value 
        const careType = careTypes.find(value => value.id == careTypeId) 
        filterCareType(careType)
      }
      console.log('care type in care type filter - ', careTypes, selectedCareType)
    return(
        <div>
            <h5>Filter</h5>
            <select value={selectedCareType ? selectedCareType.id : ''} onChange={handleChange}>
            <option>Select Care Type</option>
            {careTypes.map(careType => (
                <option key={careType.id} value={careType.id}>{careType.name}</option>
            ))}
            </select>
        </div>
    )
}

export default CareTypeFilter