import React, { useEffect, useState } from 'react'

const CareTypeFilter = (props) => {
    const careTypes = props.careTypes 
    const filterCareType = (careType) => {
        //send data to the backend
        console.log(
            'careType, ', careType
        )
    }

    return(
        <div>
            <h5>Filter</h5>
            <ul>
            {
            careTypes.map(careType => (
                <button onClick={() => filterCareType(careType)} key={careType.id}>{careType.name}</button>
            ))
            }
            </ul>
        </div>
    )
}

export default CareTypeFilter