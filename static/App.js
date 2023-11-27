import ReactDOM from "react-dom"
import React, { Component } from 'react'


import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

function App() {

  const placesData = JSON.parse(document.getElementById("google_places_data").textContent)
  const [selectedPlace, setSelectedPlace] = React.useState({})
  console.log('places', placesData.results.map((place, index) => {
    console.log('place Tiles place outside',place, index)
  }))
  const PlaceResults = () => {
    console.log('placesData', placesData)
    const placeTiles = placesData.results.map((place, i)=>{
      console.log('place Tiles place',place, i)
      return (
        <table>
          <tr>
          <td>{place.name}</td>
          {
            place.MRSA_SIR_2015 ? <td>MRSA SIR - {place.MRSA_SIR_2015}</td> : <></>
          }
          </tr>
        </table>
      )
      //how am i structuring the data from the backend so i can do lookup by name on the FE
    })

    return (
      <div style={{width : "200px"}}>
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
      return (
        <Marker 
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
          zoom={1}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          { markers }
          <></>
        </GoogleMap>
    ) : <></>
  }
  const styles = {
    display : "flex",
  }
  console.log('selectedPlace', selectedPlace)
  return (
    <div className="App">
      
      
      <div style={styles}>
        <div>
          <h1>Map results</h1>
          <PlaceResults style={{"margin-right" : 15}}/>
        </div>
        <div style={{border : 2, width : 150}}>
          <h3>Current Selection</h3>
          <div>{selectedPlace.name}</div>
          <div>{selectedPlace.formatted_address}</div>
          {
            selectedPlace.MRSA_SIR_2015 ? <div>{selectedPlace.MRSA_SIR_2015}</div> : <></>
          }
        </div>
        <Map/>
        
      </div>
      
    </div>
  );
}

ReactDOM.render(<App />,document.getElementById("root"))