import React from 'react'
import { getHCAHPSStars, getHaiStars } from '../utils';

const PlaceDetail = (props) => {
    const selectedPlace = props.selectedPlace
    const detailedExperienceMetrics = {
      "Nurse commication" : 5,
      "Durse commication" : 5,
      "Staff Responsiveness" : 3,
      "Medicine Communication" : 1,
      "Discharge Information" : 2
    }
    const detailedExperienceMetricStars = Object.keys(detailedExperienceMetrics).map((metricName)=>{
      const metricValue = detailedExperienceMetrics[metricName]
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
                selectedPlace['Infection Rating'] ?
                <div>
                  <div>
                    <b>Patient Summary:</b> <span style={{color:"#fdcc0d",}}>{getHCAHPSStars(selectedPlace['Summary'])}</span>
                  </div>
                  <div style={{marginLeft : 15}}>
                    {detailedExperienceMetricStars}
                  </div>
                </div> : <></>
              }
              {
                selectedPlace['hcahps relative mean'] ? <div>
                  <b>Experience: <span style={{color:"#fdcc0d"}}>{getHCAHPSStars(selectedPlace['hcahps relative mean'])}</span></b>
                </div> : <></>
              }
          </div>
    )
}

export default PlaceDetail