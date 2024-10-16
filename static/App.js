import ReactDOM from "react-dom"
import React, { useEffect } from 'react'
import PlaceResults from "./components/PlaceResults";
import PlaceDetail from "./components/PlaceDetail"
import ColorLegend from './components/ColorLegend';
import TitleBanner from './components/TitleBanner'
import SearchButton from './components/SearchButton'
import HeaderInformation from './components/HeaderInformation'
import Map from "./components/Map"
import CareTypeFilter from "./components/CareTypeFilter"
import './App.css'

function App() {
  console.log("version 0.1.2")
  const placesData = JSON.parse(document.getElementById("google_places_data").textContent)
  const metricQuantiles = JSON.parse(document.getElementById("metric_quantiles").textContent)

  const [selectedPlace, setSelectedPlace] = React.useState(null)
  let url = new URL(window.location)

  const initialSearchParam = url.searchParams.get("search")
  const initialLocationParam = url.searchParams.get("location")
  const initialLocationSplit = initialLocationParam ? initialLocationParam.split(",") : []
  const initialLocation = initialLocationSplit ?  {"lng" : parseFloat(initialLocationSplit[0]), "lat" : parseFloat(initialLocationSplit[1])} : {}
  const initialZoomRadius =  url.searchParams.get("radius")
  const initialCareTypeParam =  url.searchParams.get("careType") 
  const initialCareType = initialCareTypeParam ? initialCareTypeParam : "Hospital"
  

  const [searchTerm, setSearchTerm] = React.useState(initialSearchParam ? initialSearchParam : "")
  const [zoomRadius, setZoomRadius] = React.useState(initialZoomRadius)
  const [currentGPSLocation, setCurrentGPSLocation] = React.useState(null)
  useEffect(()=>{
    navigator.geolocation.getCurrentPosition((position)=>{
      console.log("updating current position", position.coords, initialLocation)
      if(!initialLocation.lat){
        console.log("updating url")
        let url = new URL(window.location.origin + window.location.pathname)
        url.searchParams.set("location", `${position.coords.latitude},${position.coords.longitude}`)
        window.location.href = url
      }
      
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
    alignContent : "flex-start",
    flexDirection: 'column'
  }
  console.log("initial care type", initialCareType)
  console.log("App load places", placesData)
  console.log("initial map location", initialLocation)

  return (
    <div className="app">
      <HeaderInformation />
      <div className='main-app'>
      <div className='left-container'>
        <CareTypeFilter selectedCareType={initialCareType} onSelectCareType={onSelectCareType}/>
        <SearchButton onSearchSubmit={onSearchSubmit} searchTerm={searchTerm} onSearchInputChange={onSearchInputChange} setSearchTerm={setSearchTerm}/>
        <div>
          <div>
            <PlaceResults 
              placesData={placesData} 
              selectedPlace={selectedPlace} 
              setSelectedPlace={setSelectedPlace} 
              selectedCareType={initialCareTypeParam}
            />
          </div>
        </div>
      </div>
      <div className='map-container'>
        {selectedPlace && (
          <div className='place-detail-overlay'>
            <PlaceDetail selectedPlace={selectedPlace} setSelectedPlace={setSelectedPlace} />
          </div>
        )}
        <Map
          placesData={placesData}
          initialLocation={initialLocation}
          setSelectedPlace={setSelectedPlace}
          selectedPlace={selectedPlace}
          metricQuantiles={metricQuantiles}
          onSearchSubmit={onSearchSubmit}
          setZoomRadius={setZoomRadius}
          currentGPSLocation={currentGPSLocation}
        />
        <ColorLegend />
      </div>
    </div>
    </div>
  );
}

ReactDOM.render(<App />,document.getElementById("root"))