import { useState, useRef, useEffect } from "react";

function Chat() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Hello. I can help with plant diseases, treatments, care, and definitions. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("http://127.0.0.1:4000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "The server is not responding. Please check if the backend is running.",
        },
      ]);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #1b5e20, #2e7d32)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          height: "90vh",
          backgroundColor: "#e8f5e9",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "18px",
            backgroundColor: "#2e7d32",
            color: "white",
            fontSize: "20px",
            fontWeight: "bold",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        >
          Plant Assistant
        </div>

        {/* CHAT AREA */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent:
                  msg.sender === "user" ? "flex-end" : "flex-start",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: "14px 18px",
                  borderRadius: "14px",
                  backgroundColor:
                    msg.sender === "user" ? "#2e7d32" : "#ffffff",
                  color:
                    msg.sender === "user" ? "white" : "#1b5e20",
                  fontSize: "15px",
                  lineHeight: "1.4",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* INPUT */}
        <div
          style={{
            display: "flex",
            padding: "16px",
            borderTop: "1px solid #c8e6c9",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about plants, diseases, or treatments..."
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "20px",
              border: "1px solid #a5d6a7",
              outline: "none",
              fontSize: "14px",
            }}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            style={{
              marginLeft: "10px",
              padding: "0 22px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "#2e7d32",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
