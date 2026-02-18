import React from "react";

const Footer: React.FC = () => {
  return (
    <div
      style={{
        background: "linear-gradient(90deg, #2447b5, #3b6edc)",
        color: "white",
        padding: "30px 40px",
    
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        {/* LEFT */}
        <div>
          <h3 style={{ marginBottom: 10 }}>
            Ulhasnagar Municipal Corporation
          </h3>
          <p style={{ margin: 0 }}>
            Marriage Certificate System on Blockchain
          </p>
        </div>

        {/* CENTER */}
        <div>
          <h4>Contact</h4>
          <p style={{ margin: "5px 0" }}>📧 info@umc.gov.in</p>
          <p style={{ margin: "5px 0" }}>📞 +91-251-2530360</p>
          <p style={{ margin: "5px 0" }}>📍 Ulhasnagar, Maharashtra</p>
        </div>

        {/* RIGHT */}
        <div>
          <h4>Office Hours</h4>
          <p style={{ margin: "5px 0" }}>Mon - Sat</p>
          <p style={{ margin: "5px 0" }}>10:00 AM - 5:00 PM</p>
        </div>
      </div>

      {/* BOTTOM LINE */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.3)",
          marginTop: 20,
          paddingTop: 15,
          textAlign: "center",
          fontSize: 14,
        }}
      >
        © {new Date().getFullYear()} Ulhasnagar Municipal Corporation. All rights
        reserved.
      </div>
    </div>
  );
};

export default Footer;
