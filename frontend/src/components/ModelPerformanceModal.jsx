import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ModelPerformanceModal({ onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/dashboard-data")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  }, []);

  if (!data) {
    return (
      <div style={overlayStyle}>
        <div style={modalStyle}>Loading performance data...</div>
      </div>
    );
  }

  const severityData = Object.entries(data.severity_distribution).map(
    ([key, value]) => ({ name: key, value })
  );

  const confidenceData = Object.entries(data.confidence_distribution).map(
    ([key, value]) => ({ range: key, count: value })
  );

  const COLORS = ["#e74c3c", "#f39c12", "#2ecc71"];

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeButtonStyle}>
          ✕
        </button>

        <h2 style={{ textAlign: "center", color: "#2e7d32" }}>
          Model Performance
        </h2>

        {/* Accuracy */}
        <div style={kpiStyle}>
          <h3>Overall Accuracy</h3>
          <h1 style={{ fontSize: "40px", color: "#2e7d32" }}>
            {data.accuracy}%
          </h1>
        </div>

        {/* Charts */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
          {/* Confusion Matrix */}
          <div style={cardStyle}>
            <h4>Confusion Matrix</h4>
            <div style={{ overflowX: "auto", maxHeight: "250px" }}>
              {data.confusion_matrix.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: "flex" }}>
                  {row.map((value, colIndex) => (
                    <div
                      key={colIndex}
                      style={{
                        width: "25px",
                        height: "25px",
                        fontSize: "8px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: `rgba(46,125,50,${
                          value / Math.max(...row || [1])
                        })`,
                        color: "white",
                        margin: "1px",
                      }}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div style={cardStyle}>
            <h4>Severity Distribution</h4>
            <ResponsiveContainer width={300} height={250}>
              <PieChart>
                <Pie data={severityData} dataKey="value" outerRadius={80}>
                  {severityData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Confidence */}
          <div style={cardStyle}>
            <h4>Confidence Distribution</h4>
            <ResponsiveContainer width={300} height={250}>
              <BarChart data={confidenceData}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2e7d32" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "white",
  padding: "30px",
  borderRadius: "20px",
  width: "90%",
  maxWidth: "1000px",
  maxHeight: "90vh",
  overflowY: "auto",
  position: "relative",
};

const closeButtonStyle = {
  position: "absolute",
  top: "15px",
  right: "20px",
  border: "none",
  background: "none",
  fontSize: "18px",
  cursor: "pointer",
};

const cardStyle = {
  backgroundColor: "#f9fff9",
  padding: "15px",
  borderRadius: "15px",
};

const kpiStyle = {
  backgroundColor: "#f4fdf6",
  padding: "15px",
  borderRadius: "15px",
  textAlign: "center",
  marginBottom: "20px",
};

export default ModelPerformanceModal;
