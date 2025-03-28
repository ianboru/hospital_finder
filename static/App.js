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
import StartingModal from "./components/StartingModal";
function App() {
  console.log("version 0.9")
  const placesData = JSON.parse(document.getElementById("google_places_data").textContent)
  console.log("initial placeresults", placesData)
  const metricQuantiles = JSON.parse(document.getElementById("metric_quantiles").textContent)
  const dataDictionary = JSON.parse(document.getElementById("data_dictionary").textContent)
  const [selectedPlace, setSelectedPlace] = React.useState(null)
  console.log("initial quantiles", metricQuantiles)
  let url = new URL(window.location)
  console.log("initial dictionary", dataDictionary)
  const initialSearchParam = url.searchParams.get("search")
  const initialLocationParam = url.searchParams.get("location")
  const initialLocationSplit = initialLocationParam ? initialLocationParam.split(",") : []
  const initialLocation = initialLocationSplit ?  {"lng" : parseFloat(initialLocationSplit[0]), "lat" : parseFloat(initialLocationSplit[1])} : {}
  const initialZoomRadius =  url.searchParams.get("radius")
  const initialCareTypeParam =  url.searchParams.get("careType") 
  const initialCareType = initialCareTypeParam ? initialCareTypeParam : "Hospital"
  

  const [searchTerm, setSearchTerm] = React.useState(initialSearchParam ? initialSearchParam : "")
  const [zoomRadius, setZoomRadius] = React.useState(initialZoomRadius)
  const [shownDefinition, setShownDefinition] = React.useState(null)
  

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

    //hide definition modal
    window.addEventListener("mousedown", function(element) {
      // Code to execute when the window is resized
      console.log(element.target.classList)
      if(element.target.classList[0] != "definition-info-popup"){
        setShownDefinition(null)
      }
    });

  }, [])


  const onSelectCareType = (careType) => {
    console.log("selected caretype", careType)
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
  console.log("initial map location", initialLocation)

  const definitionInfoPopUp = shownDefinition && dataDictionary[shownDefinition] ? (
    <div className="definition-info-popup">
      <h3>{dataDictionary[shownDefinition].term}</h3>
      <div>{dataDictionary[shownDefinition].definition}</div>
    </div>
  ) : <></>    

  return (
    <div className="app">
      <HeaderInformation />
      <div className='main-app'>
          <div className='left-container'>
            <div style={{
                position: "-webkit-sticky", // this is for all Safari (Desktop & iOS), not for Chrome
                position: "sticky",
                top: 0,
                zIndex: 1, // any positive value, layer order is global
                background: "#fff",
                paddingRight : 15,
                paddingLeft : 10,
                width : "100%"
            }}>
              <CareTypeFilter selectedCareType={initialCareType} onSelectCareType={onSelectCareType}/>
              <SearchButton onSearchSubmit={onSearchSubmit} searchTerm={searchTerm} onSearchInputChange={onSearchInputChange} setSearchTerm={setSearchTerm}/>
            </div>
            
            <div>
              <PlaceResults 
                placesData={placesData} 
                selectedPlace={selectedPlace} 
                setSelectedPlace={setSelectedPlace} 
                selectedCareType={initialCareTypeParam}
              />
            </div>
          </div>
          <div className='map-container'>
            {selectedPlace && (
              <div 
                className='place-detail-overlay'
              >
                {definitionInfoPopUp}
                <PlaceDetail 
                  selectedPlace={selectedPlace} 
                  setSelectedPlace={setSelectedPlace} 
                  setShownDefinition={setShownDefinition}
                  shownDefinition={shownDefinition}
                  selectedCareType={initialCareTypeParam}
                  dataDictionary={dataDictionary}
                  metricQuantiles={metricQuantiles}
                > 
                </PlaceDetail>
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
            >
            </Map>
        </div>
      </div>
    </div>
  );
}


ReactDOM.render(<App />,document.getElementById("root"))