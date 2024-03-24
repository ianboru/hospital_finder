import React from 'react'
import '../HeaderInfo.css'

const HeaderInformation = () => {
  return (
    <div className="header-info">
      <div>
        <h1>CafeFinder.com rates hospitals on how safe they are for patients, so you can <br/> protect yourself and your loved ones</h1>
        <p>
            Our data comes from national standardized public reporting
        </p>
      </div>
      <div style={{paddingTop: '3%'}}>
        <p>
            <b>Infection Risks</b> illustrate a facility’s commitment to keeping their patients safe - choose wisely!
        </p>
        <p>
            <b>Patient Ratings</b> come from Consumer Assessment of Healthcare Providers and Systems (CAHPS) surveys.
        </p>
      </div>
    </div>
  )
}

export default HeaderInformation
