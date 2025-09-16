import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Default landing page */}
        <Route path="/" element={<LoginPage />} />
        {/* Login page route */}
        <Route path="/login" element={<LoginPage />} />
        {/* Register page route */}
        <Route path="/register" element={<RegisterPage />} />
        {/* Chat page route (protected by user state) */}
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}
