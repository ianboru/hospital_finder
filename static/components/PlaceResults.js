import React, { useState, useContext } from 'react';
import { getHaiEmoji, getHCAHPSStars } from '../utils';
const PlaceResults = ({placesData, selectedPlace, setSelectedPlace}) => {

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
    console.log("re-rendering results")
    const placeTiles = (placesData && placesData.length) > 0 ? placesData.map((place, i)=>{
      const selectedPlaceStyle = {...placeTileStyles}
      return (
        <div id={place['Facility ID']} style={selectedPlaceStyle} onClick={() => setSelectedPlace(place)}>
            <div style={{ color: "black", fontWeight: "bold", fontSize: "16px", fontFamily: "'Roboto', sans-serif", paddingTop : "10px", paddingBottom : "10px"}}>{place.name}</div>
            <div style={{ fontSize: "14px", fontFamily: "'Roboto', sans-serif", color: "#757575" }}>
              <div style={{ display: 'inline-block' }}> 
                  {place.caretype} 
              </div>
              <span style={{ margin: '0 4px', fontSize: "20px", lineHeight: "14px", verticalAlign: "middle" }}>·</span>
              <div style={{ display: 'inline-block' }}>
                  {place.address}
              </div>
          </div>
          <div style={{ fontSize: "14px", fontFamily: "'Roboto', sans-serif", color: "#757575", marginTop: '5px' }}>
              <div style={{ display: 'inline-block' }}> 
                  Hours of operation {place.hoursofoperation} 
              </div>
              <span style={{ margin: '0 4px', fontSize: "20px", lineHeight: "14px", verticalAlign: "middle"}}>·</span>
              <div style={{ display: 'inline-block' }}>
                  Phone Number {place.phone_number}
              </div>
          </div>
          <div style={{ fontSize: "14px", fontFamily: "'Roboto', sans-serif", color: "#757575", marginTop: '5px' }}>
              <div style={{ display: 'inline-block' }}> 
                  Distance {place.distance} 
              </div>
              <span style={{ margin: '0 4px', fontSize: "20px", lineHeight: "14px", verticalAlign: "middle" }}>·</span>
              <div style={{ display: 'inline-block' }}>
                  Time to Drive {place.timetodrive}
              </div>
          </div>
            {
              //adjust && to || and > to === if you want metrics to show even if 0
              place['Infection Rating']&&place['Infection Rating'] > 0 ?
                <div>
                  <b>Infection Rating: <span style={{color:"#fdcc0d"}}>{getHaiEmoji(place['Infection Rating'],3)}</span></b>
                </div> : <></>
            }
            {
              place['Summary star rating']&&place['Summary star rating'] > 0 ?
                <div>
                  <b>Patient Rating: <span style={{color:"#fdcc0d"}}>{getHCAHPSStars(place['Summary star rating'],5)}</span></b>
                </div> : <></>
            }
            {
              place['Doctor communication - star rating']&&place['Doctor communication - star rating'] > 0 ?
                <div>
                  <b>Doctor Communication: <span style={{color:"#fdcc0d"}}>{getHCAHPSStars(place['Doctor communication - star rating'],5)}</span></b>
                </div> : <></>
            }
            {
              place['Communication about medicines - star rating']&&place['Communication about medicines - star rating'] > 0 ?
                <div>
                  <b>Medicine Communication: <span style={{color:"#fdcc0d"}}>{getHCAHPSStars(place['Communication about medicines - star rating'],5)}</span></b>
                </div> : <></>
            }
            {
              place['Nurse communication - star rating']&&place['Nurse communication - star rating'] > 0 ?
                <div>
                  <b>Nurse Communication: <span style={{color:"#fdcc0d"}}>{getHCAHPSStars(place['Nurse communication - star rating'],5)}</span></b>
                </div> : <></>
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