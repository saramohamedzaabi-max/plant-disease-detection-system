import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ModelPerformanceModal from "../components/ModelPerformanceModal";

function Camera() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [capturedImage, setCapturedImage] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // AUTO START CAMERA
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      alert("Unable to access camera.");
      console.error(error);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      setImageBlob(blob);
      setCapturedImage(URL.createObjectURL(blob));
      stopCamera();
    }, "image/jpeg");
  };

  const analyzeImage = async () => {
    if (!imageBlob) return;

    const formData = new FormData();
    formData.append("file", imageBlob);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:4000/predict",
        formData
      );
      setPrediction(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setPrediction(null);
    setImageBlob(null);
    startCamera();
  };

  const getSeverityColor = (level) => {
    if (level === "High") return "#e74c3c";
    if (level === "Moderate") return "#f39c12";
    return "#2ecc71";
  };

  const downloadPDF = async () => {
    const response = await fetch("http://localhost:4000/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: new Date().toLocaleDateString(),
        plant: prediction.class_name.split(" ")[0],
        disease: prediction.class_name,
        confidence: prediction.confidence,
        advice: prediction.advice,
      }),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plant_disease_report.pdf";
    a.click();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4fdf6",
        padding: "60px 40px",
        position: "relative",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/choose")}
        style={{
          position: "absolute",
          top: "30px",
          left: "40px",
          backgroundColor: "white",
          border: "1px solid #2e7d32",
          color: "#2e7d32",
          padding: "8px 18px",
          borderRadius: "20px",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <h1 style={{ textAlign: "center", color: "#2e7d32" }}>
        Capture Leaf Image
      </h1>

      <div
        style={{
          display: "flex",
          gap: "40px",
          marginTop: "50px",
          maxWidth: "1200px",
          marginInline: "auto",
        }}
      >
        {/* LEFT CARD */}
        <div
          style={{
            flex: 1,
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "20px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            textAlign: "center",
          }}
        >
          {!capturedImage && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "400px",
                  backgroundColor: "black",
                  borderRadius: "15px",
                  objectFit: "cover",
                }}
              />

              <button
                onClick={captureImage}
                style={{
                  marginTop: "20px",
                  padding: "12px 30px",
                  backgroundColor: "#2e7d32",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Capture
              </button>
            </>
          )}

          {capturedImage && (
            <>
              <img
                src={capturedImage}
                alt="Captured"
                style={{
                  width: "100%",
                  height: "400px",
                  objectFit: "cover",
                  borderRadius: "15px",
                }}
              />

              <div style={{ marginTop: "20px" }}>
                <button
                  onClick={analyzeImage}
                  style={{
                    padding: "12px 30px",
                    backgroundColor: "#2e7d32",
                    color: "white",
                    border: "none",
                    borderRadius: "25px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    marginRight: "10px",
                  }}
                >
                  {loading ? "Analyzing..." : "Detect Disease"}
                </button>

                <button
                  onClick={retake}
                  style={{
                    padding: "12px 30px",
                    backgroundColor: "#ecf0f1",
                    color: "#2e7d32",
                    border: "none",
                    borderRadius: "25px",
                    cursor: "pointer",
                  }}
                >
                  Retake
                </button>
              </div>
            </>
          )}

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        {/* RIGHT CARD */}
        {prediction && (
          <div
            style={{
              flex: 1,
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            }}
          >
            <h2 style={{ color: "#2e7d32" }}>Analysis Result</h2>

            <p><strong>Disease:</strong> {prediction.class_name}</p>

            {/* Confidence Progress */}
            <div style={{ marginTop: "15px" }}>
              <strong>Confidence:</strong>
              <div
                style={{
                  marginTop: "8px",
                  backgroundColor: "#ecf0f1",
                  borderRadius: "20px",
                  height: "20px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${prediction.confidence}%`,
                    backgroundColor: "#2e7d32",
                    height: "100%",
                    transition: "width 0.5s ease",
                  }}
                ></div>
              </div>
              <p style={{ marginTop: "5px" }}>{prediction.confidence}%</p>
            </div>

            <p>
              <strong>Severity:</strong>{" "}
              <span
                style={{
                  color: getSeverityColor(prediction.severity),
                  fontWeight: "bold",
                }}
              >
                {prediction.severity}
              </span>
            </p>

            {prediction.healthy_image && (
              <>
                <h3 style={{ marginTop: "25px", color: "#2e7d32" }}>
                  Healthy Reference
                </h3>
                <img
                  src={prediction.healthy_image}
                  alt="Healthy"
                  style={{
                    width: "100%",
                    maxHeight: "250px",
                    objectFit: "cover",
                    borderRadius: "15px",
                    marginTop: "10px",
                  }}
                />
              </>
            )}

            <div
              style={{
                marginTop: "25px",
                backgroundColor: "#e8f5e9",
                padding: "15px",
                borderRadius: "15px",
              }}
            >
              <strong>Expert Advice:</strong>
              <p style={{ marginTop: "10px", lineHeight: "1.6" }}>
                {prediction.advice}
              </p>
            </div>

            {/* Action Buttons */}
            <button
              onClick={downloadPDF}
              style={{
                marginTop: "20px",
                padding: "12px 30px",
                backgroundColor: "#2e7d32",
                color: "white",
                border: "none",
                borderRadius: "25px",
                cursor: "pointer",
                fontWeight: "bold",
                marginRight: "10px",
              }}
            >
              Download Report (PDF)
            </button>

            <button
              onClick={() => setShowModal(true)}
              style={{
                marginTop: "20px",
                padding: "12px 30px",
                backgroundColor: "white",
                border: "2px solid #2e7d32",
                color: "#2e7d32",
                borderRadius: "25px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              View Model Performance
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <ModelPerformanceModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

export default Camera;
