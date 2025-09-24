import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.user.name);
      navigate("/chat");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo + Title */}
        <div style={styles.title}>
          <img src="/logo192.png" alt="logo" style={{ width: "40px", marginRight: "10px" }} />
          <h1 style={{ color: "#528BC8", fontSize: "1.9rem", fontWeight: "bold", margin: 0 }}>
            MediBot Assistant
          </h1>
        </div>

        <h2 style={{ textAlign: "center", fontSize: "1.3rem", marginBottom: "1rem" }}>Login</h2>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            required
          />
          <input
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
          />
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        <p style={{ marginTop: "1rem", textAlign: "center" }}>
          Don’t have an account?{" "}
          <Link to="/register" style={styles.link}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
   container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f4f4",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "white",
    padding: "50px 40px",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "550px",
  },
  title: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "10px 15px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
    transition: "0.3s",
  },
  button: {
    padding: "10px",
    fontSize: "1rem",
    backgroundColor: "#528BC8",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "0.3s",
  },
  link: {
    color: "#528BC8",
    fontWeight: "500",
    textDecoration: "none",
  }
};
