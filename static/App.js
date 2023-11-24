import ReactDOM from "react-dom"
import React, { Component } from 'react'



function App() {
  const placesData = JSON.parse(document.getElementById("google_places_data").textContent)
  console.log('this is data', placesData.results)

  const renderPlaceResults = () => {
    return placesData.results.map((place)=>{
      return (
        <div>Name: {place.name}</div>
      )
    })
  }
  return (
    <div className="App">
      <h1>Map results</h1>
      {renderPlaceResults()}
    </div>
  );
}

ReactDOM.render(<App />,document.getElementById("root"))