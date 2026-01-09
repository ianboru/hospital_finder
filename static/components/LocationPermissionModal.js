import React from "react";
import "./LocationPermissionModal.css";

const LocationPermissionModal = ({ isOpen, onClose, onRetry }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleOpenSettings = () => {
        // Provide instructions for mobile browsers - focus on clearing cached permission
        alert(
            "To enable location access:\n\n" +
            "iPhone/iPad (Safari):\n" +
            "1. Open Settings app on your device\n" +
            "2. Go to Privacy & Security\n" +
            "3. Tap Location Services\n" +
            "4. Scroll down and tap 'Safari Websites'\n" +
            "5. Make sure it's set to 'Ask' or 'While Using'\n" +
            "6. Return to Safari and reload this page\n\n" +
            "Android Chrome:\n" +
            "1. Tap the lock icon in the address bar\n" +
            "2. Tap 'Permissions'\n" +
            "3. Change Location to 'Allow'\n" +
            "4. Reload the page"
        );
    };

    const handleEnableClick = () => {
        console.log("🔵 Enable button clicked, calling onRetry...");
        onRetry();
    };

    return (
        <div className="location-permission-overlay" onClick={handleOverlayClick}>
            <div className="location-permission-modal">
                <div className="location-permission-header">
                    <h2 className="location-permission-title">📍 Location Access Required</h2>
                    <button className="location-permission-close" onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className="location-permission-content">
                    <p className="location-permission-message">
                        This app needs access to your location to find nearby hospitals and healthcare facilities.
                    </p>
                    <p className="location-permission-submessage">
                        Safari has blocked location access for this site. Tap "How to Enable" below for instructions to reset the permission.
                    </p>
                    <div className="location-permission-buttons">
                        <button
                            className="location-permission-retry-btn"
                            onClick={handleEnableClick}
                        >
                            Enable
                        </button>
                        <button
                            className="location-permission-settings-btn"
                            onClick={handleOpenSettings}
                        >
                            How to Enable
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationPermissionModal;
