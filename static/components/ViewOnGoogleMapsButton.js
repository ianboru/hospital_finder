import React, { useEffect, useState } from 'react'
    
const ViewOnGoogleMapsButton = (props) => {
    const style={
      border: "1px solid #7C51B2",
      padding : 5, 
      borderRadius : 10,
      marginTop : 5,
      marginBottom : 5,
      width : "fit-content",
      color: "#7C51B2"
    }
    return (
      <div style={style}>
        <a style={{textDecoration: "none", color:"inherit"}} href={props.url} target="_blank" >Google Maps</a>
      </div>
      
    )
  }

export default ViewOnGoogleMapsButton