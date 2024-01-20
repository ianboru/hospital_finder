const getHaiStars = (relativeMeanHai) => {
    let starCount = 0
    switch (true){
      case relativeMeanHai < -.5:
        starCount = 1
        break
      case relativeMeanHai >= -.5 && relativeMeanHai < 0:
        starCount = 2
        break
      case relativeMeanHai == 0:
        starCount = 3
        break
      case relativeMeanHai > 0 && relativeMeanHai < .5:
        starCount = 4
        break
      case relativeMeanHai >= .5:
        starCount = 5
        break
    }
    const starUnicode = "\u2605"
    return starUnicode.repeat(starCount)
  }

export {
    getHaiStars
}