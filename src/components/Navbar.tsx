import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();


const [loading, setLoading] = React.useState(false);
  const applicant = localStorage.getItem("applicant");
  const officer = localStorage.getItem("officer");
  const loggedIn = !!(applicant || officer);

 const handleLogout = () => {
  setLoading(true);

  setTimeout(() => {
    localStorage.removeItem("applicant");
    localStorage.removeItem("officer");
    navigate("/");
  }, 1200); // 1.2 second delay
};

  const isHomePage = location.pathname === "/";

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
      {/* LEFT SIDE */}
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
          src="/logo.png"
          alt="logo"
          style={{ borderRadius: 8, height: "80px" }}
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
        
        {/* CLEAN CONDITIONAL RENDERING */}
        {isHomePage ? (
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
        ) : loggedIn ? (
<button
  onClick={handleLogout}
  disabled={loading}
  style={{
    background: "#ff4d4f",
    border: "none",
    padding: "10px 18px",
    borderRadius: 20,
    color: "white",
    cursor: loading ? "not-allowed" : "pointer",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 8,
    opacity: loading ? 0.8 : 1,
  }}
>
  {loading && <span className="loader" />}
  {loading ? "Logging out..." : "Logout"}
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

        {/* VERIFY */}
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
      <style>
{`
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loader {
  width: 14px;
  height: 14px;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
`}
</style>
    </div>
  );
};

export default Navbar;