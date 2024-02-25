import React, { useEffect, useState } from 'react'

const CareTypeFilter = (props) => {
    console.log("care types", careTypes)
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
        //send data to the backend
        console.log(
            'careType, ', careType
        )
    }
    const handleChange = (event) => {
        const careTypeId = event.target.value 
        const careType = careTypes.find(value => value.id == careTypeId) 
        filterCareType(careType)
      }

    return(
        <div>
            <h5>Filter</h5>
            <select onChange={handleChange}>
            <option>Select Care Type</option>
            {careTypes.map(careType => (
                <option key={careType.id} value={careType.id}>{careType.name}</option>
            ))}
            </select>
        </div>
    )
}

export default CareTypeFilter