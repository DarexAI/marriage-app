import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const OfficerLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await fetch(
      "http://localhost:5000/api/officer-auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      }
    );

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("officer", JSON.stringify(data.officer));
      localStorage.setItem("token", data.token);
      navigate("/officer");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <>
    <Navbar/>
    <div style={page}>
      <div style={card}>
        <h2 style={title}>Sign In</h2>
        <p style={subtitle}>
          Access marriage registration officer portal
        </p>

        {/* Officer Tag */}
        <div style={tag}>
          Officer Login
        </div>

        <label style={label}>Email Address</label>
        <input
          style={input}
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          />

        <label style={label}>Password</label>
        <input
          type="password"
          style={input}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          />

        <button style={btn} onClick={login}>
          Sign In
        </button>
      </div>
    </div>
    <Footer/>
</>
  );
};

export default OfficerLogin;

/* ===== STYLES ===== */

const page: React.CSSProperties = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background:
  "linear-gradient(135deg,#eef2f3,#dfe9f3)",
  fontFamily: "Segoe UI"
};

const card: React.CSSProperties = {
  width: 380,
  background: "#fff",
  padding: 30,
  borderRadius: 14,
  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
  textAlign: "center"
};

const title: React.CSSProperties = {
  marginBottom: 5,
  color: "black"
};

const subtitle: React.CSSProperties = {
  marginBottom: 20,
  color: "#555"
};

const tag: React.CSSProperties = {
  background: "#3b6edc",
  color: "#fff",
  padding: "8px 16px",
  borderRadius: 8,
  marginBottom: 20,
  display: "inline-block",
  fontWeight: 600
};

const label: React.CSSProperties = {
  display: "block",
  textAlign: "left",
  marginBottom: 5,
  marginTop: 10,
  fontWeight: 600,
  color: "black"
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #ddd",
  marginBottom: 10,
  fontSize: 14
};

const btn: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "none",
  background: "#35b768",
  color: "#fff",
  fontWeight: 600,
  fontSize: 16,
  cursor: "pointer",
  marginTop: 10
};
