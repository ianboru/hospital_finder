import React, { useState, useContext } from 'react';
import { getHaiStars, getHCAHPSStars } from '../utils';
const PlaceResults = ({placesData, selectedPlace, setSelectedPlace}) => {
    console.log('placesData', placesData)
    const placeTileStyles = {
      "border" : "1px solid gray",
      "height" : "150px",
      "color" : "gray",
      "padding" : 10,
      "width" : "200px"
    }
    if(!selectedPlace){
        selectedPlace = {}
    }
    if ( placesData && placesData.results){
      //sort by existence of cms metrics 
      placesData.results = placesData.results.sort(function(left, right) {
        const leftHasCMSMetric = left['hai relative mean']||left['hai relative mean'] === 0||left['hcahps relative mean']||left['hcahps relative mean'] === 0
        const rightHasCMSMetric = right['hai relative mean']||right['hai relative mean'] === 0||right['hcahps relative mean']||right['hcahps relative mean'] === 0
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
              place['hai relative mean']||place['hai relative mean'] === 0 ? 
                <div>
                  <b>Safety: <span style={{color:"#fdcc0d"}}>{getHaiStars(place['hai relative mean'])}</span></b>
                </div> : <></>
            }
            {
              place['hcahps relative mean']||place['hcahps relative mean'] === 0 ? 
                <div>
                  <b>Experience: <span style={{color:"#fdcc0d"}}>{getHCAHPSStars(place['hcahps relative mean'])}</span></b>
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