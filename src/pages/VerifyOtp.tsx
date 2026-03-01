import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("resetEmail");
    if (!email) {
      navigate("/forgot-password");
    }
  }, []);

  const verifyOtp = async () => {
    if (!otp) {
      alert("Please enter OTP");
      return;
    }

    const email = localStorage.getItem("resetEmail");

    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json();

    if (data.success) {
      navigate("/reset-password");
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <>
      <Navbar />

      <div style={pageWrapper}>
        <div style={card}>
          <h2 style={title}>Verify OTP</h2>

          <p style={subtitle}>
            Enter the 6-digit OTP sent to your email
          </p>

          <input
            type="text"
            maxLength={6}
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={input}
          />

          <button style={btn} onClick={verifyOtp}>
            Verify OTP
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default VerifyOtp;

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
  outline: "none",
  textAlign: "center",
  letterSpacing: 4
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