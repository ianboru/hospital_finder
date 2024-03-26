import React from 'react'
import "../SearchButton.css"

const SearchButton = (props) => {
    let onSearchSubmit = props.onSearchSubmit
    let searchTerm = props.searchTerm
    let onSearchInputChange = props.onSearchInputChange
    let setSearchTerm = props.setSearchTerm

    const clearSearchTerm = () => {
        setSearchTerm("")
    }

    return (
        <form onSubmit={(event) => {
            event.preventDefault()
            onSearchSubmit()
        }} className="search-form">
        <input 
            className="search-input"
            placeholder="Hospital or location name here"
            value={searchTerm}
            onChange={onSearchInputChange}
        />
        <button type="submit" className="search-icon-button">
            🔍
        </button>
        {searchTerm && (
            <button type="button" onClick={clearSearchTerm} className="clear-search-button">
                ❌
            </button>
         )}
    </form>


    )
}

export default SearchButton