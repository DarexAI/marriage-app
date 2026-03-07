import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const VerifyCertificate = () => {
  const [searchParams] = useSearchParams();
  const nameFromQR = searchParams.get("name");

  const [cpan, setCpan] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const verifyCertificate = async () => {
    if (!cpan) {
      setError("Please enter CPAN number");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/public/verify/${cpan}`
      );

      const data = await res.json();

      if (!data.success || !data.verified) {
        setError("Certificate not found or not verified");
      } else {
        setResult(data.data);
      }
    } catch (err) {
      setError("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar/>
    <div style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif"
    }}>

      {/* Main Content */}
      <div style={{
          flex: 1,
          display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px"
    }}>

        <div style={{
            width: "600px",
            backgroundColor: "#ffffff",
          border: "1px solid #dcdcdc",
          borderRadius: "8px",
          padding: "40px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}>

          {/* Logo */}
<div style={{ textAlign: "center", marginBottom: "15px" }}>
  <img
    src="/logo.png"
    alt="Logo"
    style={{
      width: "70px",
      height: "70px",
      objectFit: "contain"
    }}
  />
</div>

          <h2 style={{
              textAlign: "center",
              marginBottom: "30px",
              fontSize: "22px",
              color: "#333"
            }}>
            Marriage Certificate Verification
          </h2>

{nameFromQR && (() => {
  const [groomName, brideName] = nameFromQR.split(" & ");

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        padding: "20px",
        borderRadius: "6px",
        marginBottom: "25px",
        color: "black"
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#555",
          marginBottom: "15px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}
      >
        Applicant Details
      </div>

      <div style={{ marginBottom: "10px" }}>
        <span style={{ fontWeight: "600" }}>Groom's Name: </span>
        <span>{groomName || "-"}</span>
      </div>

      <div>
        <span style={{ fontWeight: "600" }}>Bride's Name: </span>
        <span>{brideName || "-"}</span>
      </div>
    </div>
  );
})()}

          {/* Input */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "500"
            }}>
              Enter CPAN Number
            </label>
            <input
              type="text"
              value={cpan}
              onChange={(e) => setCpan(e.target.value)}
              placeholder="CPAN-ULH-2026-XXXX"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "14px"
            }}
            />
          </div>

          {/* Button */}
          <button
            onClick={verifyCertificate}
            disabled={loading}
            style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "15px",
                fontWeight: "600",
              cursor: "pointer"
            }}
            >
            {loading ? "Verifying..." : "Verify Certificate"}
          </button>

          {/* Error */}
          {error && (
              <div style={{
                  marginTop: "20px",
                  backgroundColor: "#fdecea",
                  color: "#b71c1c",
                  padding: "10px",
                  borderRadius: "4px",
                  fontSize: "14px",
              textAlign: "center"
            }}>
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
              <div style={{
                  marginTop: "30px",
              backgroundColor: "#e8f5e9",
              border: "1px solid #4caf50",
              padding: "20px",
              borderRadius: "6px",
              color :"black"
            }}>
              <div style={{
                  fontWeight: "bold",
                  color: "#2e7d32",
                  marginBottom: "15px",
                  fontSize: "16px"
                }}>
                Certificate Verified Successfully
              </div>

              <div style={{ marginBottom: "8px" }}>
                <strong>CPAN:</strong> {result.cpan}
              </div>

              <div style={{ marginBottom: "8px" }}>
                <strong>To (Record Address):</strong><br />
                <span style={{ wordBreak: "break-all" }}>
                  {result.certificateRecordAddress}
                </span>
              </div>

              <div>
                <strong>From:</strong><br />
                <span style={{ wordBreak: "break-all" }}>
                  {result.from}
                </span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      
    </div>
    <Footer/>
          </>
  );
};

export default VerifyCertificate;