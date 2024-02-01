import React from 'react'
import { getHCAHPSStars, getHaiStars } from '../utils';

const PlaceDetail = (props) => {
    const selectedPlace = props.selectedPlace
    const detailedExperienceMetrics = {
      "Nurse communication" : 5,
      "Doctor communication" : 5,
      "Staff Responsiveness" : 3,
      "Communication about medicines" : 1,
      "Discharge information" : 2,
      "Care transition" : 4,
      "Cleanliness" : 5,
      "Quietness" : 3,
    }

    const detailedExperienceMetricStars = Object.keys(detailedExperienceMetrics).map((metricName)=>{
      const metricValue = selectedPlace[metricName]
      return(
        <div style={{marginTop : 5, marginBottom: 5}}><b style={{alignSelf : "flex-start"}}>{metricName}</b> <span style={{color: "gold",alignSelf : "flex-end"}}>{getHCAHPSStars(metricValue)}</span> </div>
      )
    })
    console.log("stars", detailedExperienceMetricStars)
    return(
        <div style={{border : 2, borderColor : 'black', width : 400, marginRight : 10, marginLeft : 10}}>
            <h3>Current Selection</h3>
            <div>{selectedPlace.name}</div>
            <div>{selectedPlace.formatted_address}</div>
            {
              selectedPlace['Summary'] ?
              <div>
                <div>
                  <b>Patient Rating: <span style={{color:"#fdcc0d"}}>{getHCAHPSStars(selectedPlace['Summary'])}</span></b>
                </div>
                <div style={{marginLeft : 15}}>
                  {detailedExperienceMetricStars}
                </div>
              </div> : <></>
            }
            {
              selectedPlace['Infection Rating'] ?
              <div>
                <div>
                  <b>Infection Rating:</b> <span style={{color:"#fdcc0d",}}>{getHaiStars(selectedPlace['Infection Rating'])}</span>
                </div>
                <div style={{marginLeft : 15}}>
                  {/* Put infection details here */}
                </div>
              </div> : <></>
            }

          </div>
    )
}

export default PlaceDetail