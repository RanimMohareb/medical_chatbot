import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "Guest"
  );
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
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
      const res = await axios.post(
        "http://127.0.0.1:5000/api/history",
        { username }
      );
      setHistory(res.data.history);
    } catch (err) {
      console.error("History error:", err);
    }
  };

  const sendMessage = async () => {
    if (!prompt.trim()) return;

    // Add user message immediately
    setHistory((prev) => [
      ...prev,
      {
        prompt: prompt,
        response: null,
        timestamp: new Date().toISOString(),
      },
    ]);

    // Add bot thinking placeholder
    setHistory((prev) => [
      ...prev,
      {
        prompt: null,
        response: "...",
        timestamp: new Date().toISOString(),
      },
    ]);

    setPrompt("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/api/chat",
        {
          prompt,
          username,
        }
      );

      const botReply = res.data.response;

      setHistory((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          prompt: null,
          response: botReply,
          timestamp: new Date().toISOString(),
        };
        return updated;
      });
    } catch (err) {
      console.error(err);
      setHistory((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          prompt: null,
          response: "Sorry, something went wrong.",
          timestamp: new Date().toISOString(),
        };
        return updated;
      });
    }

    setLoading(false);
    scrollToBottom();
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
    <div
      className="container"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1000,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#ffffff",
          padding: "10px 30px",
          borderBottom: "1px solid #eee",
          borderRadius: "10px",
          boxSizing: "border-box",
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "nowrap",
            gap: "12px",
          }}
        >
          <img
            src="/logo192.png"
            alt="logo"
            style={{ width: "40px", marginRight: "10px" }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: "1.8rem",
              color: "#528BC8",
            }}
          >
            MediBot Assistant
          </h1>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "nowrap",
            gap: "12px",
          }}
        >
          <button
            onClick={clearChatHistory}
            style={{
              background: "#4CAF50",
              color: "#fff",
              whiteSpace: "nowrap",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
            }}
          >
            🔄 Clear
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "#f44336",
              color: "#fff",
              whiteSpace: "nowrap",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Hello User block */}
      <div
        style={{
          position: "fixed",
          top: "60px",
          left: 0,
          width: "100%",
          background: "#fff",
          zIndex: 999,
          textAlign: "center",
          padding: "10px 0",
          borderBottom: "1px solid #eee",
        }}
      >
        <p style={{ fontSize: "1.4rem", margin: 0 }}>
          Hello, <strong>{username}</strong>!
        </p>
      </div>

      {/* Disclaimer */}
      {showDisclaimer && (
        <div
          style={{
            position: "fixed",
            top: "110px",
            left: 0,
            width: "100%",
            backgroundColor: "#ffeeba",
            color: "#856404",
            padding: "10px 20px",
            textAlign: "center",
            zIndex: 9999,
            borderBottom: "1px solid #856404",
          }}
        >
          <p style={{ margin: 0 }}>
            ⚠️ MediBot does not replace professional medical advice. Always
            consult a doctor.
          </p>
          <button
            onClick={() => setShowDisclaimer(false)}
            style={{
              marginTop: "8px",
              padding: "6px 12px",
              background: "#856404",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            OK
          </button>
        </div>
      )}

      {/* Chat box */}
      <div
        className="chat-box"
        style={{
          flexGrow: 1,
          overflowY: "auto",
          paddingTop: showDisclaimer ? "200px" : "140px", // adjust for fixed header + disclaimer
          paddingBottom: "100px",
        }}
      >
        {history.map((chat, i) => (
          <div className="chat-pair" key={i}>
            {chat.prompt && (
              <>
                <div
                  className="timestamp"
                  style={{ marginBottom: "8px" }}
                >
                  🕒{" "}
                  {new Date(chat.timestamp).toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
                <div
                  className="chat user"
                  style={{
                    backgroundColor: "#C6D9EE",
                  }}
                >
                  <strong>🧑 </strong> {chat.prompt}
                </div>
              </>
            )}

            {chat.response && chat.response !== "..." && (
              <>
                <div
                  className="timestamp"
                  style={{ marginBottom: "8px" }}
                >
                  🕒{" "}
                  {new Date(chat.timestamp).toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
                <div
                  className="chat bot"
                  dangerouslySetInnerHTML={{
                    __html:
                      "🩺 " +
                      chat.response.replace(/\n/g, "<br>"),
                  }}
                ></div>
              </>
            )}

            {chat.response === "..." && (
              <div className="chat bot">
                <strong>🤖 </strong>
                <span className="typing">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input + Send */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "#fff",
          zIndex: 999,
          padding: "10px 20px",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
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
            boxSizing: "border-box",
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
            backgroundColor: "#528BC8",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>
    </div>
  );
}
