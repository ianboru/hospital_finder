import React, { useEffect, useState } from "react";
import "./LocationRow.css";

const ViewOnGoogleMapsButton = (props) => {
  const style = {
    border: "1px solid #7C51B2",
    padding: 5,
    borderRadius: 10,
    backgroundColor: "#ede7f6",
    marginTop: 5,
    marginBottom: 5,
    width: "fit-content",
    color: "#7C51B2",
  };
  const onGoogleMaps = () => {
    window.open(props.url, "_blank");
  };
  return (
    <button className="lr-btn lr-maps" onClick={onGoogleMaps}>
      <span role="img" aria-label="maps">
        📍
      </span>{" "}
      Google Maps
    </button>
  );
};

export default ViewOnGoogleMapsButton;
