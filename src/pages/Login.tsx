import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Login: React.FC = () => {
  const [role, setRole] = useState("citizen");
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("applicant", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <>
    <Navbar/>
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6f9",
        fontFamily: "Segoe UI",
        color: "black",
      }}
      >
      <div
        style={{
          width: 380,
          background: "white",
          padding: 30,
          borderRadius: 12,
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        }}
        >
        <h2 style={{ textAlign: "center", marginBottom: 5 }}>
          Sign In
        </h2>

        <p style={{ textAlign: "center", marginBottom: 20 }}>
          Access your marriage registration portal
        </p>

        <div style={{ display: "flex", marginBottom: 20 }}>
          <button
            onClick={() => setRole("citizen")}
            style={{
              flex: 1,
              padding: 10,
              border: "none",
              background: role === "citizen" ? "#3b6edc" : "#eee",
              color: role === "citizen" ? "white" : "black",
            }}
          >
            Citizen
          </button>

          <button
            onClick={() => setRole("admin")}
            style={{
              flex: 1,
              padding: 10,
              border: "none",
              background: role === "admin" ? "#3b6edc" : "#eee",
              color: role === "admin" ? "white" : "black",
            }}
            >
            Super Admin
          </button>
        </div>

        <label>Email Address</label>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            background: "#28c76f",
            border: "none",
            padding: 12,
            borderRadius: 6,
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
          >
          Sign In
        </button>

        <p style={{ textAlign: "center", marginTop: 20 }}>
          Don't have an account?
        </p>

        <button
          onClick={() => navigate("/register")}
          style={{
            width: "100%",
            background: "#eee",
            border: "none",
            padding: 10,
            borderRadius: 6,
          }}
          >
          Register as Citizen
        </button>
      </div>
    </div>
    <Footer/>
</>
  );
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
  marginBottom: 15,
  background: "#f5f6f8",
};

export default Login;
