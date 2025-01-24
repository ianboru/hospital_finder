import React from 'react'
import { getHCAHPSStars, getHaiEmoji } from '../utils';
const PlaceDetail = (props) => {
    const selectedPlace = props.selectedPlace
    const metricQuantiles = props.metricQuantiles
    const selectedCareType = props.selectedCareType
    const dataDictionary = props.dataDictionary
    // Map patient rating metrics to their respective labels
    const detailedExperienceMetricsMap = {
      "Staff responsiveness - star rating" : "Staff responsiveness",
      "Discharge information - star raing" : "Discharge information",
      "Care transition - star rating" : "Care transition",
      "Cleanliness - star rating" : "Cleanliness",
      "Quietness - star rating" : "Quietness",
      "Facilities and staff linear mean score" : "Patient Rating",
      "Patients who reported that staff definitely communicated about what to expect during and after the procedure" : "Communication",
    }

    const closePlaceDetail = () => {
      props.setSelectedPlace(null)
    }
    const getQualitativeEmoji = (value) => {
      switch(value) {
        case "High":
          // code block
          return ":/";
        case "Very High":
          // code block
          return "://";
        default:
          return ":)"
      }
    }
    // Map infection rating metrics to their respective labels
    const detailedInfectionMetricsMap = {
      "Central Line Associated Bloodstream Infection" : "CLBAI",
      "Catheter Associated Urinary Tract Infections" : "CAUTI",
      "SSI - Abdominal Hysterectomy" : "SSI Abdominal Hysterectomy",
      "SSI - Colon Surgery" : "SSI Colon Surgery",
      "MRSA Bacteremia" : "MRSA Bacteremia",
      "Clostridium Difficile (C.Diff)" : "C.Diff"
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
      console.log("url convert",address)
      const urlAddress = address.replace(/\,/g, '');
      const url = urlAddress.replace(/\ /g, '%20');
      return  `http://maps.google.com/maps?q=${url}`
    }
    console.log("current seelcted place", selectedPlace)

    
    const googleMapsUrl = addressToUrl(selectedPlace.address[0])
    const nonMetricKeys = [
      "id","Facility ID", "Facility Name", "address", "Address", "caretype", "name","location", 
      "City/Town", "ZIP Code", "Care Type", "Mean SIR", "Infection Rating", "Mean Compared to National"
    ]
    //console.log(selectedPlace.name, dataDictionary[key.toLowerCase()]["Care Type"], selectedCareType)
    const detailMetrics = Object.keys(selectedPlace).filter( (key) => {
      //console.log("data dict entry", key, dataDictionary[key.toLowerCase()])
      const matchesSelectedCareType = dataDictionary[key.toLowerCase()] && dataDictionary[key.toLowerCase()]["Care Type"] == selectedCareType
        return(
          !nonMetricKeys.includes(key) && !detailedInfectionMetricsMap[key] && matchesSelectedCareType
        )
    }).map((key)=>{
      const dataDictionaryEntry = dataDictionary[key.toLowerCase()]
      const metricValue = selectedPlace[key]
      const useStars = dataDictionaryEntry["unit"].includes("Stars")
      const useEmojis = dataDictionaryEntry["unit"].includes("Emojis")
      const qualitativeMetric = dataDictionaryEntry["unit"].includes("High")
      const emojiContent = ":P"
      if(useEmojis && qualitativeMetric){
        emojiContent = getQualitativeEmoji(metricValue)
      }
      console.log("just change seomthing")
      console.log("stars",useStars, useEmojis, selectedPlace[key], key, metricValue)
      return (
        <div>
            <div style={{marginTop : 5, marginBottom: 5, display: "flex", justifyContent: "space-between"}}>
              <span style={{cursor: "pointer"}} onClick={()=>{
                props.setShownDefinition(key.toLowerCase())
              }}>{dataDictionaryEntry ? '\u24D8' : ''}</span>
              <b>{dataDictionaryEntry ? dataDictionaryEntry.term : key}</b> 
              {
                useStars ? 
                <span style={{color: "gold"}}>{getHCAHPSStars(metricValue)}</span> :
                <span style={{color: "black"}}>
                  {useEmojis ? emojiContent : ""}
                  {metricValue}
                </span> 
              }
            </div>
        </div>
      )
    })
    console.log("shiowing definition")
    
    console.log("detail ", detailMetrics)
    return(
        <div style={{
          border : 2, 
          borderColor : 'black', 
          width : 400, 
          marginRight : 10,
          marginLeft : 10, 
          marginBottom: 15,
          zIndex : 50,
         
        }}>
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
                  {detailMetrics}
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