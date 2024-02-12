import React from 'react'
import { getHCAHPSStars, getHaiEmoji } from '../utils';

const StarMetric = ({selectedPlace}) => {
    
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
          <div style={{marginTop : 5, marginBottom: 5}}>
            <b style={{alignSelf : "flex-start"}}>
              {metricLabel}
            </b> 
            <span style={{color: "gold",alignSelf : "flex-end"}}>
              {getHCAHPSStars(metricValue)}
            </span> 
          </div>
        )
      })

    console.log("Patient stars", detailedExperienceMetricStars)

      return(
        <div style={{marginLeft : 15}}>
            {detailedExperienceMetricStars}
        </div>
      )
}

export default StarMetric