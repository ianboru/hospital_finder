import ReactDOM from "react-dom"
import React, { Component } from 'react'
import { numberToRGB } from "./colorUtils";
import PlaceResults from "./components/PlaceResults";

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { getHCAHPSStars, getHaiStars } from './utils';

function App() {

  const placesData = JSON.parse(document.getElementById("google_places_data").textContent)
  const [selectedPlace, setSelectedPlace] = React.useState(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o"
  })
  const onSearchInputChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const onSearchSubmit = () => {
    let url = new URL(window.location.origin + window.location.pathname)
    url.searchParams.set("search", searchTerm)
    console.log("searching", searchTerm)
    const urlParams = new URLSearchParams(window.location.search)
    window.location.href = url
  }

  const Map = () => {
    console.log("loading map", placesData)
    const firstLocation = placesData.results[0].geometry.location
    const firstLocationCenter = {lat : firstLocation.lat, lng : firstLocation.lng} //new google.maps.LatLng(parseFloat(firstLocation.lat),parseFloat(firstLocation.long))

    const selectedPlaceCenter = {
      lat : selectedPlace ? selectedPlace.geometry.location.lat : null,
      lng : selectedPlace ? selectedPlace.geometry.location.lng : null
    }

    const markers = placesData.results.map((place, index)=>{
      const location = place.geometry.location
      const latLng = {lat : location.lat, lng : location.lng} //new google.maps.LatLng(parseFloat(location.lat),parseFloat(location.long))
      if(place['hai relative mean'] || place['hcahps relative mean']) {
        console.log("place",place)
      }
      return (
        <Marker 
          onLoad={(marker) => {
            const customIcon = (opts) => Object.assign({
              path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
              fillColor: place && place['hai relative mean'] ? numberToRGB(place['hai relative mean'],1,3) : "rgb(128,128,128)",
              fillOpacity: 1,
              strokeColor: '#000',
              strokeWeight: 1,
              scale: 1,
            }, opts);

            marker.setIcon(customIcon({
              fillColor: place && place['hai relative mean'] ? numberToRGB(place['hai relative mean'],1,3) : "rgb(128,128,128)",
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
    const mapContainerStyle = {
      margin : "auto",
      width: "100%",
      height: "100%"
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
        <div style={{width : "1000px", height : "1000px"}}>
            <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={selectedPlace ? selectedPlaceCenter : firstLocationCenter}
            zoom={.75}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            { markers }
            <></>
          </GoogleMap>
        </div>
    ) : <></>
  }
  const outerStyles = {
    display : "flex",
    alignContent : "flex-start"
  }
  console.log('places ', placesData)
  const hasPlaceResults = placesData.results && placesData.results.length > 0
  return (
    <div className="App">
      <div>
        <input value={searchTerm} onChange={onSearchInputChange} />
        <button onClick={onSearchSubmit}>Search</button>
      </div>
      <div style={outerStyles}>
        {
          hasPlaceResults ? <div style={{maxHeight : '500px', overflowY : 'scroll'}}>
            <h1>Map results</h1>
            <PlaceResults placesData={placesData} selectedPlace={selectedPlace} setSelectedPlace={setSelectedPlace}/>
          </div> : <></>
        }
        
        {
          selectedPlace ?
          <div style={{border : 2, width : 150, marginRight : 15, marginLeft : 15}}>
            <h3>Current Selection</h3>
            <div>{selectedPlace.name}</div>
            <div>{selectedPlace.formatted_address}</div>
            {
                selectedPlace['hai relative mean'] ? <div><b>Safety: {getHaiStars(selectedPlace['hai relative mean'])}</b></div> : <></>
              }
              {
                selectedPlace['hai relative mean'] ? <div><b>Experience: {getHCAHPSStars(selectedPlace['hcahps relative mean'])}</b></div> : <></>
              }
          </div> : null
        }
        {
          hasPlaceResults ? <Map/> : <></>
        }
        
      </div>
      
    </div>
  );
}

ReactDOM.render(<App />,document.getElementById("root"))