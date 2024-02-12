import React from 'react'

const StarRatingStyle = (props) => {
    const metricLabel = props.metricLabel
    const metricRatingFunction = props.metricRatingFunction
    const bTagStyle = props.bTagStyle
    console.log("metricLabel", metricLabel, metricRatingFunction )
    return(
        <div>
            <b style={bTagStyle ? bTagStyle : null}>{metricLabel}</b>
            <span style={{color: "gold", alignSelf : "flex-end"}}>
                {metricRatingFunction()}
            </span>
        </div>
    )
}

export default StarRatingStyle