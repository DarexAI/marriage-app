// import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Home = () => {
  const navigate = useNavigate();
 const [hoveredStat, setHoveredStat] = useState<string | null>(null);
type Official = {
  id: number;
  name: string;
  designation: string;
  image: string;
};

const captureFingerprint = async () => {
  try {
    const response = await fetch("https://127.0.0.1:11100/rd/capture", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml"
      },
      body: `<?xml version="1.0"?>
<Capture pidVer="2.0" timeout="10000" env="P">
  <Opts fCount="1" fType="2" iCount="0" format="0" pidVer="2.0"/>
  <Demo/>
  <CustOpts/>
</Capture>`
    });

    const pidXml = await response.text();

    console.log("PID XML:", pidXml);

    // Optional: check if capture failed
    if (!pidXml.includes("<PidData")) {
      alert("Capture failed");
      return;
    }

    await fetch("https://applogix.cloud/api/store-pid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ pidXml })
    });

    alert("Fingerprint captured and stored ✅");

  } catch (error) {
    console.error("Capture error:", error);
    alert("RD not reachable");
  }
};

const officials: Official[] = [
  {
    id: 1,
    name: "Dr. Dhiraj Chavan",
    designation: "Additional Commissioner",
    image: "./p2.jpg",
  },
  {
    id: 2,
    name: "Mr. Anant Javadvar",
    designation: "Deputy Commissioner",
    image: "./p3.jpg",
  },
  {
    id: 3,
    name: "Dr. Mohini Dharma",
    designation: "Medical Officer of Health (MOH)",
    image: "./p4.png",
  },
];
  return (
  <div
    style={{
      fontFamily: "Segoe UI, sans-serif",
      background: "#f2f4f7",
      minHeight: "100vh",
      overflowX: "hidden"
    }}
  >
      
      {/* NAVBAR */}
  {/* Navbar */}
      <Navbar />
<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    padding: "10px 15px",
flexWrap: "wrap",
    marginTop: 10,
  }}
>
  <button
    onClick={() => navigate("/super-admin/login")}
    style={{
      background: "#1f2d2a",
      color: "white",
      border: "none",
      padding: "10px 18px",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 600,
      transition: "0.3s",
    }}
  >
    Super Admin Login
  </button>
  <button
  onClick={captureFingerprint}
  style={{
    background: "#ff7a00",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    transition: "0.3s",
  }}
>
  Test Capture
</button>

  <button
    onClick={() => navigate("/officer-login")}
    style={{
      background: "#3b6edc",
      color: "white",
      border: "none",
      padding: "10px 18px",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 600,
      transition: "0.3s",
    }}
  >
    Officer Login
  </button>
</div>


      {/* MAIN CONTENT */}
      <div
        style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
gap: 20,
padding: "20px 15px",
boxSizing: "border-box",
        }}
      >
        {/* LEFT CARD */}
       <div
  style={{
    background: "white",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
    width: "100%"
  }}
>
          {/* PROFILE HEADER */}
          <div
            style={{
              background: "linear-gradient(180deg,#3b6edc,#2c56c5)",
              textAlign: "center",
              padding: 30,
              color: "white",
            }}
          >
            <img
              src="./p1.jfif"
             style={{
  borderRadius: "50%",
  border: "4px solid white",
  marginBottom: 10,
  height: "100px",
  width: "100px",
  maxWidth: "100%"
}}
            />

            <h2>Mrs. Manisha Awhale (IAS)</h2>
            <p>Administrator and Commissioner, Ulhasnagar Municipal Corporation</p>
          </div>

          {/* OFFICIALS */}
          <div style={{ padding: 20,color:"black" }}>
            <h4>OFFICIALS</h4>

{officials.map((official) => (
  <div
    key={official.id}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: "#f7f8fa",
      padding: 12,
      borderRadius: 10,
      marginTop: 12,
      color: "black",
      transition: "0.3s",
      cursor: "pointer",
    }}
  >
    <img
      src={official.image}
      alt={official.name}
      width={50}
      height={50}
      style={{
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />

    <div>
      <b>{official.name}</b>
      <p style={{ margin: 0, fontSize: 12 }}>
        {official.designation}
      </p>
    </div>
  </div>
))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20,color: "black" }}>
          
          {/* STATS CARD */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
              width: "100%",
            }}
          >
            <h3>📊 Marriage Certificates Statistics</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 15,
                marginTop: 15,
              }}
            >
{[
  { num: 7, label: "Total Certificates" },
  { num: 5, label: "This Month" },
  { num: 7, label: "Verifications" },
  { num: 0, label: "Pending" },
].map((item) => (
  <div
    key={item.label}
    onMouseEnter={() => setHoveredStat(item.label)}
    onMouseLeave={() => setHoveredStat(null)}
    style={{
      background: "#f7f8fa",
      padding: 20,
      borderRadius: 12,
      textAlign: "center",
      border:
        hoveredStat === item.label
          ? "2px solid #3b6edc"
          : "2px solid transparent",
      transition: "0.3s",
    }}
  >
    <h1 style={{ margin: 0 }}>{item.num}</h1>
    <p>{item.label}</p>
  </div>
))}
            </div>
          </div>

          {/* CONTACT CARD */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
              width: "100%",
            }}
          >
            <h3>Contact Information</h3>

            <p>📧 info@umc.gov.in</p>
            <p>📞 +91-251-2530360</p>
            <p>📍 Ulhasnagar Municipal Corporation</p>
            <p>🕒 Mon - Fri 10AM - 5PM</p>
          </div>
        </div>
      </div>
      <Footer />

    </div>
  );
};

export default Home;
