import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Register: React.FC = () => {
  const navigate = useNavigate();

  // STATE ADDED (no UI change)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    aadhaar: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      alert(data.message || "Registered successfully");

      if (data.success) navigate("/login");
    } catch (error) {
      alert("Registration failed");
      console.error(error);
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
        <h2 style={{ textAlign: "center", marginBottom: 5, color: "black" }}>
          Citizen Registration
        </h2>

        <p
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "#555",
            marginBottom: 20,
          }}
          >
          Create your citizen account
        </p>

        <label style={{ color: "black" }}>Full Name</label>
        <input
          name="name"
          placeholder="Enter your full name"
          style={inputStyle}
          onChange={handleChange}
          />

        <label style={{ color: "black" }}>Email Address</label>
        <input
          name="email"
          placeholder="Enter your email"
          style={inputStyle}
          onChange={handleChange}
        />

        <label style={{ color: "black" }}>Mobile Number</label>
        <input
          name="phone"
          placeholder="Enter your mobile number"
          style={inputStyle}
          onChange={handleChange}
        />

        <label style={{ color: "black" }}>Aadhaar Number</label>
        <input
          name="aadhaar"
          placeholder="Enter 12-digit Aadhaar number"
          style={inputStyle}
          onChange={handleChange}
          />

        <label style={{ color: "black" }}>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Create a password"
          style={inputStyle}
          onChange={handleChange}
          />

        <label style={{ color: "black" }}>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          style={inputStyle}
          onChange={handleChange}
          />

        <button
          onClick={handleRegister}
          style={{
            width: "100%",
            background: "#3b6edc",
            border: "none",
            padding: 12,
            borderRadius: 6,
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: 10,
          }}
          >
          Register
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 14,
            color: "#555",
          }}
          >
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{
              color: "#3b6edc",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Sign in
          </span>
        </p>
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
  color: "black",
};

export default Register;
