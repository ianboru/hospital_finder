import React, { useState, useContext } from 'react';
import { getHaiEmoji, getHCAHPSStars, addressToUrl, formatPhoneNumber} from '../utils';
import ViewOnGoogleMapsButton from './ViewOnGoogleMapsButton';
const PlaceResults = ({placesData, selectedPlace, setSelectedPlace, selectedCareType}) => {

    const placeTileStyles = {
      "borderTop": "1px solid #e0e0e0", // Light gray line at the top
      "borderBottom": "1px solid #e0e0e0", // Light gray line at the bottom
      "padding": "16px", // Spacing inside the tile
      "color": "#333", // Dark gray text color
      "backgroundColor": "white", // White background
      "width": "100%", // Full width
      "cursor": "pointer" // Pointer cursor on hover
    }
    if(!selectedPlace){
        selectedPlace = {}
    }
    if (placesData && placesData.length){
      //sort by existence of cms metrics
      //placesData = [...new Map(placesData.map(item => [item["Facility ID"], item])).values()] //fucking up rendering
      placesData = placesData.sort(function(left, right) {
        const leftHasCMSMetric = left['Infection Rating']||left['Infection Rating'] === 0||left['Summary star rating']||left['Summary star rating'] === 0
        const rightHasCMSMetric = right['Infection Rating']||right['Infection Rating'] === 0||right['Summary star rating']||right['Summary star rating'] === 0
        return leftHasCMSMetric ? -1 : rightHasCMSMetric ? 1 : 0
      });
    }
    console.log("re-rendering place results caretype:", selectedCareType)
    if(!selectedCareType){
      selectedCareType = "Hospital"
    }

    const placeTiles = (placesData && placesData.length) > 0 ? placesData.map((place, i)=>{
      const medianTimeTillDischarge = place["Average (median) time patients spent in the emergency department before leaving from the visit A lower number of minutes is better"]
      const selectedPlaceStyle = {...placeTileStyles}
      return (
        <div id={place['Facility ID']} style={selectedPlaceStyle} onClick={() => setSelectedPlace(place)}>
            <div style={{ color: "black", fontWeight: "bold", fontSize: "16px", fontFamily: "'Roboto', sans-serif", paddingTop : "10px", paddingBottom : "10px"}}>{place.name}</div>
            <div style={{ fontSize: "14px", fontFamily: "'Roboto', sans-serif", color: "#757575" }}>
              <div style={{ display: 'inline-block' }}>
                  {place.address}
              </div>
          </div>
          <div style={{ fontSize: "14px", fontFamily: "'Roboto', sans-serif", color: "#757575", marginTop: '5px' }}>
              <div style={{ display: 'inline-block' }}>
                  {formatPhoneNumber(place.phone_number)}
              </div>
          </div>
          <div style={{ fontSize: "14px", fontFamily: "'Roboto', sans-serif", color: "#757575", marginTop: '5px' }}>
              <div style={{ display: 'inline-block' }}> 
                  Distance {place.distance} 
              </div>
          </div>
          <ViewOnGoogleMapsButton url={addressToUrl(place.address[0])}/>

          {
            selectedCareType.includes('Hospital') && ( //for hospital facilities
              <>
            {
              place['Summary star rating'] && place['Summary star rating'] > 0 ?
                <div>
                  <b>Patient Rating: <span style={{color:"#fdcc0d", marginLeft:"auto"}}>{getHCAHPSStars(place['Summary star rating'],5)}</span></b>
                </div> : <></>
            }
            {
              place['Infection Rating'] && place['Infection Rating'] > 0 ?
                <div>
                  <b>Infection Rating: <span >{getHaiEmoji(place['Infection Rating'],3)}</span></b>
                </div> : <></>
            }
            </>
            )
          }
          {
            selectedCareType.includes('Outpatient') && ( //for outpatient facilites
              <>
            {
              place["Patients' rating of the facility linear mean score"] ?
                <div>
                  <b>Patient Rating: <span style={{color:"#fdcc0d"}}>{place["Patients' rating of the facility linear mean score"]}</span></b>
                </div> : <></>
            }
            {
              place['Patients who reported that staff definitely communicated about what to expect during and after the procedure'] && place['Patients who reported that staff definitely communicated about what to expect during and after the procedure'] > 0 ?
                <div>
                  <b>Communication: <span style={{color:"#fdcc0d"}}>{getHaiEmoji(place['Patients who reported that staff definitely communicated about what to expect during and after the procedure'],3)}</span></b>
                </div> : <></>
            }
            </>
            )
          } 
          {
            selectedCareType.includes('Nursing Homes') && ( //for outpatient facilites
              <>
            {
              place['Overall Rating'] && place['Overall Rating'] > 0 ?
                <div>
                  <b>Overall Rating: <span style={{color:"#fdcc0d"}}>{getHCAHPSStars(place['Overall Rating'],5)}</span></b>
                </div> : <></>
            }
            {
              place['Abuse Icon'] && place['Abuse Icon'] > 0 ?
                <div>
                  <b>Potential Abuse: <span style={{color:"#fdcc0d"}}>{getHaiEmoji(place['Abuse Icon'],3)}</span></b>
                </div> : <></>
            }
            </>
            )
          }
          {
            selectedCareType.includes('Hospice') && ( //for outpatient facilites
              <>
            {
                <div>
                  <b>Caregiver Rating: <span>{getHCAHPSStars(place['Family caregiver survey rating'],5)}</span></b>
                </div>
            }
            {
                <div>
                  <b>Symptoms Managed: <span>{getHCAHPSStars(place['The patient always got the help they needed for pain and symptoms'],3)}</span></b>
                </div>
            }
            </>
            )
          }
          {
            selectedCareType.includes('ED') && ( //for outpatient facilites
              <>
            {
                medianTimeTillDischarge ?
                <div>
                  <b>Median Arrival to Discharge: <span >{medianTimeTillDischarge}</span></b>
                </div> : <></>
            }
            {
              place['Left before being seen']  ?
                <div>
                  <b>Left before being seen: <span >{ place['Left before being seen'] }</span></b>
                </div> : <></>
            }
            </>
            )
          }
          {
            selectedCareType.includes('Home Health') && ( //for outpatient facilites
              <>
            {
                place["Star Rating for how patients rated overall care from agency"] ?
                <div>
                  <b>Patient Rating: <span style={{color:"#fdcc0d", marginLeft:"auto"}}>{getHCAHPSStars(place["Star Rating for how patients rated overall care from agency"])}</span></b>
                </div> : <></>
            }
            {
              place["Star Rating for health team communicated well with them"]  ?
                <div>
                  <b>Provider Communication: <span style={{color:"#fdcc0d", marginLeft:"auto"}}>{ getHCAHPSStars(place["Star Rating for health team communicated well with them"]) }</span></b>
                </div> : <></>
            }
            </>
            )
          }
        </div>
      )
      //how am i structuring the data from the backend so i can do lookup by name on the FE
    }) : <div style={{marginLeft: '1em'}}>No valid results</div>

    return (
      <div style={{
        width : "98%", 
        marginRight : "15px", 
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e0e0e0',
        marginBottom: '16px',
        alignItems: 'stretch'}}>
        {placeTiles}
      </div>
    )
  }

  export default PlaceResults;