const App = () => {
  useEffect = () => {
    placesData = JSON.parse(
      document.getElementById('google_places_data').textContent
    )
  }
  return <div>{placesData} AND STUFF asdf asdf </div>
}

ReactDOM.render(<App />, document.getElementById('app'))
