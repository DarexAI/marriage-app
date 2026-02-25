import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SuperAdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/super-admin/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.msg);
        return;
      }

      localStorage.setItem("superAdminToken", data.token);
      localStorage.setItem("superAdmin", JSON.stringify(data.admin));

      navigate("/super-admin/dashboard");

    } catch {
      alert("Login failed");
    }
  };

  return (
    <>
    <Navbar/>
    <div
      style={{
        minHeight: "100vh",
paddingTop: "80px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6f9"
      }}
      >
      <div
        style={{
          width: 400,
          padding: 30,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}
        >
        <h2 style={{ textAlign: "center" ,color:"black"}}>Sign In</h2>
        <p style={{ textAlign: "center", color: "#666" }}>
          Access Super Admin Panel
        </p>

        <label style={{color:"black"}}>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={input}
        />

        <label style={{color:"black"}}>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={input}
          />

        <button style={btn} onClick={login}>
          Login
        </button>
      </div>
    </div>
    <Footer/>
          </>
  );
};

const input = {
  width: "100%",
  padding: 10,
  margin: "8px 0 18px",
  borderRadius: 8,
  border: "1px solid #ddd",
};

const btn = {
  width: "100%",
  padding: 12,
  background: "#3b6edc",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600
};

export default SuperAdminLogin;