const numberToRGB = (value, min, max) => {

    if(value < min){
        return "red"
    }else if(value >= min && value < max){
        return "yellow"
    }else{
        return "green"
    }
}

export { numberToRGB }