import React from 'react';

const filledStarUnicode = "\u2605"
const empyStarUnicode = "\u2606"
const getHaiEmoji = (starCount, midPoint) => {
    if(!starCount){
        return ""
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
    console.log(starCount)
    if (starCount === null||starCount == 'Not Available'){
        
        return "N/A"
    }
    return filledStarUnicode.repeat(starCount) + empyStarUnicode.repeat(maxCount - starCount)
}

const scrollToPlaceResult = (id) => {
    const element = document.getElementById(id)
    element.scrollIntoView({behavior: 'smooth'})
}


export {
    getHaiEmoji,
    getHCAHPSStars,
    scrollToPlaceResult
}