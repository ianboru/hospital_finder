import React from 'react'
import { getHCAHPSStars, getHaiStars } from '../utils';

const PlaceDetail = (props) => {
    const selectedPlace = props.selectedPlace
    return(
        <div style={{border : 2, borderColor : 'black', width : 200, marginRight : 10, marginLeft : 10}}>
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
          </div> 
    )
} 

export default PlaceDetail