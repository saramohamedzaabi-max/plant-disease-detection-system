import { useNavigate } from "react-router-dom";

function Choose() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4fdf6",
        padding: "60px 40px",
        position: "relative",
      }}
    >
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "30px",
          left: "40px",
          padding: "10px 22px",
          backgroundColor: "white",
          color: "#2e7d32",
          border: "2px solid #2e7d32",
          borderRadius: "25px",
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        ← Back
      </button>

      <h1
        style={{
          textAlign: "center",
          color: "#2e7d32",
          marginBottom: "60px",
        }}
      >
        Choose Detection Method
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "60px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* UPLOAD CARD */}
        <div
          onClick={() => navigate("/upload")}
          style={{
            flex: 1,
            backgroundColor: "white",
            padding: "50px",
            borderRadius: "20px",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            transition: "0.3s",
          }}
        >
          <h2 style={{ color: "#2e7d32" }}>Upload Image</h2>
          <p style={{ marginTop: "20px", color: "#555" }}>
            Select a leaf image from your device to analyze plant disease.
          </p>
        </div>

        {/* CAMERA CARD */}
        <div
          onClick={() => navigate("/camera")}
          style={{
            flex: 1,
            backgroundColor: "white",
            padding: "50px",
            borderRadius: "20px",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            transition: "0.3s",
          }}
        >
          <h2 style={{ color: "#2e7d32" }}>Use Camera</h2>
          <p style={{ marginTop: "20px", color: "#555" }}>
            Capture a real-time image of the leaf using your camera.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Choose;
