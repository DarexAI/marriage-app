import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const sendOtp = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("resetEmail", email);
      navigate("/verify-otp");
    } else {
      alert(data.message);
    }
  };

  return (
    <>
      <Navbar />

      <div style={pageWrapper}>
        <div style={card}>
          <h2 style={title}>Forgot Password</h2>

          <p style={subtitle}>
            Enter your registered email to receive an OTP
          </p>

          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
          />

          <button style={btn} onClick={sendOtp}>
            Send OTP
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ForgotPassword;

/* ================= STYLES ================= */

const pageWrapper: React.CSSProperties = {
  minHeight: "calc(100vh - 140px)", // adjusts for navbar + footer
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