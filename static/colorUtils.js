const numberToRGB = (value, min, max) => {
    if(value < min){
        return "red"
    }else if(value >= min && value < max){
        return "#e7b416"//stoplight yellow
    }else{
        return "green"
    }
}

export { numberToRGB }