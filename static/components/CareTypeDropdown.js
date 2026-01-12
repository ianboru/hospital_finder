import React from 'react';
import SelectDropdown from './SelectDropdown';

const careTypes = [
  { id: 2, name: 'Hospital' },
  { id: 3, name: 'ED' },
  { id: 4, name: 'Outpatient' },
  { id: 5, name: 'Hospice' },
  { id: 8, name: 'Home Health' },
  { id: 9, name: 'Nursing Homes' }
];

const CareTypeDropdown = ({ selectedCareType, onSelectCareType, onSelect }) => {
  const foundCareType = selectedCareType
    ? careTypes.find(el => el.name === selectedCareType)
    : null;
  const selectedCareTypeId = foundCareType ? foundCareType.id : null;

  const handleChange = (careTypeId) => {
    const careType = careTypes.find(value => value.id == careTypeId);
    onSelectCareType(careType.name);
    if (onSelect) onSelect(); // Close the dropdown
  };

  return (
    <SelectDropdown
      options={careTypes}
      selectedValue={selectedCareTypeId}
      onChange={handleChange}
      placeholder="Select Care Type"
      showLabel={false}
      className="care-type-dropdown"
      isSearchable={false}
      isClearable={false}
    />
  );
};

export default CareTypeDropdown;