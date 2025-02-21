import React from 'react';
const filledStarUnicode = "\u2605"

const addressToUrl = (address) => {
    const urlAddress = address.replace(/\,/g, '');
    const url = urlAddress.replace(/\ /g, '%20');
    return  `http://maps.google.com/maps?q=${url}`
}
  
const getHaiEmoji = (starCount, midPoint) => {
    if(!starCount){
        return ""
    }
    if (starCount === null||starCount == 'Not Available'||starCount == 'NaN'){
        return "No Data"
    }
    
    switch (true){
        case starCount > midPoint:
            return (<span style={{color:"green"}}>😄 Better Than Average</span>)
        case starCount == midPoint:
            return (<span style={{color:"orange"}}>😐 Average</span>)
        case starCount < midPoint:
            return (<span style={{color:"red"}}>🤢 Worse Than Average</span>)
    }
}
const getHCAHPSStars = (starCount, maxCount=5) => {
    console.log("counting stars")
    console.log(starCount)
    if (starCount === null||starCount == 'Not Available'||starCount == 'NaN'){
        return "No Data"
    }
    return (
        <span>
            <span style={{color : "gold"}}>{filledStarUnicode.repeat(starCount)}</span>
            <span style={{color : "lightgray"}}>{filledStarUnicode.repeat(maxCount - starCount)}</span>
        </span>
    )
}

const scrollToPlaceResult = (id) => {
    const element = document.getElementById(id)
    element.scrollIntoView({behavior: 'smooth'})
}


export {
    getHaiEmoji,
    getHCAHPSStars,
    scrollToPlaceResult,
    addressToUrl

}