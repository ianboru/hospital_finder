import React from 'react';
import { getHaiEmoji, getHCAHPSStars, addressToUrl, formatPhoneNumber } from '../utils';
import ViewOnGoogleMapsButton from './ViewOnGoogleMapsButton';

const infectionLabel = (value) => {
  if (value > 3) return { text: 'Below Average', color: 'green', emoji: '😄' };
  if (value === 3) return { text: 'Average', color: 'orange', emoji: '😐' };
  if (value < 3) return { text: 'Above Average', color: 'red', emoji: '😡' };
  return { text: 'No Data', color: 'gray', emoji: '❓' };
};

const PlaceResultsMobile = ({ placesData = [], selectedCareType = 'Hospital', onCompare = () => {} }) => {
  return (
    <div className="mobile-results-container" style={{
      maxWidth: 480,
      margin: '0 auto',
      padding: 0,
      background: '#fff',
      borderRadius: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      border: '2px solid #3B82F6',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 20px 8px 20px',
        borderBottom: '1px solid #eee',
        fontWeight: 600,
        fontSize: 20,
      }}>
        Hospitals
        <button style={{ background: 'none', border: 'none', fontSize: 24, color: '#888', cursor: 'pointer' }}>&times;</button>
      </div>
      <div style={{ padding: '0 8px 16px 8px' }}>
        {placesData.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>No valid results</div>
        )}
        {placesData.map((place, i) => {
          const inf = place['Infection Rating'];
          const infObj = infectionLabel(inf);
          return (
            <div key={i} className="mobile-result-card" style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              margin: '16px 0',
              padding: '18px 16px',
              border: '1px solid #eee',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 2 }}>{place.name}</div>
              <div style={{ color: '#666', fontSize: 14 }}>{place.address}</div>
              <div style={{ color: '#666', fontSize: 14 }}>{formatPhoneNumber(place.phone_number)}</div>
              <div style={{ color: '#666', fontSize: 13, marginBottom: 2 }}>
                {place.distance && <span>{place.distance} mi</span>}
                {place.time && <span> &bull; {place.time} min</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 500, fontSize: 15 }}>Patient Rating</span>
                  <span>{getHCAHPSStars(place['Summary star rating'] || 0, 5)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 500, fontSize: 15 }}>Infections</span>
                  <span style={{ fontSize: 22 }}>{infObj.emoji}</span>
                  <span style={{ color: infObj.color, fontWeight: 600, fontSize: 15 }}>{infObj.text}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <ViewOnGoogleMapsButton url={addressToUrl(place.address[0] || place.address)} />
                <button
                  style={{
                    background: '#ede9fe',
                    color: '#7c3aed',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 18px',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                  }}
                  onClick={() => onCompare(place)}
                >
                  Compare
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlaceResultsMobile; 