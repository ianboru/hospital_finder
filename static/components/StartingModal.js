import React, { useState } from "react";

const careTypes = ["Hospital", "Clinic", "Nursing Home", "Urgent Care"];

export default function StartingModal() {
  const [selectedCareType, setSelectedCareType] = useState("Care Type");
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  return (

    <div style={{
      position: "absolute",
      top: "10px",
      left: "10px",
      zIndex: "1001",
      background: "rgba(255, 255, 255, 0.9)",
      borderRadius: "10px",
      padding: "10px",
      width: "370px",
      height: "20px",
      display: "flex",
    }}>
      <div style={{ position: "relative" }}>
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ width: "100%", padding: "8px", border: "1px solid #ccc", background: "white", cursor: "pointer" }}
        >
          {selectedCareType} ▼
        </button>
        {showDropdown && (
          <ul style={{ listStyle: "none", padding: "0", margin: "0", position: "absolute", width: "100%", background: "white", border: "1px solid #ccc", zIndex: 1 }}>
            {careTypes.map((type) => (
              <li
                key={type}
                style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid #eee" }}
                onClick={() => { setSelectedCareType(type); setShowDropdown(false); }}
              >
                {type}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ marginTop: "16px" }}>
        <input
          type="text"
          placeholder="Type facility name or location here"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "8px", border: "1px solid #ccc" }}
        />
      </div>
    </div>
  );
}
