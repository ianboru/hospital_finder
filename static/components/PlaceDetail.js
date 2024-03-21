import React from 'react'
import { getHCAHPSStars, getHaiEmoji } from '../utils';

const PlaceDetail = (props) => {
    const selectedPlace = props.selectedPlace

    // Map patient rating metrics to their respective labels
    const detailedExperienceMetricsMap = {
      "Nurse communication - star rating" : "Nurse communication",
      "Doctor communication - star rating" : "Doctor communication",
      "Staff responsiveness - star rating" : "Staff responsiveness",
      "Communication about medicines - star rating" : "Medicine communication",
      "Discharge information - star raing" : "Discharge information",
      "Care transition - star rating" : "Care transition",
      "Cleanliness - star rating" : "Cleanliness",
      "Quietness - star rating" : "Quietness",
    }

    const detailedExperienceMetricStars = Object.keys(detailedExperienceMetricsMap).map((metricName)=>{
      const metricValue = selectedPlace[metricName]
      const metricLabel = detailedExperienceMetricsMap[metricName]
      return(
        <div style={{marginTop : 5, marginBottom: 5}}><b style={{alignSelf : "flex-start"}}>{metricLabel}</b> <span style={{color: "gold",alignSelf : "flex-end"}}>{getHCAHPSStars(metricValue)}</span> </div>
      )
    })
    console.log("Patient stars", detailedExperienceMetricStars)

    // Map infection rating metrics to their respective labels
    const detailedInfectionMetricsMap = {
      "Central Line Associated Bloodstream Infection (ICU + select Wards) Compared to National" : "CLBAI",
      "Catheter Associated Urinary Tract Infections (ICU + select Wards) Compared to National" : "CAUTI",
      "SSI - Abdominal Hysterectomy Compared to National" : "SSI Abdominal Hysterectomy",
      "SSI - Colon Surgery Compared to National" : "SSI Colon Surgery",
      "MRSA Bacteremia Compared to National" : "MRSA Bacteremia",
      "Clostridium Difficile (C.Diff) Compared to National" : "C.Diff"
    }

    const detailedInfectionMetricStars = Object.keys(detailedInfectionMetricsMap).map((metricName)=>{
      const metricValue = selectedPlace[metricName]
      const metricLabel = detailedInfectionMetricsMap[metricName]
      return(
        <div style={{marginTop : 5, marginBottom: 5}}><b style={{alignSelf : "flex-start"}}>{metricLabel}</b> <span style={{color: "gold",alignSelf : "flex-end"}}>{getHaiEmoji(metricValue,3)}</span> </div>
      )
    })

    console.log("Infection stars", detailedInfectionMetricStars)
    return(
        <div style={{border : 2, borderColor : 'black', width : 400, marginRight : 10, marginLeft : 10}}>
            <h3>Current Selection</h3>
            <div><b>{selectedPlace.name}</b></div>
            <div>{selectedPlace.address}</div>
            {
              selectedPlace['Summary star rating'] ?
              <div>
                <div>
                  <b>Patient Rating: <span style={{color:"#fdcc0d"}}>{getHCAHPSStars(selectedPlace['Summary star rating'])}</span></b>
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
                  <b>Infection Rating:</b> <span style={{color:"#fdcc0d",}}>{getHaiEmoji(selectedPlace['Infection Rating'])}</span>
                </div>
                <div style={{marginLeft : 15}}>
                  {detailedInfectionMetricStars}
                </div>
              </div> : <></>
            }
       </div>
    )
}

export default PlaceDetail