window.onload = ()=>{
    $("#search-form").on("submit", (e) => {
        e.preventDefault()
        e.stopPropagation()
        const searchString = $("input[name='search']").val()
        let url = new URL(window.location.origin + window.location.pathname)
    
        url.searchParams.set("search", searchString)
    
        const urlParams = new URLSearchParams(window.location.search)
        window.location.href = url
    })
}
