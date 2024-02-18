import React, { useEffect, useState } from 'react'

const CareTypeFilter = (props) => {
    const careTypes = props.careTypes 
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