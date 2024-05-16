import React, { useState, useContext } from 'react';
import { getHaiEmoji, getHCAHPSStars } from '../utils';

const PlaceResults = ({placesData, selectedPlace, setSelectedPlace, scrollToItemRef}) => {

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
      placesData.results = [...new Map(placesData.results.map(item => [item["Facility ID"], item])).values()]
      placesData.results = placesData.results.sort(function(left, right) {
        const leftHasCMSMetric = left['Infection Rating']||left['Infection Rating'] === 0||left['Summary star rating']||left['Summary star rating'] === 0
        const rightHasCMSMetric = right['Infection Rating']||right['Infection Rating'] === 0||right['Summary star rating']||right['Summary star rating'] === 0
        return leftHasCMSMetric ? -1 : rightHasCMSMetric ? 1 : 0
      });
    }
    console.log("re-rendering results")
    const placeTiles = (placesData.results && placesData.results.length) > 0 ? placesData.results.map((place, i)=>{
      const selectedPlaceStyle = {...placeTileStyles}
      if(place['Facility ID'] == selectedPlace['Facility ID']){
        selectedPlaceStyle.border = "2px solid black"
      }
      return (
        <div id={place['Facility ID']} style={selectedPlaceStyle} onClick={() => setSelectedPlace(place)} ref={(ref) => (scrollToItemRef.current[i] = ref)}>
            <div style={{color : "black"}}><b>{place.name}</b></div>
            <div>{place.address}</div>
            <div>{place.phone_number}</div>
            {
              place['Infection Rating']||place['Infection Rating'] === 0 ?
                <div>
                  <b>Infection Rating: <span style={{color:"#fdcc0d"}}>{getHaiEmoji(place['Infection Rating'],3)}</span></b>
                </div> : <></>
            }
            {
              place['Summary star rating']||place['Summary star rating'] === 0 ?
                <div>
                  <b>Patient Rating: <span style={{color:"#fdcc0d"}}>{getHCAHPSStars(place['Summary star rating'],5)}</span></b>
                </div> : <></>
            }
        </div>
      )
      //how am i structuring the data from the backend so i can do lookup by name on the FE
    }) : <div style={{marginLeft: '1em'}}>No valid results</div>

    return (
      <div style={{width : "250px", marginRight : "15px"}}>
        {placeTiles}
      </div>
    )
  }

  export default PlaceResults;