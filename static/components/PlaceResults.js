import React, { useState, useContext } from 'react';
import { getHaiStars } from '../utils';
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
    const placeTiles = placesData.results.map((place, i)=>{
      const selectedPlaceStyle = {...placeTileStyles} 
      if(place.name == selectedPlace.name){
        selectedPlaceStyle.border = "2px solid black"
      }

      const haiStars = getHaiStars(place['hai relative mean'])
      return (
        <div style={selectedPlaceStyle} onClick={() => setSelectedPlace(place)}> 
            <div style={{color : "black"}}><b>{place.name}</b></div>
            <div>{place.formatted_address}</div>
            <div>{place.phone_number}</div>
            {
              place['hai relative mean'] ? <div><b>Safety: {haiStars}</b></div> : <></>
            }
            {
              place['hai relative mean'] ? <div><b>Experience: {place['hcahps relative mean']}</b></div> : <></>
            }
        </div>
      )
      //how am i structuring the data from the backend so i can do lookup by name on the FE
    })

    return (
      <div style={{width : "250px", marginRight : "15px"}}>
        {placeTiles}
      </div>
    )
  }

  export default PlaceResults;