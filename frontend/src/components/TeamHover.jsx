import { useState } from "react";

function TeamHover() {
  const [show, setShow] = useState(false);

  return (
    <div
      style={{
        position: "absolute",
        top: "30px",
        right: "40px",
        zIndex: 1000,
      }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {/* Project Team Label */}
      <div
        style={{
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "14px",
          letterSpacing: "0.5px",
          backgroundColor: "white",
          color: "#2e7d32",
          padding: "6px 14px",
          borderRadius: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        Project Team
      </div>

      {show && (
        <div
          style={{
            marginTop: "12px",
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "18px",
            boxShadow: "0 15px 40px rgba(0,0,0,0.12)",
            width: "300px",
            transition: "all 0.2s ease-in-out",
          }}
        >
          <div
            style={{
              lineHeight: "1.9",
              fontSize: "14px",
              color: "#1b5e20",
              fontWeight: "500",
            }}
          >
            <div><strong>Sara Alzaabi</strong> – 2022005404</div>
            <div><strong>Abdlrahman Kamal</strong> – 2022005479</div>
            <div><strong>Enad Alhebsi</strong> – 2021005243</div>
            <div><strong>Haya Alnuaimi</strong> – 2022005558</div>
            <div><strong>Heyam Hussein</strong> – 2022005600</div>
            <div><strong>Shamma Alnuaimi</strong> – 2022005597</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamHover;

