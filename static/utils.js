const filledStarUnicode = "\u2605"
const empyStarUnicode = "\u2606"
const getHaiStars = (relativeMeanHai,maxCount=5) => {
    let starCount = 0
    // switch (true){
    //   case relativeMeanHai < -.5:
    //     starCount = 1
    //     break
    //   case relativeMeanHai >= -.5 && relativeMeanHai < 0:
    //     starCount = 2
    //     break
    //   case relativeMeanHai == 0:
    //     starCount = 3
    //     break
    //   case relativeMeanHai > 0 && relativeMeanHai < .5:
    //     starCount = 4
    //     break
    //   case relativeMeanHai >= .5:
    //     starCount = 5
    //     break
    // }
    starCount = relativeMeanHai

    if (starCount === null){
        // TODO: Handle null values
    }
    return filledStarUnicode.repeat(starCount) + empyStarUnicode.repeat(maxCount - starCount)
}
const getHCAHPSStars = (starCount, maxCount=5) => {
    if (starCount === null){
        // TODO: Handle null values
    }
    return filledStarUnicode.repeat(starCount) + empyStarUnicode.repeat(maxCount - starCount)
}


export {
    getHaiStars,
    getHCAHPSStars
}