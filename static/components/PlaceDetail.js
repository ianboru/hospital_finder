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
        <div style={{marginTop : 5, marginBottom: 5, display: "flex", justifyContent: "space-between",}}>
          <b>{metricLabel}</b>
          <span style={{color: "gold"}}>{getHCAHPSStars(metricValue)}</span> 
        </div>
      )
    })

    const closePlaceDetail = () => {
      props.setSelectedPlace(null)
    }
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
        <div style={{marginTop : 5, marginBottom: 5, display: "flex", justifyContent: "space-between"}}>
          <b>{metricLabel}</b> 
          <span style={{color: "gold"}}>{getHaiEmoji(metricValue,2)}</span> 
        </div>
      )
    })

    const metricDivStyle = {marginLeft : 15, marginTop: "4px"}
    const ratingDivStyle = {display: "flex", justifyContent: "space-between", marginTop: "1em"}

    const addressToUrl = (address) => {
      const urlAddress = address.replace(/\,/g, '');
      const url = urlAddress.replace(/\ /g, '%20');
      return  `http://maps.google.com/maps?q=${url}`
    }
    const googleMapsUrl = addressToUrl(selectedPlace.address)
    return(
        <div style={{border : 2, borderColor : 'black', width : 400, marginRight : 10, marginLeft : 10, marginBottom: 15}}>
            <div onClick={closePlaceDetail} style={{
              display : 'flex', 
              justifyContent : 'flex-end', 
              cursor :'pointer',
              fontSize : 16, 
              color: 'gray'
            }}>
              <span>x</span>
            </div>
            <div style={{
              fontSize : 16, marginBottom : 15, fontWeight : 'bold',
              color : 'gray'
            }}>Current Selection</div>
            <div><b>{selectedPlace.name}</b></div>
            <div>{selectedPlace.address}</div>
            <a href={googleMapsUrl} target="_blank">view on Google Maps</a>
            {
              selectedPlace['Summary star rating'] ?
              <>
                <div style={ratingDivStyle}>
                  <b>Patient Rating:</b>
                  <span style={{color:"#fdcc0d"}}>{getHCAHPSStars(selectedPlace['Summary star rating'])}</span>
                </div>
                <hr style={{marginTop: "0px"}}/>
                <div style={metricDivStyle}>
                  {detailedExperienceMetricStars}
                </div>
              </> : <></>
            }
            {
              selectedPlace['Infection Rating'] ?
              <>
                <div style={ratingDivStyle}>
                  <b>Infection Rating:</b> 
                  <span style={{color:"#fdcc0d",}}>{getHaiEmoji(selectedPlace['Infection Rating'],3)}</span>
                </div>
                <hr style={{marginTop: "0px"}}/>
                <div  style={metricDivStyle}>
                  {detailedInfectionMetricStars}
                </div>
              </> : <></>
            }
       </div>
    )
}

export default PlaceDetail