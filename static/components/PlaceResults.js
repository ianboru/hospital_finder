import React, { useState, useContext } from 'react';
import { getHaiStars, getHCAHPSStars } from '../utils';
const PlaceResults = ({placesData, selectedPlace, setSelectedPlace}) => {
    console.log('placesData', placesData)
    const placeTileStyles = {
      "border" : "1px solid gray",
      "height" : "150px",
      "color" : "gray",
      "padding" : 10,
      "width" : "300px"
    }
    if(!selectedPlace){
        selectedPlace = {}
    }
    if ( placesData && placesData.results){
      //sort by existence of cms metrics
      placesData.results = placesData.results.sort(function(left, right) {
        const leftHasCMSMetric = left['Infection Rating']||left['Infection Rating'] === 0||left['Summary']||left['Summary'] === 0
        const rightHasCMSMetric = right['Infection Rating']||right['Infection Rating'] === 0||right['Summary']||right['Summary'] === 0
        return leftHasCMSMetric ? -1 : rightHasCMSMetric ? 1 : 0
      });
    }
    const placeTiles = placesData.results ? placesData.results.map((place, i)=>{
      const selectedPlaceStyle = {...placeTileStyles}
      if(place.name == selectedPlace.name){
        selectedPlaceStyle.border = "2px solid black"
      }
      return (
        <div style={selectedPlaceStyle} onClick={() => setSelectedPlace(place)}>
            <div style={{color : "black"}}><b>{place.name}</b></div>
            <div>{place.formatted_address}</div>
            <div>{place.phone_number}</div>
            {
              place['Infection Rating']||place['Infection Rating'] === 0 ?
                <div>
                  <b>Infection Rating: <span style={{color:"#fdcc0d"}}>{getHaiStars(place['Infection Rating'])}</span></b>
                </div> : <></>
            }
            {
              place['Summary']||place['Summary'] === 0 ?
                <div>
                  <b>Patient Rating: <span style={{color:"#fdcc0d"}}>{getHCAHPSStars(place['Summary'])}</span></b>
                </div> : <></>
            }
        </div>
      )
      //how am i structuring the data from the backend so i can do lookup by name on the FE
    }) : <></>

    return (
      <div style={{width : "250px", marginRight : "15px"}}>
        {placeTiles}
      </div>
    )
  }

  export default PlaceResults;