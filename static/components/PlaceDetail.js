import React from 'react'
import { getHCAHPSStars, getHaiEmoji } from '../utils'
import StarRatingStyle from './StarRatingStyle'

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
      console.log('metricLabel', metricLabel, 'metricValue', metricValue, ) 
      return(
        <div style={{marginTop : 5, marginBottom: 5}}>
          <StarRatingStyle 
            metricLabel={metricLabel}  
            metricRatingFunction={() => getHCAHPSStars(metricValue)}
            bTagStyle={{alignSelf : "flex-start"}} 
          />
        </div>
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
        <div style={{marginTop : 5, marginBottom: 5}}>
          <StarRatingStyle 
            metricLabel={metricLabel}  
            metricRatingFunction={() => getHaiEmoji(metricValue,3)}
            bTagStyle={{alignSelf : "flex-start"}} 
          />
        </div>
      )
    })

    console.log("Infection stars", detailedInfectionMetricStars)
    return(
        <div style={{border : 2, borderColor : 'black', width : 400, marginRight : 10, marginLeft : 10}}>
            <h3>Current Selection</h3>
            <div>{selectedPlace.name}</div>
            <div>{selectedPlace.formatted_address}</div>
            {
              selectedPlace['Summary star rating'] ?
              <div>
                <StarRatingStyle 
                  metricLabel={'Patient Rating: '}  
                  metricRatingFunction={() => getHCAHPSStars(selectedPlace['Summary star rating'])}
                />
                <div style={{marginLeft : 15}}>
                  {detailedExperienceMetricStars}
                </div>
              </div> : <></>
            }
            {
              selectedPlace['Infection Rating'] ?
              <div>
                <StarRatingStyle 
                  metricLabel={'Infection Rating: '}  
                  metricRatingFunction={() => getHaiEmoji(selectedPlace['Infection Rating'])}
                />
                <div style={{marginLeft : 15}}>
                  {detailedInfectionMetricStars}
                </div>
              </div> : <></>
            }
       </div>
    )
}

export default PlaceDetail