import React from 'react'

 const TitleBanner = props => {
   return (
     <div
       style={{
        border: '2px solid black',
        width: '100%',
        backgroundColor: '#0073E6',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        padding: '5px'
       }}
     >
       <div
         className='title'
         style={{
           fontSize: '2em',
           fontWeight: 'bold',
           margin: '0',
           padding: '0',
           textAlign: 'center'
         }}
       >
         Welcome to Hospital Finder
       </div>

       <div
         className='sub-title'
         style={{
           fontSize: '1em',
           margin: '0',
           padding: '0',
           textAlign: 'center'
         }}
       >
         Make good life descisions, don't end up here
       </div>
     </div>
   )
 }

 export default TitleBanner