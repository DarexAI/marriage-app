import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const applicant = localStorage.getItem("applicant");
  const officer = localStorage.getItem("officer");
  const loggedIn = !!(applicant || officer);

  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.removeItem("applicant");
      localStorage.removeItem("officer");
      navigate("/");
    }, 1200);
  };

  const isHomePage = location.pathname === "/";

  return (
    <div
      style={{
        background: "linear-gradient(90deg, #2447b5, #3b6edc)",
        padding: "12px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
        width: "100%",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* LEFT SIDE */}
      <div
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
        }}
      >
        <img
          src="/logo.png"
          alt="logo"
          style={{ borderRadius: 8, height: "55px" }}
        />
        <div>
          <h3 style={{ margin: 0, fontSize: "16px" }}>
            Ulhasnagar Municipal Corporation
          </h3>
          <small style={{ fontSize: "12px" }}>
            Marriage Certificate on Blockchain
          </small>
        </div>
      </div>

      {/* DESKTOP BUTTONS */}
      <div className="desktop-menu" style={{ display: "flex", gap: 15 }}>
        {isHomePage ? (
          <NavButton text="Signup/Login" onClick={() => navigate("/login")} green />
        ) : loggedIn ? (
          <NavButton
            text={loading ? "Logging out..." : "Logout"}
            onClick={handleLogout}
            red
          />
        ) : (
          <NavButton text="Signup/Login" onClick={() => navigate("/login")} green />
        )}

        <NavButton
          text="Verify Certificate"
          onClick={() => navigate("/verify")}
          orange
        />
      </div>

      {/* HAMBURGER (Mobile Only) */}
      <div
        className="mobile-menu-icon"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: "none",
          fontSize: 26,
          cursor: "pointer",
        }}
      >
        ☰
      </div>

      {/* MOBILE DROPDOWN */}
      {menuOpen && (
        <div
          className="mobile-dropdown"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            background: "#ffffff",
            color: "#333",
            width: "100%",
            padding: 15,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          {isHomePage ? (
            <MobileButton text="Signup/Login" onClick={() => navigate("/login")} />
          ) : loggedIn ? (
            <MobileButton text="Logout" onClick={handleLogout} />
          ) : (
            <MobileButton text="Signup/Login" onClick={() => navigate("/login")} />
          )}

          <MobileButton
            text="Verify Certificate"
            onClick={() => navigate("/verify")}
          />
        </div>
      )}

      {/* RESPONSIVE CSS */}
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-menu {
              display: none !important;
            }
            .mobile-menu-icon {
              display: block !important;
            }
          }
        `}
      </style>
    </div>
  );
};

/* Desktop Button */
const NavButton = ({
  text,
  onClick,
  green,
  red,
  orange,
}: any) => {
  let bg = "#28c76f";
  if (red) bg = "#ff4d4f";
  if (orange) bg = "#ff9f43";

  return (
    <button
      onClick={onClick}
      style={{
        background: bg,
        border: "none",
        padding: "10px 18px",
        borderRadius: 20,
        color: "white",
        cursor: "pointer",
        fontWeight: 500,
      }}
    >
      {text}
    </button>
  );
};

/* Mobile Button */
const MobileButton = ({ text, onClick }: any) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "12px",
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "#135fb5",
        cursor: "pointer",
        fontWeight: 500,
      }}
    >
      {text}
    </button>
  );
};

export default Navbar;