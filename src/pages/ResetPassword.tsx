import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("resetEmail");
    if (!email) {
      navigate("/forgot-password");
    }
  }, []);

  const resetPassword = async () => {
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    const email = localStorage.getItem("resetEmail");

    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
      alert("Password changed successfully");
      localStorage.removeItem("resetEmail");
      navigate("/");
    } else {
      alert("Failed to reset password");
    }
  };

  return (
    <>
      <Navbar />

      <div style={pageWrapper}>
        <div style={card}>
          <h2 style={title}>Set New Password</h2>

          <p style={subtitle}>
            Create a strong password to secure your account
          </p>

          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />

          <button style={btn} onClick={resetPassword}>
            Update Password
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ResetPassword;

/* ================= STYLES ================= */

const pageWrapper: React.CSSProperties = {
  minHeight: "calc(100vh - 140px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#ffffff",
  padding: "20px"
};

const card: React.CSSProperties = {
  width: 400,
  background: "#ffffff",
  padding: 40,
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  textAlign: "center"
};

const title: React.CSSProperties = {
  marginBottom: 10,
  fontSize: 24,
  fontWeight: 700,
  color: "#1F2D2A"
};

const subtitle: React.CSSProperties = {
  fontSize: 14,
  marginBottom: 25,
  color: "#4A5A56"
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 12,
  marginBottom: 20,
  borderRadius: 8,
  border: "1px solid #D8CFC1",
  fontSize: 14,
  outline: "none"
};

const btn: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "none",
  background: "#45A98F",
  color: "#fff",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer"
};