import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", background: "#f2f4f7" }}>
      
      {/* NAVBAR */}
  {/* Navbar */}
      <Navbar />
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 40px" }}>
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
      marginTop: 10
    }}
  >
    Officer Login
  </button>
</div>


      {/* MAIN CONTENT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 30,
          padding: 40,
        }}
      >
        {/* LEFT CARD */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
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
              src="https://via.placeholder.com/120"
              style={{
                borderRadius: "50%",
                border: "4px solid white",
                marginBottom: 10,
              }}
            />

            <h2>Mrs. Manisha Awhale (IAS)</h2>
            <p>Administrator and Commissioner</p>
          </div>

          {/* OFFICIALS */}
          <div style={{ padding: 20 }}>
            <h4>OFFICIALS</h4>

            {["Dr. Dhiraj Chavan", "Mr. Anant Javadvar", "Dr. Mohini Dharma"].map(
              (name) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#f7f8fa",
                    padding: 12,
                    borderRadius: 10,
                    marginTop: 12,
                    color: "black",
                  }}
                >
                  <img
                    src="https://via.placeholder.com/50"
                    style={{ borderRadius: "50%" }}
                  />
                  <div>
                    <b>{name}</b>
                    <p style={{ margin: 0, fontSize: 12 }}>
                      Official Authority
                    </p>
                  </div>
                </div>
              )
            )}
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
            }}
          >
            <h3>📊 Marriage Certificates Statistics</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
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
                  style={{
                    background: "#f7f8fa",
                    padding: 20,
                    borderRadius: 12,
                    textAlign: "center",
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
            }}
          >
            <h3>Contact Information</h3>

            <p>📧 info@umc.gov.in</p>
            <p>📞 +91-251-2530360</p>
            <p>📍 Ulhasnagar Municipal Corporation</p>
            <p>🕒 Mon - Sat 10AM - 5PM</p>
          </div>
        </div>
      </div>
      <Footer />

    </div>
  );
};

export default Home;
