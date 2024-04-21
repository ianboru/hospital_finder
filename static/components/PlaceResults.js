import React, { useState, useContext } from 'react';
import { getHaiEmoji, getHCAHPSStars } from '../utils';
const PlaceResults = ({placesData, selectedPlace, setSelectedPlace}) => {
    console.log('placesData', placesData)
    const placeTileStyles = {
      "border" : "1px solid gray",
      "height" : "150px",
      "color" : "gray",
      "padding" : 10,
      "width" : "350px",
      cursor: 'pointer'
    }
    if(!selectedPlace){
        selectedPlace = {}
    }
    if (placesData.results && placesData.results.length){
      //sort by existence of cms metrics
      placesData.results = placesData.results.sort(function(left, right) {
        const leftHasCMSMetric = left['Infection Rating']||left['Infection Rating'] === 0||left['Summary star rating']||left['Summary star rating'] === 0
        const rightHasCMSMetric = right['Infection Rating']||right['Infection Rating'] === 0||right['Summary star rating']||right['Summary star rating'] === 0
        return leftHasCMSMetric ? -1 : rightHasCMSMetric ? 1 : 0
      });
    }
    const placeTiles = (placesData.results && placesData.results.length) > 0 ? 
      placesData.results.map((place, i)=>{
        const selectedPlaceStyle = {...placeTileStyles}
        if(place.name == selectedPlace.name){
          selectedPlaceStyle.border = "2px solid black"
        }
        return (
          <div style={selectedPlaceStyle} onClick={() => setSelectedPlace(place)}>
              <div style={{color : "black"}}><b>{place.name}</b></div>
              <div>{place.address}</div>
              <div>{place.phone_number}</div>
              <div>
                <b style={{ width: "100%", display: 'flex'}}>Infection Rating: 
                  <span style={{color:"#fdcc0d"}}>
                  {
                    getHaiEmoji(place['Infection Rating'], 3) 
                    ?  getHaiEmoji(place['Infection Rating'], 3) 
                    : <div style={{color: "#A8A8A8", fontStyle: 'italic', marginLeft: 3}}>No data available!</div> 
                  }
                  </span>
                </b>
              </div>
              <div>
                <b style={{ width: "100%", display: 'flex'}}>Patient Rating: 
                  <span style={{color:"#fdcc0d"}}>
                    {
                    getHCAHPSStars(place['Summary star rating']) == null || "☆☆☆☆☆"
                    ? <div style={{color: "#A8A8A8", fontStyle: 'italic', marginLeft: 3}}>No data available!</div> 
                    : getHCAHPSStars(place['Infection Rating'])
                    }
                  </span>
                </b>
              </div> 
          </div>
        )
      }) : <div style={{marginLeft: '1em'}}>No valid results</div>

    console.log('placeTiles', placeTiles)
    return (
      <div style={{width : "250px", marginRight : "15px"}}>
        {placeTiles}
      </div>
    )
  }

  export default PlaceResults;