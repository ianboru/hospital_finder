import React from 'react'

const SearchButton = (props) => {
    let onSearchSubmit = props.onSearchSubmit
    let searchTerm = props.searchTerm
    let onSearchInputChange = props.onSearchInputChange

    return (
        <form onSubmit={
                    (event) => {
                        event.preventDefault()
                        onSearchSubmit()
                    }}
                >
          <input style={{width : 350, height: 40, borderRadius : 5, padding: 5}} placeholder={"Search care provider types e.g. hospital, clinic, etc"} value={searchTerm} onChange={onSearchInputChange}/>
          <button type="submit" style={{marginLeft : 10}}>Search</button>
        </form> 
    )
}

export default SearchButton