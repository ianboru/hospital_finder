import React from "react";
import "./InfoModal.css";

const InfoModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="info-modal-overlay" onClick={handleOverlayClick}>
      <div className="info-modal">
        <div className="info-modal-header">
          <h2 className="info-modal-title">{title}</h2>
          <button className="info-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="info-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default InfoModal;