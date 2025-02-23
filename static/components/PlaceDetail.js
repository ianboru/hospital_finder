import React from 'react'
import { getHCAHPSStars, getHaiEmoji, addressToUrl} from '../utils';
const PlaceDetail = (props) => {
    const selectedPlace = props.selectedPlace
    const metricQuantiles = props.metricQuantiles
    let selectedCareType = props.selectedCareType
    selectedCareType = selectedCareType||"Hospital"
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
      "Central Line Associated Bloodstream Infection" : "CLABSI",
      "Catheter Associated Urinary Tract Infections" : "CAUTI",
      "SSI - Abdominal Hysterectomy" : "SSI Abdominal Hysterectomy",
      "SSI - Colon Surgery" : "SSI Colon Surgery",
      "MRSA Bacteremia" : "MRSA Bacteremia",
      "Clostridium Difficile (C.Diff)" : "C.Diff"
    }

    const detailedInfectionMetricStars = Object.keys(detailedInfectionMetricsMap).map((metricName)=>{
      const metricValue = selectedPlace[metricName]
      const metricLabel = detailedInfectionMetricsMap[metricName]
      const dataDictionaryEntry = dataDictionary[metricName.toLowerCase()]
      console.log("infection metric", metricName.toLowerCase())
      return(
        <div style={{marginTop : 5, marginBottom: 5, display: "flex", justifyContent: "space-around"}}>
          <span style={{cursor: "pointer",}} onClick={
            ()=>{
              props.setShownDefinition(metricName.toLowerCase())
            }}
          >{dataDictionaryEntry ? '\u24D8' : ''}</span>
          
          <b style={{marginRight : 'auto', marginLeft : "5px", marginTop : "auto", marginBottom : "auto"}}>{metricLabel}</b> 
          <span style={{marginLeft : 'auto', color: "  "}}>{metricValue ? getHaiEmoji(metricValue,2) : "No Data"}</span> 
        </div>  
      )
    })

    const metricDivStyle = {marginLeft : 15, marginTop: "4px"}
    const ratingDivStyle = {display: "flex", justifyContent: "space-between", marginTop: "1em"}


    
    const googleMapsUrl = addressToUrl(selectedPlace.address[0])
    const nonMetricKeys = [
      "id","Facility ID", "Facility Name", "address", "Address", "caretype", "name","location", 
      "City/Town", "ZIP Code", "Care Type", "Mean SIR", "Infection Rating", "Mean Compared to National"
    ]
    //console.log(selectedPlace.name, dataDictionary[key.toLowerCase()]["Care Type"], selectedCareType)
    const detailMetrics = Object.keys(selectedPlace).filter( (key) => {

      const careTypesString = dataDictionary[key.toLowerCase()] ? dataDictionary[key.toLowerCase()]["care_types"].join(",") : ""
      const matchesSelectedCareType = dataDictionary[key.toLowerCase()] && careTypesString.includes(selectedCareType)
        return(
          !nonMetricKeys.includes(key) && !detailedInfectionMetricsMap[key] && matchesSelectedCareType
        )
    }).map((key)=>{
      const dataDictionaryEntry = dataDictionary[key.toLowerCase()]
      let metricValue = selectedPlace[key]
      if (metricValue === "N") {
        metricValue = "N";
      } else if (metricValue === "Y") {
        metricValue = "Y";
      } else if (metricValue === "Not Available"||metricValue === "Not Applicable") {
        metricValue = "No Data";
      } else if (typeof metricValue === "number" && isNaN(metricValue)) {
        metricValue = "No Data";
      } else {
      }
      const useStars = dataDictionaryEntry["unit"] && dataDictionaryEntry["unit"].includes("Stars") && metricValue <= 5
      const useEmojis = dataDictionaryEntry["unit"] && dataDictionaryEntry["unit"].includes("Emojis")
      const qualitativeMetric = dataDictionaryEntry["unit"] && dataDictionaryEntry["unit"].includes("High")
      const unitSuffix = dataDictionaryEntry["unit"] 
        && dataDictionaryEntry["unit"].includes("Minutes") ? " min" : 
           dataDictionaryEntry["unit"].includes("Percent") ? "%" : "" 
      const emojiContent = ":P"
      if(useEmojis && qualitativeMetric){
        emojiContent = getQualitativeEmoji(metricValue)
      }
      const showSuffix = (typeof metricValue == "string" && !metricValue.includes("Not"))|| typeof metricValue != "string"
      console.log(unitSuffix, key , showSuffix, metricValue, typeof metricValue,  )
      return (
        <div>
            <div style={{marginTop : 5, marginBottom: 5, display: "flex",justifyContent: "space-around"}}>
              <span style={{cursor: "pointer",}} onClick={()=>{
                props.setShownDefinition(key.toLowerCase())
              }}>{dataDictionaryEntry ? '\u24D8' : ''}</span>
              <span style={{marginLeft : "10px", marginTop : "auto", marginBottom : "auto"}}><b>{dataDictionaryEntry ? dataDictionaryEntry.term : key}</b> </span>
              {
                useStars ? 
                <span style={{color: "gold", marginLeft : "auto"}}>{metricValue ? getHCAHPSStars(metricValue) : "No Data"}</span> :
                <span style={{color: "black", marginLeft : "auto", marginTop : "auto", marginBottom : "auto"}}>
                  {useEmojis ? emojiContent : ""}
                  {metricValue}{ showSuffix ? unitSuffix : ""}
                </span> 
              }
            </div>
        </div>
      )
    })
    
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
              detailMetrics && Object.keys(detailMetrics).length > 0 ?
              <>
                <div style={ratingDivStyle}>
                  <b>Patient Rating:</b>
                  <span style={{color:"#fdcc0d"}}>{getHCAHPSStars(selectedPlace['Summary star rating']||selectedCareType['Overall Rating'])}</span>
                </div>
                <hr style={{marginTop: "0px"}}/>
                <div style={metricDivStyle}>
                  {detailMetrics}
                </div>
              </> : <></>
            }
            {
              selectedPlace['Infection Rating'] && ["Hospital", "ED"].includes(selectedCareType)?
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