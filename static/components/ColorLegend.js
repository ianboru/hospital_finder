import React from 'react';

const colorLegendComponent = () => {
    const colorLegendStyle = {
        position: "absolute",
        top: "10px",
        left: "10px",
        zIndex: "1000",
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: "10px",
        padding: "10px",
        width: "370px",
        height: "20px",
        display: "flex"
    };

    const colorLegendColors = [
        { color: 'red', label: 'Lower Than Average' },
        { color: '#e7b416', label: 'Average' },
        { color: 'green', label: 'Above Average' }
    ];

    const colorLegend = (
        <div style = {colorLegendStyle}>
            {colorLegendColors.map((item, index) => (
                <div key = {index} style = {{alignItems: 'center', marginLeft: index === 0 ? '0' : '15px', display: 'flex'}}>
                    <div style = {{height: '10px', width: '10px', backgroundColor: item.color, marginRight: '5px' }}></div>
                    <span>{item.label}</span>
                </div> ))}
        </div>
    );

    return (
        <div>
            {colorLegend}
        </div>
    );
}

export default colorLegendComponent;