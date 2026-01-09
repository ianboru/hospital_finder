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
            "Safari has blocked location for this site. To fix:\n\n" +
            "iPhone/iPad (Safari):\n" +
            "1. Tap the 'AA' or 'aA' icon in the Safari address bar\n" +
            "2. Tap 'Website Settings'\n" +
            "3. Tap 'Location' and select 'Ask' or 'Allow'\n" +
            "4. Reload this page\n\n" +
            "If that doesn't work:\n" +
            "1. Open Settings app > Safari\n" +
            "2. Scroll down and tap 'Advanced'\n" +
            "3. Tap 'Website Data'\n" +
            "4. Search for this site and swipe to delete\n" +
            "5. Return to Safari and reload\n\n" +
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
