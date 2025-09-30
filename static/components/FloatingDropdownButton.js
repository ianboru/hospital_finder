import React, { useState, useRef, useEffect } from 'react';
import './FloatingDropdownButton.css';

const FloatingDropdownButton = ({
  label,
  icon = '▼',
  children,
  onOpen,
  onClose,
  closeOnSelect = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState && onOpen) onOpen();
    if (!newState && onClose) onClose();
  };

  const handleClose = () => {
    if (closeOnSelect) {
      setIsOpen(false);
      if (onClose) onClose();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (onClose) onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile overlay background */}
      {isOpen && (
        <div className="floating-dropdown-overlay" onClick={handleClose} />
      )}

      <div className="floating-dropdown-container" ref={dropdownRef}>
        <button
          className={`floating-dropdown-btn ${isOpen ? 'active' : ''}`}
          onClick={handleToggle}
        >
          <span className="floating-dropdown-icon">{icon}</span>
          <span className="floating-dropdown-label">{label}</span>
        </button>

        {isOpen && (
          <div className="floating-dropdown-content">
            {React.cloneElement(children, { onSelect: handleClose })}
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingDropdownButton;