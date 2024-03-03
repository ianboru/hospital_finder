import ReactDOM from "react-dom"
import React, { useEffect, Component } from 'react'
import PlaceResults from "./components/PlaceResults";
import PlaceDetail from "./components/PlaceDetail"
import TitleBanner from './components/TitleBanner'
import Map from "./components/Map"
import CareTypeFilter from "./components/CareTypeFilter"

function App() {
  console.log("version 0.1.1")
  const placesData = JSON.parse(document.getElementById("google_places_data").textContent)
  const metricRanges = JSON.parse(document.getElementById("metric_ranges").textContent)

  const [selectedPlace, setSelectedPlace] = React.useState(null)
  let url = new URL(window.location)
  const initialSearchParam = url.searchParams.get("search")
  const initialLocationParam = url.searchParams.get("location")
  const initialLocationSplit = initialLocationParam ? initialLocationParam.split(",") : []
  const initialLocation = initialLocationSplit ?  {"lng" : parseFloat(initialLocationSplit[0]), "lat" : parseFloat(initialLocationSplit[1])} : {}
  const initialZoomRadius =  url.searchParams.get("radius")
  const initialCareTypeParam =  url.searchParams.get("careType") 
  const initialCareType = initialCareTypeParam ? initialCareTypeParam : "All"
  console.log("initial care type", initialCareType)


  const [searchTerm, setSearchTerm] = React.useState(initialSearchParam ? initialSearchParam : "")
  const [zoomRadius, setZoomRadius] = React.useState(initialZoomRadius)
  const [currentGPSLocation, setCurrentGPSLocation] = React.useState(null)
  useEffect(()=>{
    navigator.geolocation.getCurrentPosition((position)=>{
      console.log("updating current position", position.coords)
      setCurrentGPSLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
    })
  }, [])


  const onSelectCareType = (careType) => {
    onSearchSubmit(null,null,careType)
  }
  const onSearchInputChange = (e) => {
    setSearchTerm(e.target.value)
  } 
  
  const onSearchSubmit = (newCenter=null, newRadius=null, careType=careType) => {
    let url = new URL(window.location.origin + window.location.pathname)
    url.searchParams.set("search", searchTerm)
    url.searchParams.set("careType", careType ? careType.name : initialCareType )
    if (newCenter && newCenter !== undefined){
      url.searchParams.set("location", `${newCenter.lng()},${newCenter.lat()}`)
      if(newRadius){
        url.searchParams.set("radius", `${newRadius}`)
      }
    }else{
      url.searchParams.set("location", `${initialLocation.lng},${initialLocation.lat}`)
    }
    window.location.href = url
  }

  const outerStyles = {
    display : "flex",
    alignContent : "flex-start"
  }

  return (
    <div className="App">
      <TitleBanner />
      <div style={{marginBottom : 15}}>
        <form onSubmit={
              (event) => {
                event.preventDefault()
                onSearchSubmit()
              }}
        >
          <input style={{width : 350, height: 40, borderRadius : 5, padding: 5}} placeholder={"Search care provider types e.g. hospital, clinic, etc"} value={searchTerm} onChange={onSearchInputChange}/>
          <button type="submit" style={{marginLeft : 10}}>Search</button>
        </form> 
        <CareTypeFilter selectedCareType={initialCareType} onSelectCareType={onSelectCareType}/> 
      </div>
      <div style={outerStyles}>
          <div style={{maxHeight : '800px', overflowY : 'scroll'}}>
            <h1>Search results</h1>
            <PlaceResults placesData={placesData} selectedPlace={selectedPlace} setSelectedPlace={setSelectedPlace}/>
          </div>
        {
          selectedPlace ? <PlaceDetail selectedPlace={selectedPlace}/> : <></>
        }
        <Map
          placesData={placesData}
          initialLocation={initialLocation}
          selectedPlace={selectedPlace}
          metricRanges={metricRanges}
          onSearchSubmit={onSearchSubmit}
          setZoomRadius={setZoomRadius}
          currentGPSLocation={currentGPSLocation}
        />

      </div>

    </div>
  );
}

ReactDOM.render(<App />,document.getElementById("root"))