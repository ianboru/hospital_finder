const filledStarUnicode = "\u2605"
const empyStarUnicode = "\u2606"
const getHaiStars = (relativeMeanHai) => {
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
    return filledStarUnicode.repeat(starCount) + empyStarUnicode.repeat(5 - starCount)
}
const getHCAHPSStars = (starCount) => {
    if (starCount === null){
        // TODO: Handle null values
    }
    return filledStarUnicode.repeat(starCount) + empyStarUnicode.repeat(5 - starCount)
}


export {
    getHaiStars,
    getHCAHPSStars
}