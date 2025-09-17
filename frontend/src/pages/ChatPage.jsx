import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [username, setUsername] = useState(localStorage.getItem("username") || "Guest");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
    else fetchHistory();
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/api/history", { username });
      setHistory(res.data.history);
    } catch (err) {
      console.error("History error:", err);
    }
  };

  const sendMessage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:5000/api/chat", { prompt, username });
      setPrompt("");
      await fetchHistory();
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const clearChatHistory = async () => {
    try {
     await axios.post("http://localhost:5000/api/clear_history", {
       username,
     });
     setHistory([]); // Clear from frontend
    } catch (err) {
     console.error("Error clearing chat history:", err);
    }
  };


  return (
    <div className="container">
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#ffffff",
        padding: "20px 30px",
        borderBottom: "1px solid #eee",
        marginBottom: "1rem",
        borderRadius: "10px",
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo192.png" alt="logo" style={{ width: "40px", marginRight: "10px" }} />
          <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#2e7d32" }}>
            MediBot Assistant
          </h1>
        </div>
        <div>
          <button
            onClick={clearChatHistory}
            style={{
              background: "#ffc107", color: "#000",
              marginRight: "12px", padding: "10px 20px",
              borderRadius: "8px", border: "none", cursor: "pointer",
              fontSize: "1rem", fontWeight: "600"
            }}
          >
            🔄 Clear
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "#f44336", color: "#fff",
              padding: "10px 20px", borderRadius: "8px",
              border: "none", cursor: "pointer",
              fontSize: "1rem", fontWeight: "600"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Centered Hello */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <p style={{ fontSize: "1.4rem" }}>
          Hello, <strong>{username}</strong>!
        </p>
      </div>

      {/* Chatbox */}
      <div className="chat-box" style={{ maxHeight: "60vh", overflowY: "auto", marginBottom: "20px" }}>
        {history.map((chat, i) => (
          <div className="chat-pair" key={i}>
            <div className="chat user">
              <strong>🧑 </strong> {chat.prompt}
            </div>
            <div className="chat bot">
              <strong>🤖 </strong> {chat.response}
            </div>
            <div className="timestamp">
              🕒{" "}
              {new Date(chat.timestamp).toLocaleString("en-US", {
                weekday: "short", month: "short", day: "numeric",
                hour: "numeric", minute: "2-digit", hour12: true
              })}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat bot">
            <strong>🤖 </strong>
            <span className="typing"><span>.</span><span>.</span><span>.</span></span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input + Send BELOW (same width) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
      >
        <input
          type="text"
          placeholder="Enter your symptoms..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "700px",
            padding: "12px 16px",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginBottom: "12px",
            boxSizing: "border-box"
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            maxWidth: "700px",
            padding: "12px 16px",
            fontSize: "1rem",
            fontWeight: "bold",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxSizing: "border-box"
          }}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>
    </div>
  );
}
