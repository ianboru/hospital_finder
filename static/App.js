import ReactDOM from "react-dom"
import React, { Component } from 'react'


import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

function App() {

  const placesData = JSON.parse(document.getElementById("google_places_data").textContent)

  const renderPlaceResults = () => {
    return placesData.results.map((place)=>{
      return (
        <div>Name: {place.name}</div>
      )
    })
  }

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o"
  })
  const Map = () => {
    
    const firstLocation = placesData.results[0].geometry.location
    const markers = placesData.results.map((place)=>{
      const location = place.geometry.location
      const latLng = {lat : location.lat, lng : location.lng} //new google.maps.LatLng(parseFloat(location.lat),parseFloat(location.long))
      return (
        <Marker position={latLng} />
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

    
    console.log("first local", firstLocation)
    const center = {lat : firstLocation.lat, lng : firstLocation.lng} //new google.maps.LatLng(parseFloat(firstLocation.lat),parseFloat(firstLocation.long))
    return isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={1}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          { markers }
          <></>
        </GoogleMap>
    ) : <></>
  }

  return (
    <div className="App">
      <h1>Map results</h1>
      <Map/>// Map with a Marker

      {renderPlaceResults()}
    </div>
  );
}

ReactDOM.render(<App />,document.getElementById("root"))