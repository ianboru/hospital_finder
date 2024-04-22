import React, { useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { numberToRGB } from "../colorUtils"
import haversine from 'haversine-distance'

const Map = (props) => {
    const placesData = props.placesData 
    const initialLocation = props.initialLocation 
    const selectedPlace = props.selectedPlace 
    const setSelectedPlace = props.setSelectedPlace 
    const metricRanges = props.metricRanges 
    const onSearchSubmit = props.onSearchSubmit 
    const setZoomRadius = props.setZoomRadius  


    const getMarkerColor = (place, metric_ranges) => {
        const gray = "rgb(128,128,128)"
        if(!place){
          return gray
        }
        const has_infection_rating = place['Infection Rating']||place['Infection Rating'] === 0
        const has_patient_summary = place['Summary star rating']||place['Summary star rating'] === 0
        let marker_metric = null
        // Use average of the two metrics
        const min_combined_metric = (metric_ranges['min_hai'] + metric_ranges['min_hcahps'])/2
        const max_combined_metric = (metric_ranges['max_hai'] + metric_ranges['max_hcahps'])/2
        //console.log("marker ", "1) " + place['Infection Rating'],"2) " + place['Summary star rating'], "3) " + metric_ranges )
        //console.log("has em", has_infection_rating, has_patient_summary)
        if(has_infection_rating && has_patient_summary){
          marker_metric = (place['Infection Rating'] + place['Summary star rating'])/2
          return numberToRGB(marker_metric,min_combined_metric,max_combined_metric)
        }else if(has_infection_rating){
          return numberToRGB(place['Infection Rating'],metric_ranges['min_hai'],metric_ranges['max_hai'])
        }else if(has_patient_summary){
          return numberToRGB(place['Summary star rating'],metric_ranges['min_hcahps'],metric_ranges['max_hcahps'])
        }else{
          return gray
        }
    }
    console.log(placesData.results)
    const firstResult = (placesData.results && placesData.results.length > 0 && placesData.results[0].location) || {}
    //check if initial location has been loaded/is relevant else use first google place result
    const firstLocation = initialLocation["lat"] ? initialLocation : firstResult
    console.log("first location", firstLocation)
    const firstLocationCenter = {lat : firstLocation.lat, lng : firstLocation.lng} //new google.maps.LatLng(parseFloat(firstLocation.lat),parseFloat(firstLocation.long))

    const selectedPlaceCenter = {
      lat : selectedPlace ? selectedPlace.location.lat : null,
      lng : selectedPlace ? selectedPlace.location.lng : null
    }

    const markers = placesData.results && placesData.results.length > 0 && placesData.results.map((place, index)=>{
      const location = place.location
      const latLng = {lat : location.latitude, lng : location.longitude} //new google.maps.LatLng(parseFloat(location.lat),parseFloat(location.long))
      const markerColor = getMarkerColor(place, metricRanges)
      return (
        <Marker
          onLoad={(marker) => {
            const customIcon = (opts) => Object.assign({
              path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
              fillColor: "green",
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
            console.log("selecting place in marker", place)
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
    }
    
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
      if(false){
        const newCenter = map.getCenter()
        console.log("new center target", newCenter.lng() )
        onSearchSubmit(newCenter)
      }
    }

    //priority to center the map: selected place, first result in google maps result, current gps location
    const curCenter = selectedPlace ? selectedPlaceCenter : firstLocationCenter && firstLocationCenter.lat ?
        firstLocationCenter : props.currentGPSLocation

    console.log("current center", curCenter, selectedPlace, selectedPlaceCenter, firstLocation, firstLocationCenter, props.currentGPSLocation )
    if (curCenter){
      //curCenter.lat = curCenter.latitude
      //curCenter.long = curCenter.longitude
    }
    
    return isLoaded && curCenter ? (
        <div style={{alignItems: 'stretch', width : "100%", height : "100%"}}>
            <GoogleMap
              style={{ width : "100%", height : "100%"}}
              mapContainerStyle={mapContainerStyle}
              center={curCenter}
              zoom={.85}
              onLoad={onLoad}
              onUnmount={onUnmount}
              onDragEnd={onDragEnd}
              onZoomChanged={()=>{
                if(map && false){
                  const bounds = map.getBounds()
                  const neCornerLatLng = bounds.getNorthEast()
                  const neCornerLocation = {'lat': neCornerLatLng.lat(), 'lng': neCornerLatLng.lng(), }
                  const swCornerLatLng = bounds.getSouthWest()
                  const swCornerLocation = {'lat': swCornerLatLng.lat(), 'lng': swCornerLatLng.lng(), }

                  const windowRadius = haversine(neCornerLocation, swCornerLocation)/2
                  setZoomRadius(windowRadius)
                  const newCenter = map.getCenter()
                  onSearchSubmit(newCenter, windowRadius)
                }
              }}
            >
            { markers ? markers : <></> }
          </GoogleMap>
        </div>
    ) : <div style={{fontWeight : "bold", marginTop : "15px", width : "100%", height : "100%"}}>Loading Map...</div>
  }

  export default Map