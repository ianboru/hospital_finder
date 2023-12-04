import React, { useState, useContext } from 'react';

const PlaceResults = ({placesData, selectedPlace, setSelectedPlace}) => {
    console.log('placesData', placesData)
    const placeTileStyles = {
      "border" : "1px solid gray",
      "height" : "40px"
    }
    if(!selectedPlace){
        selectedPlace = {}
    }
    const placeTiles = placesData.results.map((place, i)=>{
      const curPlaceStyle = {...placeTileStyles} 
      if(place.name == selectedPlace.name){
        curPlaceStyle.border = "2px solid black"
      }
      return (
        <div style={curPlaceStyle} onClick={() => setSelectedPlace(place)}> 
            <div>{place.name}</div>
            {
              place.MRSA_SIR ? <div><b>MRSA SIR - {place.MRSA_SIR}</b></div> : <></>
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