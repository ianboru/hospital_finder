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
                selectedPlace['Infection Rating'] ?
                <div>
                  <b>Infection Rating: <span style={{color:"#fdcc0d"}}>{getHaiStars(selectedPlace['Infection Rating'])}</span></b>
                </div> : <></>
              }
              {
                selectedPlace['Summary'] ? <div>
                  <b>Patient Rating: <span style={{color:"#fdcc0d"}}>{getHCAHPSStars(selectedPlace['Summary'])}</span></b>
                </div> : <></>
              }
          </div>
    )
}

export default PlaceDetail