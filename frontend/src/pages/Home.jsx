import { useNavigate } from "react-router-dom";
import background from "../assets/backgroundd.jpg";
import TeamHover from "../components/TeamHover";

function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        textAlign: "center",
        paddingTop: "180px",
        color: "white",
        position: "relative", // ✅ added for proper positioning
      }}
    >
      {/* ✅ Added Team Hover Component */}
      <TeamHover />

      <h1 style={{ fontSize: "50px" }}>
        IoT-Based Plant Monitoring System
      </h1>

      <button
        onClick={() => navigate("/choose")}
        style={{
          marginTop: "50px",
          padding: "14px 40px",
          fontSize: "20px",
          backgroundColor: "white",
          color: "#2e7d32",
          border: "none",
          borderRadius: "30px",
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
        }}
      >
        Start
      </button>
    </div>
  );
}

export default Home;
