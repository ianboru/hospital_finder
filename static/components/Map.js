import React, { useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { numberToRGB } from "../colorUtils"
//import haversine from 'haversine-distance'
import { scrollToPlaceResult } from "../utils"

const Map = (props) => {
    const placesData = props.placesData 
    const initialLocation = props.initialLocation 
    const selectedPlace = props.selectedPlace 
    const setSelectedPlace = props.setSelectedPlace 
    const metricQuantiles = props.metricQuantiles 
    const onSearchSubmit = props.onSearchSubmit 
    const setZoomRadius = props.setZoomRadius
    const currentGPSLocation = props.currentGPSLocation

    const getMarkerColor = (place, metricQuantiles) => {
        const gray = "rgb(128,128,128)"
        if(!place){
          return gray
        }
        place['Infection Rating'] = parseInt(place['Infection Rating'])
        place['Summary star rating'] = parseInt(place['Summary star rating'])
        const has_infection_rating = place['Infection Rating']||place['Infection Rating'] === 0
        const has_summary_star_rating = place['Summary star rating']||place['Summary star rating'] === 0
        let marker_metric = null
        // Use average of the two metrics
        const min_combined_metric_quantile = (metricQuantiles['hai_bottom_quantile'] + metricQuantiles['hcahps_bottom_quantile'])
        const max_combined_metric_quantile = (metricQuantiles['hai_top_quantile'] + metricQuantiles['hcahps_top_quantile'])
        if(has_infection_rating && has_summary_star_rating){
          marker_metric = (place['Infection Rating'] + place['Summary star rating'])*1
          return numberToRGB(marker_metric,min_combined_metric_quantile,max_combined_metric_quantile)
        }else if(has_infection_rating){
          return numberToRGB(place['Infection Rating'],metricQuantiles['hai_bottom_quantile'],metricQuantiles['hai_top_quantile'])
        }else if(has_summary_star_rating){
          return numberToRGB(place['Summary star rating'],metricQuantiles['hcahps_bottom_quantile'],metricQuantiles['hcahps_top_quantile'])
        }else{
          return gray
        }
    }
    const firstResult = (placesData && placesData.length > 0 && placesData[0].location) || {}
    //check if initial location has been loaded/is relevant else use first google place result
    const firstLocation = initialLocation["lat"] ? initialLocation : firstResult
    console.log("first location", firstLocation)
    const firstLocationCenter = {lat : firstLocation.lat, lng : firstLocation.lng} //new google.maps.LatLng(parseFloat(firstLocation.lat),parseFloat(firstLocation.long))
    const selectedPlaceCenter = {
      lat : selectedPlace ? selectedPlace.location.lat : null,
      lng : selectedPlace ? selectedPlace.location.lng : null
    }

    const markers = placesData && placesData.length > 0 && placesData.map((place, index)=>{
      const location = place.location
      const latLng = {lat : location.latitude, lng : location.longitude} //new google.maps.LatLng(parseFloat(location.lat),parseFloat(location.long))
      const markerColor = getMarkerColor(place, metricQuantiles)
      //const markerColor = "#FFFFFFF"
      const isSelectedPlace = selectedPlace && (selectedPlace["Facility ID"] == place["Facility ID"]) 
      const strokeWeight = isSelectedPlace ? 1.4 : 1
      const scale = isSelectedPlace ? 1.3 : 1
      const strokeColor = isSelectedPlace ? "black" : "white"
      const fillOpacity = isSelectedPlace ? 1 : .8
      const zindex = isSelectedPlace ? 999 : 1

      return (
        <Marker
          icon={{
              path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
              //fillColor: markerColor,
              fillColor: markerColor,
              strokeColor : strokeColor,
              strokeWeight: strokeWeight,
              fillOpacity: fillOpacity,
              scale: scale,
              labelOrigin: new google.maps.Point(0, -30)
          }}
          zIndex={zindex}
          label={{color: 'white', text: 'H', strokeColor: 'black', strokeWeight: 2} }
          position={latLng}
          onClick={(marker)=>{
            console.log("selecting place in marker", marker)
            setSelectedPlace(place)
            scrollToPlaceResult(place['Facility ID'])
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

    if (curCenter && curCenter.lat < 1 ){
      //for some reason lat and lng are flipped by this point
      const tempCenter = {...curCenter}
      curCenter.lat = tempCenter.lng
      curCenter.lng = tempCenter.lat
    }
    if(curCenter && !curCenter.lat && selectedPlace){
      //sets lat and long from selected place (maybe best done earlier in the flow)
      const mapBounds =  map.getBounds()
      const swCornerLatLng = mapBounds.getSouthWest()
      const leftMostLong =  swCornerLatLng.lng()

      curCenter.lat = selectedPlace.latitude
      //average between selected place and left edge 
      //to ensure marker isn't blocked by place detail card
      curCenter.lng = selectedPlace.longitude - (selectedPlace.longitude - leftMostLong)/3
      console.log("long coords", selectedPlace.longitude, leftMostLong, curCenter.lng)
    }

    //translucent background circle for the CurrentLocationMarker
    const translucentBackgroundCircleCurrentLocationMarker = currentGPSLocation && (
      <Marker
        position={{ lat: currentGPSLocation.lat, lng: currentGPSLocation.lng }}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: '#4285F4',
          fillOpacity: 0.3,
          strokeWeight: 0,
        }}
      />
    );
    //front blue circle for the CurrentLocationMarker
    const blueFrontCircleCurrentLocationMarker = currentGPSLocation && (
      <Marker
        position={{ lat: currentGPSLocation.lat, lng: currentGPSLocation.lng }}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
        }}
      />
    );
    //current location marker parent
    const currentLocationMarker = currentGPSLocation ? (
      <>
        {translucentBackgroundCircleCurrentLocationMarker}
        {blueFrontCircleCurrentLocationMarker}
      </>
    ) : null;


    //map options object for satelite view disabled and points of interest disabled
    const mapOptions = {
      mapTypeControl: false, // Disable the map changing satellite option
      mapTypeControlOptions: { // Set the default style to roadmap
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          mapTypeIds: ['roadmap']
      },
      styles: [
          {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }] // Hide labels for points of interest
          }
      ]
    };

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
              options={mapOptions}
              
              // onZoomChanged={()=>{
                // if(map && false){
                //   const bounds = map.getBounds()
                //   const neCornerLatLng = bounds.getNorthEast()
                //   const neCornerLocation = {'lat': neCornerLatLng.lat(), 'lng': neCornerLatLng.lng(), }
                //   const swCornerLatLng = bounds.getSouthWest()
                //   const swCornerLocation = {'lat': swCornerLatLng.lat(), 'lng': swCornerLatLng.lng(), }

                //   //const windowRadius = haversine(neCornerLocation, swCornerLocation)/2
                //   setZoomRadius(windowRadius)
                //   const newCenter = map.getCenter()
                //   onSearchSubmit(newCenter, windowRadius)
                // }
                
            >
            { markers ? markers : <></> }
            {currentLocationMarker}
          </GoogleMap>
        </div>
    ) : <div style={{fontWeight : "bold", marginTop : "15px", width : "100%", height : "100%"}}>Loading Map...</div>
  }
export default Map