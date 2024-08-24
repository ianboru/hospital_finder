const App = () => {
    useEffect = () => {
        placesData = JSON.parse(
            document.getElementById("google_places_data").textContent
        )
    }
    return <div>{placesData}</div>
}

ReactDOM.render(
    <App/>,
    document.getElementById('app')
)