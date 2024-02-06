import React from 'react';

const filledStarUnicode = "\u2605"
const empyStarUnicode = "\u2606"
const getHaiEmoji = (starCount) => {
    if(!starCount){
        return ""
    }
    switch (true){
        case starCount < 3:
            return (<span style={{color:"green"}}>😄 Better Than Average</span>)
        case starCount == 3:
            return (<span style={{color:"orange"}}>😐 Average</span>)
        case starCount > 3:
            return (<span style={{color:"red"}}>🤢 Worse Than Average</span>)
    }
}
const getHCAHPSStars = (starCount, maxCount=5) => {
    if (starCount === null){
        // TODO: Handle null values
    }
    return filledStarUnicode.repeat(starCount) + empyStarUnicode.repeat(maxCount - starCount)
}


export {
    getHaiEmoji,
    getHCAHPSStars
}