import React from 'react';

const colorLegendComponent = () => {
    // Color legend container style for top-right positioning
    const colorLegendStyle = {
        position: "absolute",
        top: "10px",
        left: "10px",
        zIndex: "1000",
        background: "rgba(255, 255, 255, 0.9)", // RGBA color with 80% opacity
        borderRadius: "10px",
        padding: "10px",
        width: "380px",
        height: "20px",
        display: "flex"
    };

          //colorLegend
    const colorLegend = (
        <div style={colorLegendStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: 'red', display: 'inline-block', marginRight: '5px', fontStyle: 'bold' }}></div>
            <span>Lower Than Average</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '15px'}}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#e7b416', display: 'inline-block', marginRight: '5px' }}></div>
            <span>Average</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '15px'}}>
            <div style={{ width: '10px', height: '10px', backgroundColor: 'green', display: 'inline-block', marginRight: '5px' }}></div>
            <span> Above Average</span>
          </div>
        </div>
    );

    return (
        <div>
            {colorLegend}
        </div>
    );
}

export default colorLegendComponent;