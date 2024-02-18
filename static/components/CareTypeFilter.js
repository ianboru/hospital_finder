import React, { useEffect, useState } from 'react'

const CareTypeFilter = (props) => {
    const careTypeFilter = props.careTypeFilter
    const setCareTypeFilter = props.setCareTypeFilter

    return(
        <div>
            <h1>Filter</h1>
            <ul>
            {
            careTypeFilter.map(careType => (
                <button onClick={} key={careType.id}>{careType.name}</button>
            ))
            }
            </ul>
        </div>
    )
}

export default CareTypeFilter