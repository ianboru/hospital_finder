const numberToRGB = (value, min, max) => {
    const perc = 100*value/(max-min)
    if(perc < 33){
        return "red"
    }else if(perc >= 33 && perc < 66){
        return "yellow"
    }else{
        return "green"
    }
}

export { numberToRGB }