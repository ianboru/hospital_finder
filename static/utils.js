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
    if (starCount === null||starCount == 'Not Available'||starCount == 'NaN'||starCount == "Not Applicable"){
        return "No Data"
    }
    if(starCount > 5){
        //hack if starcount is actuanlly a percentage value
        return starCount + "%"
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
    if (element) {
        element.scrollIntoView({behavior: 'smooth'})
    }
}

const formatPhoneNumber = (phoneNumber) => {
    return `(${phoneNumber.substring(0,3)}) ${phoneNumber.substring(3,6)}-${phoneNumber.substring(6,10)} `
}

export {
    getHaiEmoji,
    getHCAHPSStars,
    scrollToPlaceResult,
    addressToUrl,
    formatPhoneNumber
}