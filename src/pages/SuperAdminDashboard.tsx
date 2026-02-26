import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SuperAdminDashboard = () => {
  const [tab, setTab] = useState("overview");
  const [userTab, setUserTab] = useState("officers");

const [reviewApp, setReviewApp] = useState<any>(null);
  const [overview, setOverview] = useState<any>({});
  const [officers, setOfficers] = useState<any[]>([]);
  const [citizens, setCitizens] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
const [showAddOfficer, setShowAddOfficer] = useState(false);
const [editOfficer, setEditOfficer] = useState<any>(null);

const [officerForm, setOfficerForm] = useState({
  name: "",
  email: "",
  phone: "",
  officerId: "",
  ward: "",
  password: ""
});
  const token = localStorage.getItem("superAdminToken");

  useEffect(() => {
    fetch("/api/admin/overview", {
      headers: { Authorization: token || "" }
    })
      .then(res => res.json())
      .then(data => setOverview(data));
  }, []);

  const loadOfficers = async () => {
    const res = await fetch("/api/admin/officers", {
      headers: { Authorization: token || "" }
    });
    const data = await res.json();
    setOfficers(data.officers);
  };

  const loadCitizens = async () => {
    const res = await fetch("/api/admin/citizens", {
      headers: { Authorization: token || "" }
    });
    const data = await res.json();
    setCitizens(data.users);
  };

const loadApplications = async () => {
  try {
    const res = await fetch("/api/admin/applications", {
      headers: { Authorization: token || "" }
    });

    const data = await res.json();

    if (data.success && Array.isArray(data.apps)) {
      setApplications(data.apps);
    } else {
      setApplications([]); // prevent crash
    }

  } catch (err) {
    console.log("Application load error", err);
    setApplications([]); // prevent crash
  }
};

const addOfficer = async () => {
  await fetch("/api/admin/officers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || ""
    },
    body: JSON.stringify(officerForm)
  });

  setShowAddOfficer(false);

  setOfficerForm({
    name: "",
    email: "",
    phone: "",
    officerId: "",
    ward: "",
    password: ""
  });

  loadOfficers();
};

const updateOfficer = async () => {
  await fetch(
    `http://localhost:5000/api/admin/officers/${editOfficer._id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token || ""
      },
      body: JSON.stringify(editOfficer)
    }
  );

  setEditOfficer(null);
  loadOfficers();
};

const deleteOfficer = async (id) => {
  await fetch(
    `http://localhost:5000/api/admin/officers/${id}`,
    {
      method: "DELETE",
      headers: { Authorization: token || "" }
    }
  );
  loadOfficers();
};

const deleteCitizen = async (id) => {
  await fetch(
    `http://localhost:5000/api/admin/citizens/${id}`,
    {
      method: "DELETE",
      headers: { Authorization: token || "" }
    }
  );
  loadCitizens();
};

const handleReview = async (verificationId: string) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/admin/applications/${verificationId}`,
      {
        headers: { Authorization: token || "" }
      }
    );

    const data = await res.json();

    if (data.success) {
      setReviewApp(data.app);
    }

  } catch (err) {
    console.log("Review load error", err);
  }
};

  return (
    <>
      <Navbar />

      <div style={container}>
        {/* HEADER */}
        <div style={header}>
          <div>
            <h2 style={{ margin: 0 , color:"black"}}>Super Admin Dashboard</h2>
            <p style={{ color: "#6c757d" }}>
              Manage users, monitor system activity, and oversee platform operations
            </p>
          </div>

          <div>
            <button style={headerBtn}>Edit Profile</button>
            <button style={headerBtn}>Change Password</button>
          </div>
        </div>

        {/* MAIN TABS */}
        <div style={tabBar}>
          {["overview", "users", "applications"].map(t => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                if (t === "users") {
                  loadOfficers();
                  loadCitizens();
                }
                if (t === "applications") loadApplications();
              }}
              style={{
                ...tabBtn,
                borderBottom:
                  tab === t ? "3px solid #3b6edc" : "3px solid transparent",
                color: tab === t ? "#3b6edc" : "#444"
              }}
            >
              {t === "overview" && "Overview"}
              {t === "users" && "User Management"}
              {t === "applications" && "Applications"}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <>
            <div style={cardRow}>
              <StatCard
                title="Total Users"
                value={overview.totalUsers}
                subtitle="Registered users"
              />
              <StatCard
                title="Pending Applications"
                value={overview.pendingApps}
                subtitle="Awaiting verification"
              />
              <StatCard
                title="Active Officers"
                value={overview.activeOfficers}
                subtitle="Verified officers"
              />
            </div>

            <div style={systemCard}>
              <h3>System Activity</h3>
              <div style={activityItem}>
                <span>✅ System Status: Operational</span>
                <small>All services running normally</small>
              </div>

              <div style={activityItem}>
                <span>
                  🔐 Blockchain Integration
                  <span style={activeBadge}>Active</span>
                </span>
                <small>Certificate issuance operational</small>
              </div>
            </div>
          </>
        )}

        {/* USER MANAGEMENT */}
        {tab === "users" && (
          <div style={panel}>
            <h3>User Management</h3>

            <div style={innerTabBar}>
              <button
                onClick={() => setUserTab("officers")}
                style={userTab === "officers" ? activeInnerTab : innerTab}
              >
                Officers
              </button>
              <button
                onClick={() => setUserTab("citizens")}
                style={userTab === "citizens" ? activeInnerTab : innerTab}
              >
                Citizens
              </button>
            </div>

            {userTab === "officers" && (
              <>
                <button
  style={primaryBtn}
  onClick={() => setShowAddOfficer(true)}
>
  + Add Officer
</button>

{officers.map(o => (
  <div key={o._id} style={listCard}>
    <div>
      <b>{o.name}</b>
      <div style={{ color: "#6c757d" }}>{o.email}</div>
      <div>{o.phone}</div>
      <div>Ward: {o.ward}</div>
    </div>

    <div>
      <button
        style={headerBtn}
        onClick={() => setEditOfficer(o)}
      >
        Edit
      </button>

      <button
        style={dangerBtn}
        onClick={() => deleteOfficer(o._id)}
      >
        Delete
      </button>
    </div>
  </div>
))}
              </>
            )}

            {userTab === "citizens" &&
              citizens.map(c => (
                <div key={c._id} style={listCard}>
                  <div>
                    <b>{c.name}</b>
                    <div style={{ color: "#6c757d" }}>{c.email}</div>
                  </div>

                 <button
  style={dangerBtn}
  onClick={() => deleteCitizen(c._id)}
>
  Delete
</button>
                </div>
              ))}
          </div>
        )}

        {/* APPLICATIONS */}
        {tab === "applications" && (
          <div style={panel}>
            <h3>Physically Verified Applications</h3>

<div style={tableWrapper}>
  <table style={tableStyle}>
    <thead>
      <tr>
        <th style={th}>CPAN</th>
        <th style={th}>Applicant</th>
        <th style={th}>Status</th>
        <th style={th}>Officer</th>
        <th style={th}>Created</th>
        <th style={th}>Actions</th>
      </tr>
    </thead>

    <tbody>
      {applications?.map((app: any) => {
        const application = app.applicationId;

        return (
          <tr key={app._id} style={row}>
            {/* CPAN */}
            <td style={td}>{app.cpan}</td>

            {/* Applicant */}
<td style={td}>
  <div style={{ fontWeight: 600 }}>
    {app.applicationId?.formData?.["groom_First Name *"]}{" "}
    {app.applicationId?.formData?.["groom_Last Name *"]}
  </div>

  <div style={subText}>
    {app.applicationId?.userId}
  </div>
</td>

            {/* Status */}
            <td style={td}>
             <span
  style={{
    ...statusBadge,
    background:
      app.certificate?.registeredOnChain
        ? "#d4edda"
        : "#fff3cd",
    color:
      app.certificate?.registeredOnChain
        ? "#155724"
        : "#856404"
  }}
>
  {app.certificate?.registeredOnChain
    ? "ISSUED"
    : "PRE ISSUED"}
</span>
              <div style={certText}>
  CERT-{app.cpan}
</div>

{app.certificate?.registeredOnChain && (
  <div style={{ fontSize: 12, marginTop: 4 }}>
    <div>
      <b>Blockchain:</b>{" "}
      {app.certificate.blockchainStatus}
    </div>

    <div style={{ wordBreak: "break-all" }}>
      <b>Hash:</b>{" "}
      {app.certificate.certificateHash}
    </div>
  </div>
)}
            </td>

            {/* Officer */}
<td style={td}>
  <div style={{ fontWeight: 600 }}>
    {app.officerId || "Unassigned"}
  </div>
</td>

            {/* Created */}
            <td style={td}>
              {new Date(app.verifiedAt).toLocaleDateString()}
            </td>

            {/* Actions */}
            <td style={td}>
<button
  style={reviewBtn}
 onClick={() => handleReview(app._id)}
>
  Review
</button>

 <button
  style={certificateBtn}
  onClick={async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/generate-certificate/${app._id}`,
        {
          headers: {
            Authorization: token || ""
          }
        }
      );

      const data = await res.json();

      if (data.success) {
        // open Cloudinary PDF URL
        window.open(data.url, "_blank");
      } else {
        alert("Failed to generate certificate");
      }

    } catch (err) {
      console.log("Certificate error:", err);
      alert("Something went wrong");
    }
  }}
>
  Generate
</button>

  <button
  style={blockchainBtn}
  onClick={async () => {
    try {
      const res = await fetch(
        "/api/admin/blockchain/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token || ""
          },
          body: JSON.stringify({
            cpan: app.cpan
          })
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Blockchain registration successful");

        // reload applications to refresh UI
        loadApplications();
      } else {
        alert(data.message || "Blockchain failed");
      }

    } catch (err) {
      console.log(err);
      alert("Blockchain error");
    }
  }}
>
  Blockchain
</button>
<button
  style={{
    background: "#20c997",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
    marginRight: 8,
    cursor: "pointer"
  }}
  onClick={async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/generate-receipt/${app._id}`,
        {
          headers: { Authorization: token || "" }
        }
      );

      const data = await res.json();

      if (data.success) {
        window.open(data.url, "_blank");
      } else {
        alert("Failed to generate receipt");
      }

    } catch (err) {
      console.log(err);
      alert("Receipt generation error");
    }
  }}
>
  Receipt
</button>

<button
  style={certificateBtn}
  onClick={async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/generate-goshvara/${app._id}`,
        {
          headers: {
            Authorization: token || ""
          }
        }
      );

      const data = await res.json();

      if (data.success) {
        window.open(data.url, "_blank");
      } else {
        alert("Failed to generate Goshvara");
      }

    } catch (err) {
      console.log("Goshvara error:", err);
      alert("Something went wrong");
    }
  }}
>
  Goshvara
</button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
          </div>
        )}
      </div>
{reviewApp && (
  <div style={overlay}>
    <div style={reviewModal}>
      <h2>Application Review</h2>

      {/* ================= APPLICANT INFO ================= */}
      <div style={sectionBox}>
<h3>Application Form Details</h3>

<div style={{ display: "grid", gap: 10 }}>
  {Object.entries(reviewApp.applicationId?.formData || {}).map(
    ([key, value]: any) => (
      <div key={key} style={fieldBox}>
        <strong>{key}</strong>
        <div>{String(value)}</div>
      </div>
    )
  )}
</div>

<p>
  <b>Email:</b> {reviewApp.applicationId?.userId}
</p>

<p>
  <b>Status:</b> {reviewApp.applicationId?.status}
</p>
      </div>

      {/* ================= APPLICATION DOCUMENTS ================= */}
      <div style={sectionBox}>
        <h3>Application Documents</h3>

        <div style={docGrid}>
          {Object.entries(
            reviewApp.applicationId?.documents || {}
          ).map(([key, value]: any) => (
            <div key={key} style={docCard}>
              <b>{key}</b>

              {value && (
                <img
                  src={value}
                  alt={key}
                  style={docImg}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ================= PHYSICAL VERIFICATION ================= */}
      <div style={sectionBox}>
        <h3>Physical Verification</h3>

        <p>
          <b>CPAN:</b> {reviewApp.cpan}
        </p>

        <p>
          <b>Officer ID:</b> {reviewApp.officerId}
        </p>

        <p>
          <b>Documents Verified:</b>{" "}
          {reviewApp.documentsVerified ? "Yes" : "No"}
        </p>

        <p>
          <b>Biometric Done:</b>{" "}
          {reviewApp.biometricDone ? "Yes" : "No"}
        </p>

        <p>
          <b>Remarks:</b> {reviewApp.officerRemarks}
        </p>
      </div>

      {/* ================= LIVE PHOTOS ================= */}
      <div style={sectionBox}>
        <h3>Live Photos</h3>

        <div style={docGrid}>
          {Object.entries(reviewApp.livePhotos || {}).map(
            ([key, value]: any) => (
              <div key={key} style={docCard}>
                <b>{key}</b>

                {value && (
                  <img
                    src={value}
                    alt={key}
                    style={docImg}
                  />
                )}
              </div>
            )
          )}
        </div>
      </div>

      <button
        style={primaryBtn}
        onClick={() => setReviewApp(null)}
      >
        Close
      </button>
    </div>
  </div>
)}

      {showAddOfficer && (
  <div style={overlay}>
    <div style={modal}>
      <h3>Add Officer</h3>

      {Object.keys(officerForm).map(key => (
        <input
          key={key}
          placeholder={key}
          value={officerForm[key]}
          onChange={e =>
            setOfficerForm({
              ...officerForm,
              [key]: e.target.value
            })
          }
          style={input}
        />
      ))}

      <button style={primaryBtn} onClick={addOfficer}>
        Save Officer
      </button>

      <button
        style={headerBtn}
        onClick={() => setShowAddOfficer(false)}
      >
        Cancel
      </button>
    </div>
  </div>
)}

{editOfficer && (
  <div style={overlay}>
    <div style={modal}>
      <h3>Edit Officer</h3>

      {Object.keys(editOfficer)
        .filter(k => !["_id","createdAt","__v"].includes(k))
        .map(key => (
          <input
            key={key}
            value={editOfficer[key] || ""}
            onChange={e =>
              setEditOfficer({
                ...editOfficer,
                [key]: e.target.value
              })
            }
            style={input}
          />
        ))}

      <button style={primaryBtn} onClick={updateOfficer}>
        Save Changes
      </button>

      <button
        style={headerBtn}
        onClick={() => setEditOfficer(null)}
      >
        Cancel
      </button>
    </div>
  </div>
)}

      <Footer />
    </>
  );
};

export default SuperAdminDashboard;

/* ===================== STYLES ===================== */

const container = {
  padding: 40,
  background: "#f4f6f9",
  minHeight: "100vh"
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 20
};

const headerBtn = {
  marginLeft: 10,
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  color:"black"
};

const tabBar = {
  display: "flex",
  gap: 25,
  borderBottom: "2px solid #ddd",
  marginBottom: 25
};

const tabBtn = {
  background: "none",
  border: "none",
  padding: "12px 0",
  fontWeight: 600,
  cursor: "pointer"
};

const cardRow = {
  display: "flex",
  gap: 20,
  marginBottom: 25,
  color:"black"
};

const systemCard = {
  background: "#fff",
  padding: 25,
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  color:"black"
};

const activityItem = {
  marginBottom: 15,
  color:"black"
};

const activeBadge = {
  marginLeft: 8,
  background: "#3b6edc",
  color: "#fff",
  padding: "2px 8px",
  borderRadius: 6,
  fontSize: 12
};

const panel = {
  background: "#fff",
  padding: 25,
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  color:"black"
};

const innerTabBar = {
  display: "flex",
  gap: 15,
  marginBottom: 20
};

const innerTab = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#f8f9fa",
  cursor: "pointer",
  color:"black"
};

const activeInnerTab = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid #3b6edc",
  background: "#e7f0ff",
  cursor: "pointer",
  color:"black"
};

const primaryBtn = {
  background: "#3b6edc",
  color: "#fff",
  padding: "8px 16px",
  borderRadius: 8,
  border: "none",
  marginBottom: 15,
  cursor: "pointer"
};

const dangerBtn = {
  background: "#dc3545",
  color: "#fff",
  padding: "6px 12px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer"
};

const listCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 15,
  marginBottom: 10,
  background: "#f8f9fa",
  borderRadius: 10
};

const StatCard = ({ title, value, subtitle }: any) => (
  <div style={{
    flex: 1,
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  }}>
    <h4>{title}</h4>
    <h2>{value ?? 0}</h2>
    <p style={{ color: "#6c757d" }}>{subtitle}</p>
  </div>
);

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color:"black"
};

const modal = {
  background: "#fff",
  padding: 30,
  borderRadius: 12,
  width: 400,
  color:"black"
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  border: "1px solid #ddd",
  borderRadius: 6
};

const tableWrapper = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const
};

const th = {
  textAlign: "left" as const,
  padding: "12px",
  background: "#f1f4f8",
  fontWeight: 600
};

const td = {
  padding: "14px 12px",
  borderBottom: "1px solid #eee"
};

const row = {
  transition: "0.2s"
};

const subText = {
  fontSize: 13,
  color: "#6c757d"
};

const statusBadge = {
  background: "#d4edda",
  color: "#155724",
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600
};

const certText = {
  fontSize: 12,
  color: "#28a745",
  marginTop: 4
};

const reviewBtn = {
  background: "#fff",
  border: "1px solid #ccc",
  padding: "6px 12px",
  borderRadius: 6,
  marginRight: 8,
  cursor: "pointer",
  color:"black"
};

const certificateBtn = {
  background: "#3b6edc",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: 6,
  cursor: "pointer"
};

const preStyle = {
  maxHeight: 250,
  overflowY: "auto" as const,
  background: "#f8f9fa",
  padding: 12,
  borderRadius: 8,
  fontSize: 13,
  color:"black"
};

const reviewModal = {
  background: "#fff",
  padding: 30,
  borderRadius: 14,
  width: "85%",
  maxHeight: "90vh",
  overflowY: "auto",
};

const sectionBox = {
  background: "#f8f9fa",
  padding: 20,
  borderRadius: 10,
  marginBottom: 20,
};

const docGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, 160px)",
  gap: 15,
};

const docCard = {
  background: "#fff",
  padding: 10,
  borderRadius: 8,
  textAlign: "center" as const,
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
};

const docImg = {
  width: "100%",
  height: 120,
  objectFit: "cover" as const,
  borderRadius: 6,
  marginTop: 6,
};

const fieldBox = {
  background: "#fff",
  padding: 10,
  borderRadius: 6,
  border: "1px solid #eee"
};

const blockchainBtn = {
  background: "#6f42c1",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: 6,
  marginRight: 8,
  cursor: "pointer"
};