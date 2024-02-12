import React from 'react'
import { getHCAHPSStars, getHaiEmoji } from '../utils'
import StarMetric from "./StarMetric"

const PlaceDetail = (props) => {
    const selectedPlace = props.selectedPlace

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
    
    return(
        <div style={{border : 2, borderColor : 'black', width : 400, marginRight : 10, marginLeft : 10}}>
            <h3>Current Selection</h3>
            <div>{selectedPlace.name}</div>
            <div>{selectedPlace.formatted_address}</div>
            {
              selectedPlace['Summary star rating'] ?
              <div>
                <div>
                  <b>Patient Rating: <span style={{color:"#fdcc0d"}}>{getHCAHPSStars(selectedPlace['Summary star rating'])}</span></b>
                </div>
                <StarMetric selectedPlace={selectedPlace}/>
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