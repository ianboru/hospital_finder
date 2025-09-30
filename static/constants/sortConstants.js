// Sort field mappings - maps sort option IDs to actual data field names
export const SORT_FIELD_MAP = {
  'distance': {
    id: 'distance',
    name: 'Distance',
    field: 'distance',
    defaultAscending: true // Default to closest first
  },
  'care_transition': {
    id: 'care_transition',
    name: 'Care Transition',
    field: 'Care transition - star rating',
    defaultAscending: false // Default to highest rating first
  },
  'cleanliness': {
    id: 'cleanliness',
    name: 'Cleanliness',
    field: 'Cleanliness - star rating',
    defaultAscending: false
  },
  'discharge_info': {
    id: 'discharge_info',
    name: 'Discharge Information',
    field: 'Discharge information - star rating',
    defaultAscending: false
  },
  'doctor_comm': {
    id: 'doctor_comm',
    name: 'Doctor Communication',
    field: 'Doctor communication - star rating',
    defaultAscending: false
  },
  'medicine_comm': {
    id: 'medicine_comm',
    name: 'Medicine Communication',
    field: 'Communication about medicines - star rating',
    defaultAscending: false
  },
  'nurse_comm': {
    id: 'nurse_comm',
    name: 'Nurse Communication',
    field: 'Nurse communication - star rating',
    defaultAscending: false
  },
  'overall_rating': {
    id: 'overall_rating',
    name: 'Overall Rating',
    field: 'Summary star rating',
    defaultAscending: false
  },
  'quietness': {
    id: 'quietness',
    name: 'Quietness',
    field: 'Quietness - star rating',
    defaultAscending: false
  },
  'staff_resp': {
    id: 'staff_resp',
    name: 'Staff Responsiveness',
    field: 'Staff responsiveness - star rating',
    defaultAscending: false
  }
};

// Get sort options array for dropdown
export const getSortOptions = () => {
  return Object.values(SORT_FIELD_MAP).map(option => ({
    id: option.id,
    name: option.name
  }));
};