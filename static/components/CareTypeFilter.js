import React, { useEffect, useState } from 'react'
import SelectDropdown from './SelectDropdown'

const CareTypeFilter = (props) => {
    const [alreadySelectedCareType, setAlreadySelectedCareType] = React.useState(false)
    let onSelectCareType = props.onSelectCareType
    let selectedCareType = props.selectedCareType

    const careTypes = [
        { 'id': 2, 'name': 'Hospital' },
        { 'id': 3, 'name': 'ED' },
        { 'id': 4, 'name': 'Outpatient' },
        { 'id': 5, 'name': 'Hospice' },
        { 'id': 8, 'name': 'Home Health' },
        { 'id': 9, 'name': 'Nursing Homes' }
    ]

    const foundCareType = selectedCareType ?
        careTypes.find(el => el["name"] === selectedCareType) : null
    const selectedCareTypeId = foundCareType ? foundCareType.id : null

    const handleChange = (careTypeId) => {
        if (!alreadySelectedCareType) {
            setAlreadySelectedCareType(true)
        }
        const careType = careTypes.find(value => value.id == careTypeId)
        onSelectCareType(careType)
    }

    return (
        <div>
            {!alreadySelectedCareType ? <div>Choose the type of care you are looking for</div> : <></>}
            <SelectDropdown
                options={careTypes}
                selectedValue={selectedCareTypeId}
                onChange={handleChange}
                placeholder="Select Care Type"
                label="Care Type |"
                showLabel={false}
                className="care-type-dropdown"
                isSearchable={false}
                isClearable={false}
            />
        </div>
    )
}

export default CareTypeFilter