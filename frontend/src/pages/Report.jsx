import { useEffect, useState } from "react";

const PLANTS = [
  "Apple",
  "Blueberry",
  "Cherry",
  "Corn",
  "Grape",
  "Orange",
  "Peach",
  "Pepper Bell",
  "Potato",
  "Raspberry",
  "Soybean",
  "Squash",
  "Strawberry",
  "Tomato",
];

const DISEASES = [
  "Cedar Apple Rust",
  "Powdery Mildew",
  "Common Rust",
  "Leaf Blight",
  "Gray Leaf Spot",
  "Black Rot",
  "Esca",
  "Huanglongbing",
  "Bacterial Spot",
  "Early Blight",
  "Leaf Scorch",
  "Septoria Leaf Spot",
  "Mosaic Virus",
  "Yellow Leaf Curl Virus",
  "Spider Mites",
];

function Report() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);

  const [date, setDate] = useState("");
  const [plant, setPlant] = useState("");
  const [disease, setDisease] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("reports")) || [];
    setReports(stored);
    setFilteredReports(stored);
  }, []);

  useEffect(() => {
    let data = [...reports];

    if (date) data = data.filter(r => r.date === date);
    if (plant) data = data.filter(r => r.plant === plant);
    if (disease) data = data.filter(r => r.disease === disease);

    setFilteredReports(data);
  }, [date, plant, disease, reports]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f5",
        padding: "50px 40px",
      }}
    >
      <h1 style={{ marginBottom: "30px", color: "#1b5e20" }}>
        Analysis Reports
      </h1>

      {/* FILTERS */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "35px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={filterStyle}
        />

        <select
          value={plant}
          onChange={(e) => setPlant(e.target.value)}
          style={filterStyle}
        >
          <option value="">All Plants</option>
          {PLANTS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={disease}
          onChange={(e) => setDisease(e.target.value)}
          style={filterStyle}
        >
          <option value="">All Diseases</option>
          {DISEASES.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* REPORT LIST */}
      {filteredReports.length === 0 ? (
        <p style={{ color: "#555" }}>No reports found.</p>
      ) : (
        filteredReports.map((r, i) => (
          <div key={i} style={cardStyle}>
            <div style={accentBar} />

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", color: "#777" }}>
                {r.date}
              </div>

              <div style={{ fontSize: "18px", fontWeight: "600" }}>
                {r.plant}
              </div>

              <div style={{ color: "#444" }}>
                {r.disease}
              </div>
            </div>

            <div style={confidenceBadge}>
              {r.confidence}%
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ===== STYLES ===== */

const filterStyle = {
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px",
};

const cardStyle = {
  display: "flex",
  alignItems: "center",
  background: "white",
  borderRadius: "10px",
  padding: "18px",
  marginBottom: "16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const accentBar = {
  width: "6px",
  height: "100%",
  background: "#2e7d32",
  borderRadius: "4px",
  marginRight: "16px",
};

const confidenceBadge = {
  background: "#e8f5e9",
  color: "#1b5e20",
  padding: "8px 14px",
  borderRadius: "20px",
  fontWeight: "600",
};

export default Report;


