import ReactDOM from "react-dom"
import React, { Component } from 'react'
import { numberToRGB } from "./colorUtils";
import PlaceResults from "./components/PlaceResults";

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { getHCAHPSStars, getHaiStars } from './utils';

function App() {

  const placesData = JSON.parse(document.getElementById("google_places_data").textContent)
  const metricRanges = JSON.parse(document.getElementById("metric_ranges").textContent)

  const [selectedPlace, setSelectedPlace] = React.useState(null)
  let url = new URL(window.location)
  const initialSearchParam = url.searchParams.get("search")
  const initialLocationParam = url.searchParams.get("location")
  const initialLocationSplit = initialLocationParam ? initialLocationParam.split(",") : []
  const initialLocation = initialLocationSplit ?  {"lng" : parseFloat(initialLocationSplit[0]), "lat" : parseFloat(initialLocationSplit[1])} : {}
  console.log("initial",  url.searchParams, initialSearchParam)
  const [searchTerm, setSearchTerm] = React.useState(initialSearchParam ? initialSearchParam : "")

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyD2Rq696ITlGYFmB7mny9EhH2Z86Xekw4o"
  })
  const onSearchInputChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const onSearchSubmit = (newCenter) => {
    let url = new URL(window.location.origin + window.location.pathname)
    console.log("valuies" , newCenter, initialSearchParam, searchTerm)
    url.searchParams.set("search", searchTerm)
    if(newCenter.lng){
      url.searchParams.set("location", `${newCenter.lng()},${newCenter.lat()}`)
    }
    window.location.href = url
  }
  const getMarkerColor = (place, metric_ranges) => {
    const gray = "rgb(128,128,128)"
    if(!place){
      return gray
    }
    const has_hai_relative_mean = place['hai relative mean']||place['hai relative mean'] === 0
    const has_hcahps_relative_mean = place['hcahps relative mean']||place['hcahps relative mean'] === 0
    let marker_metric = null
    const min_combined_metric = metric_ranges['min_hai'] + metric_ranges['min_hcahps']
    const max_combined_metric = metric_ranges['max_hai'] + metric_ranges['max_hcahps']

    if(has_hai_relative_mean && has_hcahps_relative_mean){
      marker_metric = place['hai relative mean'] + place['hcahps relative mean']
      return numberToRGB(marker_metric,min_combined_metric,max_combined_metric)
    }else if(has_hai_relative_mean){
      return numberToRGB(place['hai relative mean'],metric_ranges['min_hai'],metric_ranges['max_hai'])
    }else if(has_hcahps_relative_mean){
      return numberToRGB(place['hcahps relative mean'],metric_ranges['min_hcahps'],metric_ranges['max_hcahps'])
    }else{
      return gray
    }
  }
  const Map = () => {
    const firstLocation = initialLocation["lat"] ? initialLocation : placesData.results[0].geometry.location
    console.log("first locatoin", firstLocation)
    const firstLocationCenter = {lat : firstLocation.lat, lng : firstLocation.lng} //new google.maps.LatLng(parseFloat(firstLocation.lat),parseFloat(firstLocation.long))

    const selectedPlaceCenter = {
      lat : selectedPlace ? selectedPlace.geometry.location.lat : null,
      lng : selectedPlace ? selectedPlace.geometry.location.lng : null
    }

    const markers = placesData.results.map((place, index)=>{
      const location = place.geometry.location
      const latLng = {lat : location.lat, lng : location.lng} //new google.maps.LatLng(parseFloat(location.lat),parseFloat(location.long))
      const markerColor = getMarkerColor(place, metricRanges)
      return (
        <Marker 
          onLoad={(marker) => {
            const customIcon = (opts) => Object.assign({
              path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
              fillColor: markerColor,
              fillOpacity: 1,
              strokeColor: '#000',
              strokeWeight: 1,
              scale: 1,
            }, opts);

            marker.setIcon(customIcon({
              fillColor: markerColor,
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

    const onDragEnd = () => {
      const newCenter = map.getCenter()
      console.log("new center target", newCenter.lng() )
      onSearchSubmit(newCenter)
    }
    return isLoaded ? (
        <div style={{width : "800px", height : "800px"}}>
            <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={selectedPlace ? selectedPlaceCenter : firstLocationCenter}
            zoom={.75}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onDragEnd={onDragEnd}
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
  const hasPlaceResults = placesData.results && placesData.results.length > 0
  return (
    <div className="App">
      <div>
        <input value={searchTerm} onChange={onSearchInputChange} />
        <button onClick={onSearchSubmit}>Search</button>
      </div>
      <div style={outerStyles}>
        {
          hasPlaceResults ? <div style={{maxHeight : '800px', overflowY : 'scroll'}}>
            <h1>Map results</h1>
            <PlaceResults placesData={placesData} selectedPlace={selectedPlace} setSelectedPlace={setSelectedPlace}/>
          </div> : <></>
        }
        
        {
          selectedPlace ?
          <div style={{border : 2, width : 150, marginRight : 10, marginLeft : 10}}>
            <h3>Current Selection</h3>
            <div>{selectedPlace.name}</div>
            <div>{selectedPlace.formatted_address}</div>
            {
                selectedPlace['hai relative mean'] ? 
                <div>
                  <b>Safety: <span style={{color:"#fdcc0d"}}>{getHaiStars(selectedPlace['hai relative mean'])}</span></b>
                </div> : <></>
              }
              {
                selectedPlace['hcahps relative mean'] ? <div>
                  <b>Experience: <span style={{color:"#fdcc0d"}}>{getHCAHPSStars(selectedPlace['hcahps relative mean'])}</span></b>
                </div> : <></>
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