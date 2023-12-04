import ReactDOM from "react-dom"
import React, { Component } from 'react'
import { numberToRGB } from "./colorUtils";
import PlaceResults from "./components/PlaceResults";

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

function App() {

  const placesData = JSON.parse(document.getElementById("google_places_data").textContent)
  const [selectedPlace, setSelectedPlace] = React.useState(null)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o"
  })
  const Map = () => {
    const firstLocation = placesData.results[0].geometry.location
    const selectedPlaceCenter = {
      lat : selectedPlace ? selectedPlace.geometry.location.lat : null,
      lng : selectedPlace ? selectedPlace.geometry.location.lng : null
    }
    const firstLocationCenter = {lat : firstLocation.lat, lng : firstLocation.lng} //new google.maps.LatLng(parseFloat(firstLocation.lat),parseFloat(firstLocation.long))

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
          onClick={()=>{
            setSelectedPlace(place)
          }}
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

    return isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={selectedPlace ? selectedPlaceCenter : firstLocationCenter}
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
          <PlaceResults placesData={placesData} selectedPlace={selectedPlace} setSelectedPlace={setSelectedPlace}/>
        </div>
        {
          selectedPlace ?
          <div style={{border : 2, width : 150, marginRight : 15}}>
          <h3>Current Selection</h3>
          <div>{selectedPlace.name}</div>
          <div>{selectedPlace.formatted_address}</div>
          {
            selectedPlace.MRSA_SIR ? <div><b>MRSA SIR - {selectedPlace.MRSA_SIR}</b></div> : <></>
          }
        </div> : null
        }
        <Map/>
        
      </div>
      
    </div>
  );
}

ReactDOM.render(<App />,document.getElementById("root"))