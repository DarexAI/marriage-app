import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);

  // CHECK LOGIN STATUS
  useEffect(() => {
    const applicant = localStorage.getItem("applicant");
    const officer = localStorage.getItem("officer");

    if (applicant || officer) {
      setLoggedIn(true);
    }
  }, []);

  // LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("applicant");
    localStorage.removeItem("officer");
    setLoggedIn(false);
    navigate("/");
  };

  return (
    <div
      style={{
        background: "linear-gradient(90deg, #2447b5, #3b6edc)",
        padding: "12px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
        width: "100%",
      }}
    >
      {/* LEFT SIDE → HOME CLICK */}
      <div
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 15,
          cursor: "pointer",
        }}
      >
        <img
          src="https://via.placeholder.com/40"
          alt="logo"
          style={{ borderRadius: 8 }}
        />

        <div>
          <h3 style={{ margin: 0 }}>
            Ulhasnagar Municipal Corporation
          </h3>
          <small>Marriage Certificate on Blockchain</small>
        </div>
      </div>

      {/* RIGHT BUTTONS */}
      <div style={{ display: "flex", gap: 15 }}>
        {/* LOGIN / LOGOUT BUTTON */}
        {loggedIn ? (
          <button
            onClick={handleLogout}
            style={{
              background: "#ff4d4f",
              border: "none",
              padding: "10px 18px",
              borderRadius: 20,
              color: "white",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "#28c76f",
              border: "none",
              padding: "10px 18px",
              borderRadius: 20,
              color: "white",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Signup/Login
          </button>
        )}

        {/* VERIFY CERTIFICATE */}
        <button
          onClick={() => navigate("/verify")}
          style={{
            background: "#ff9f43",
            border: "none",
            padding: "10px 18px",
            borderRadius: 20,
            color: "white",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Verify Certificate
        </button>
      </div>
    </div>
  );
};

export default Navbar;
