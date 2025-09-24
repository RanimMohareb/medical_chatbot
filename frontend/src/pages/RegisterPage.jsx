import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
        dob,
        gender,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.user.name);
      navigate("/chat");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ color: "#528BC8", textAlign: "center", marginBottom: "20px" }}>
          Create Your Account
        </h2>

        <form onSubmit={handleRegister} style={styles.form}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            style={styles.input}
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            style={styles.input}
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={styles.input}
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            style={styles.input}
            required
          />
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            style={styles.input}
            required
          />
          <select value={gender} onChange={(e) => setGender(e.target.value)} style={styles.input} required>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <button type="submit" style={styles.button}>
            Register
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>Login here</Link>
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
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "12px 16px",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    padding: "12px",
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
