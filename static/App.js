import ReactDOM from "react-dom"
import React, { Component } from 'react'
import { numberToRGB } from "./colorUtils";

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

function App() {

  const placesData = JSON.parse(document.getElementById("google_places_data").textContent)
  const [selectedPlace, setSelectedPlace] = React.useState({})
  const PlaceResults = () => {
    console.log('placesData', placesData)
    const placeTileStyles = {
      "border" : "1px solid gray",
      "height" : "40px"
    }
    const placeTiles = placesData.results.map((place, i)=>{
      const curPlaceStyle = {...placeTileStyles} 
      if(place.name == selectedPlace.name){
        curPlaceStyle.border = "2px solid black"
      }
      return (
        <div style={curPlaceStyle}> 
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

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o"
  })
  const Map = () => {
    
    const firstLocation = placesData.results[0].geometry.location
    const markers = placesData.results.map((place, index)=>{
      const location = place.geometry.location
      const latLng = {lat : location.lat, lng : location.lng} //new google.maps.LatLng(parseFloat(location.lat),parseFloat(location.long))
      console.log("place ?", place)
      console.log("between")
      console.log("mrsa", place.name, place.MRSA_SIR, numberToRGB(place.MRSA_SIR/3.5))
      return (
        <Marker 
          onLoad={(marker) => {
            console.log("loading ", place)
            const customIcon = (opts) => Object.assign({
              path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
              fillColor: place && place.MRSA_SIR ? numberToRGB(place.MRSA_SIR/3.5) : "rgb(128,128,128)",
              fillOpacity: 1,
              strokeColor: '#000',
              strokeWeight: 1,
              scale: 1,
            }, opts);

            marker.setIcon(customIcon({
              fillColor: place && place.MRSA_SIR ? numberToRGB(place.MRSA_SIR/3.5) : "rgb(128,128,128)",
              strokeColor: 'white'
            }));
          }}
          position={latLng} 
          onClick={()=>{setSelectedPlace(place)}}
        />
      )
    })
    
    const { isLoaded } = useJsApiLoader({
      id: 'google-map-script',
      googleMapsApiKey: "AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o"
    })
    const containerStyle = {
      width: '400px',
      height: '400px'
    };
    const [map, setMap] = React.useState(null)

    const onLoad = React.useCallback(function callback(map) {
      // This is just an example of getting and using the map instance!!! don't just blindly copy!
      
      map.setZoom(10)
      setMap(map)
    }, [])
  
    const onUnmount = React.useCallback(function callback(map) {
      setMap(null)
    }, [])

    
    const center = {lat : firstLocation.lat, lng : firstLocation.lng} //new google.maps.LatLng(parseFloat(firstLocation.lat),parseFloat(firstLocation.long))
    return isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={.75}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          { markers }
          <></>
        </GoogleMap>
    ) : <></>
  }
  const outerStyles = {
    display : "flex",
    alignContent : "flex-start"
  }
  console.log('selectedPlace', selectedPlace)
  return (
    <div className="App">
      
      
      <div style={outerStyles}>
        <div>
          <h1>Map results</h1>
          <PlaceResults style={{"margin-right" : 15}}/>
        </div>
        <div style={{border : 2, width : 150, marginRight : 15}}>
          <h3>Current Selection</h3>
          <div>{selectedPlace.name}</div>
          <div>{selectedPlace.formatted_address}</div>
          {
            selectedPlace.MRSA_SIR ? <div><b>MRSA SIR - {selectedPlace.MRSA_SIR}</b></div> : <></>
          }
        </div>
        <Map/>
        
      </div>
      
    </div>
  );
}

ReactDOM.render(<App />,document.getElementById("root"))