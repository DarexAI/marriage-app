import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SuperAdminDashboard = () => {
  const [tab, setTab] = useState("overview");
  const [userTab, setUserTab] = useState("officers");
const [toast, setToast] = useState<{
  message: string;
  type: "success" | "error";
} | null>(null);
const [reviewApp, setReviewApp] = useState<any>(null);
const [records, setRecords] = useState<any[]>([]);
const [recordFilter, setRecordFilter] = useState("month");
  const [overview, setOverview] = useState<any>({});
  const [officers, setOfficers] = useState<any[]>([]);
  const [citizens, setCitizens] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
const [showAddOfficer, setShowAddOfficer] = useState(false);
const [issuingId, setIssuingId] = useState<string | null>(null);

const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 768);
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);

const [editOfficer, setEditOfficer] = useState<any>(null);
const [approvingId, setApprovingId] = useState<string | null>(null);
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
    fetch(`${import.meta.env.VITE_API_URL}/admin/overview`, {
      headers: { Authorization: token || "" }
    })
      .then(res => res.json())
      .then(data => setOverview(data));
  }, []);

  const loadOfficers = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/officers`, {
      headers: { Authorization: token || "" }
    });
    const data = await res.json();
    setOfficers(data.officers);
  };

  const showToast = (message: string, type: "success" | "error") => {
  setToast({ message, type });

  setTimeout(() => {
    setToast(null);
  }, 3000);
};

const loadRecords = async (filter = "month") => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/admin/records?filter=${filter}`,
    { headers: { Authorization: token || "" } }
  );

  const data = await res.json();
  if (data.success) setRecords(data.records);
};

  const loadCitizens = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/citizens`, {
      headers: { Authorization: token || "" }
    });
    const data = await res.json();
    setCitizens(data.users);
  };

const loadApplications = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/applications`, {
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

const printRecords = () => {
  const printWindow = window.open("", "", "width=1000,height=700");

  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Blockchain Certificate Records</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
          }

          h2 {
            text-align: center;
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            font-size: 12px;
            text-align: left;
          }

          th {
            background: #f2f2f2;
          }

          .small {
            font-size: 10px;
            word-break: break-all;
          }
        </style>
      </head>

      <body>
        <h2>Blockchain Certificate Records</h2>
        <p><b>Filter:</b> ${recordFilter.toUpperCase()}</p>

        <table>
          <tr>
            <th>CPAN</th>
            <th>Blockchain Status</th>
            <th>From</th>
            <th>To</th>
          </tr>

          ${records
            .map(
              r => `
              <tr>
                <td>${r.cpan}</td>
                <td>${r.blockchainStatus}</td>
                <td class="small">${r.from}</td>
                <td class="small">${r.to}</td>
              </tr>
            `
            )
            .join("")}
        </table>

      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
};

const addOfficer = async () => {
  await fetch(`${import.meta.env.VITE_API_URL}/admin/officers`, {
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
    `${import.meta.env.VITE_API_URL}/admin/officers/${editOfficer._id}`,
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
    `${import.meta.env.VITE_API_URL}/admin/officers/${id}`,
    {
      method: "DELETE",
      headers: { Authorization: token || "" }
    }
  );
  loadOfficers();
};

const deleteCitizen = async (id) => {
  await fetch(
    `${import.meta.env.VITE_API_URL}/admin/citizens/${id}`,
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
      `${import.meta.env.VITE_API_URL}/admin/applications/${verificationId}`,
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

const formatFormLabel = (key: string) => {
  return key
    // Remove prefixes
    .replace(/^groom_/, "")
    .replace(/^bride_/, "")
    .replace(/^marriage_/, "")
    .replace(/^priest_/, "")
    .replace(/^witness[0-9]+_/, "")

    // Remove duplicate witness words
    .replace(/Witness[0-9]+/g, "")

    // Fix broken words
    .replace(/Addressin/g, "Address in")
    .replace(/Dateof/g, "Date of")
    .replace(/Ageat/g, "Age at")
    .replace(/Relationto/g, "Relation to")
    .replace(/ProofofAge/g, "Proof of Age")
    .replace(/ProofofResidence/g, "Proof of Residence")

    // Fix camel case
    .replace(/([a-z])([A-Z])/g, "$1 $2")

    // Remove underscores and *
    .replace(/_/g, " ")
    .replace(/\*/g, "")

    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());
};

const formatDocLabel = (key: string) => {
  let entity = "";
  let cleanKey = key;

  if (key.startsWith("groom_")) {
    entity = "Groom";
    cleanKey = key.replace("groom_", "");
  } else if (key.startsWith("bride_")) {
    entity = "Bride";
    cleanKey = key.replace("bride_", "");
  } else if (key.startsWith("marriageDoc_")) {
    entity = "Marriage";
    cleanKey = key.replace("marriageDoc_", "");
  } else if (key.startsWith("witness1_")) {
    entity = "Witness 1";
    cleanKey = key.replace("witness1_", "");
  } else if (key.startsWith("witness2_")) {
    entity = "Witness 2";
    cleanKey = key.replace("witness2_", "");
  } else if (key.startsWith("witness3_")) {
    entity = "Witness 3";
    cleanKey = key.replace("witness3_", "");
  }

  cleanKey = cleanKey
    .replace(/Witness[0-9]+/g, "")
    .replace(/ProofofAge/g, "Proof of Age")
    .replace(/ProofofResidence/g, "Proof of Residence")
    .replace(/WeddingCard\/Invitation/g, "Wedding Invitation")
    .replace(/PriestSignature\/Certificate/g, "Priest Certificate")
    .replace(/IDProof/g, "ID Proof")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase());

  return `${entity} – ${cleanKey}`;
};

const formatLivePhotoLabel = (key: string) => {
  if (key === "groom") return "Groom – Live Photo";
  if (key === "bride") return "Bride – Live Photo";
  if (key === "witness1") return "Witness 1 – Live Photo";
  if (key === "witness2") return "Witness 2 – Live Photo";
  if (key === "witness3") return "Witness 3 – Live Photo";
  return key;
};

  return (
    <>
      <Navbar />
<style>
{`
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`}
</style>
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
          {["overview", "users", "applications", "records"].map(t => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                if (t === "records") loadRecords(recordFilter);
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
              {t === "records" && "Records"}
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

<div
  style={{
    ...tableWrapper,
    overflowX: isMobile ? "auto" : "visible"
  }}
>
  <table
    style={{
      ...tableStyle,
      minWidth: isMobile ? 900 : "100%"
    }}
  >
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
  <div style={actionContainer}>
              
<button
  style={reviewBtn}
 onClick={() => handleReview(app._id)}
>
  Review
</button>



<button
  style={{
    ...blockchainBtn,
    background: app.certificate?.registeredOnChain
      ? "#28a745"
      : "#6f42c1",
    opacity: issuingId === app._id ? 0.7 : 1,
    cursor: issuingId === app._id ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8
  }}
  disabled={issuingId === app._id}
  onClick={async () => {
    if (app.certificate?.registeredOnChain) {
      if (app.certificate?.certificateUrl) {
        window.open(app.certificate.certificateUrl, "_blank");
      } else {
        alert("Certificate URL not found");
      }
      return;
    }

    try {
      setIssuingId(app._id);   // 🔥 START LOADER

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/blockchain/register`,
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
        await loadApplications();
        showToast("Blockchain registration successful", "success");
      } else {
        showToast(data.message || "Blockchain failed", "error");
      }

    } catch (err) {
      console.log(err);
      showToast("Blockchain error occurred", "error");
    } finally {
      setIssuingId(null);  // 🔥 STOP LOADER
    }
  }}
>
  {issuingId === app._id && (
    <span style={btnSpinner}></span>
  )}

  {issuingId === app._id
    ? "Generating..."
    : app.certificate?.registeredOnChain
    ? "View Certificate"
    : "Generate Certificate"}
</button>

<button
  style={certificateBtn}
  onClick={async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/generate-receipt/${app._id}`,
        {
          headers: { Authorization: token || "" }
        }
      );

      const data = await res.json();

      if (data.success) {
        window.open(data.url, "_blank");
      } else {
        showToast("Failed to generate receipt", "error");
      }

    } catch (err) {
      console.log(err);
      showToast("Receipt generation error", "error");
    }
  }}
>
  Show Receipt to User
</button>

<button
  disabled={
    !app.certificate?.registeredOnChain ||
    app.certificate?.blockchainStatus !== "confirmed"
  }
  style={{
    ...certificateBtn,
    opacity:
      app.certificate?.registeredOnChain &&
      app.certificate?.blockchainStatus === "confirmed"
        ? 1
        : 0.5,
    cursor:
      app.certificate?.registeredOnChain &&
      app.certificate?.blockchainStatus === "confirmed"
        ? "pointer"
        : "not-allowed"
  }}
  onClick={async () => {
    if (
      !app.certificate?.registeredOnChain ||
      app.certificate?.blockchainStatus !== "confirmed"
    )
      return;

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/generate-goshvara/${app._id}`,
      { headers: { Authorization: token || "" } }
    );

    const data = await res.json();
    if (data.success) window.open(data.url, "_blank");
  }}
>
  {app.certificate?.registeredOnChain ? "Generate Goshvara" : "Goshvara 🔒"}
</button>
</div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
          </div>
        )}
        {tab === "records" && (
  <div style={panel}>
    <h3>Blockchain Certificate Records</h3>

    {/* FILTER */}
    <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
      <select
        value={recordFilter}
        onChange={(e) => {
          setRecordFilter(e.target.value);
          loadRecords(e.target.value);
        }}
        style={input}
      >
        <option value="today">Today</option>
        <option value="week">Last 7 Days</option>
        <option value="month">Last 30 Days</option>
      </select>
      <button
  style={primaryBtn}
  onClick={printRecords}
>
  Print Records
</button>
    </div>

    {/* TABLE */}
<div
  style={{
    ...tableWrapper,
    overflowX: isMobile ? "auto" : "visible",
    padding: isMobile ? 10 : 20
  }}
>
  <table
    style={{
      ...tableStyle,
      minWidth: isMobile ? 950 : "100%"
    }}
  >
        <thead>
          <tr>
            <th style={th}>CPAN</th>
           
            <th style={th}>Blockchain Status</th>
            <th style={th}>From</th>
            <th style={th}>To</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r, i) => (
            <tr key={i} style={row}>
              <td style={td}>{r.cpan}</td>
              <td style={td}>
                <span
                  style={{
                    ...statusBadge,
                    background:
                      r.blockchainStatus === "confirmed"
                        ? "#d4edda"
                        : r.blockchainStatus === "pending"
                        ? "#fff3cd"
                        : "#f8d7da"
                  }}
                >
                  {r.blockchainStatus}
                </span>
              </td>
<td
  style={{
    ...td,
    fontSize: 12,
    whiteSpace: "nowrap",
    maxWidth: 280,
    overflow: "hidden",
    textOverflow: "ellipsis"
  }}
>
                {r.from}
              </td>
<td
  style={{
    ...td,
    fontSize: 12,
    whiteSpace: "nowrap",
    maxWidth: 280,
    overflow: "hidden",
    textOverflow: "ellipsis"
  }}
>
                {r.to}
              </td>
            </tr>
          ))}
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
<div style={reviewGrid}>
  {Object.entries(reviewApp.applicationId?.formData || {}).map(
    ([key, value]: any) => {
      const isLarge =
        key.toLowerCase().includes("address");

      return (
        <div
          key={key}
          style={{
            ...fieldBox,
            gridColumn: isLarge ? "1 / -1" : "auto"
          }}
        >
          <div style={reviewLabel}>
            {formatFormLabel(key)}
          </div>

          <div style={reviewValue}>
            {String(value)}
          </div>
        </div>
      );
    }
  )}
</div>
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
            <b>{formatDocLabel(key)}</b>

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
               <b>{formatLivePhotoLabel(key)}</b>

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

<div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>

  <button
    style={headerBtn}
    onClick={() => setReviewApp(null)}
  >
    Close
  </button>

<button
  disabled={
    !!reviewApp?.certificate ||
    issuingId === reviewApp?._id
  }
  style={{
    ...primaryBtn,
    background: reviewApp?.certificate
      ? "#28a745"
      : "#3b6edc",
    opacity: reviewApp?.certificate ? 0.6 : 1,
    cursor:
      reviewApp?.certificate ||
      issuingId === reviewApp?._id
        ? "not-allowed"
        : "pointer",
    minWidth: 180
  }}
  onClick={async () => {
    if (reviewApp?.certificate) return;

    try {
      setIssuingId(reviewApp._id);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/generate-certificate/${reviewApp._id}`,
        {
          headers: { Authorization: token || "" }
        }
      );

      const data = await res.json();

      if (data.success) {
    await loadApplications();

// 🔥 Fetch updated single application from backend
const updatedRes = await fetch(
  `${import.meta.env.VITE_API_URL}/admin/applications/${reviewApp._id}`,
  {
    headers: { Authorization: token || "" }
  }
);

const updatedData = await updatedRes.json();

if (updatedData.success) {
  setReviewApp(updatedData.app);
}
      } else {
        showToast("Approval failed", "error");
      }

    } catch (err) {
      console.log(err);
      showToast("Approval error occurred", "error");
    } finally {
      setIssuingId(null);
    }
  }}
>
  {issuingId === reviewApp?._id
    ? "Issuing..."
    : reviewApp?.certificate
    ? "Approved ✓"
    : "Approve Through Blockchain"}
</button>

</div>
    </div>
  </div>
)}
{issuingId && (
  <div style={loaderOverlay}>
    <div style={loaderBox}>
      <img
        src="/bit.gif"
        alt="loading"
        style={{ width: 240, height: 240 }}
      />
      <p style={{ marginTop: 20, fontSize: 18, fontWeight: 600 }}>
        Generating Certificate...
      </p>
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
{toast && (
  <div
    style={{
      position: "fixed",
      top: 20,
      right: 20,
      padding: "12px 20px",
      borderRadius: 10,
      color: "#fff",
      fontWeight: 600,
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      background:
        toast.type === "success"
          ? "#28a745"
          : "#dc3545",
      zIndex: 99999,
      animation: "slideIn 0.3s ease"
    }}
  >
    {toast.message}
  </div>
)}

      <Footer />
    </>
  );
};

export default SuperAdminDashboard;

/* ===================== STYLES ===================== */

const container = {
  padding: 20,
  background: "#f4f6f9",
  minHeight: "100vh",
  width: "100%",
  maxWidth: "100vw",
  boxSizing: "border-box" as const,
  overflowX: "hidden"
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 20,
  flexWrap: "wrap" as const,
  gap: 10
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
  marginBottom: 25,
  overflowX: "auto" as const,
  whiteSpace: "nowrap" as const
};

const tabBtn = {
  background: "none",
  border: "none",
  padding: "12px 0",
  fontWeight: 600,
  cursor: "pointer",
  minWidth: 120,
  flexShrink: 0
};

const cardRow = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
  padding: 20,
  width: "100%",
  boxSizing: "border-box",
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
  width: "95%",
  maxWidth: 400,
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
  marginTop:2,
  marginRight:8,
  cursor: "pointer"
};



const reviewModal = {
  background: "#fff",
  padding: 20,
  borderRadius: 14,
  width: "95%",
  maxWidth: 1100,
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
   marginLeft: 8,
  cursor: "pointer",
};

const loaderOverlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "transparent",   // no dark overlay
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  pointerEvents: "none"        // optional (prevents blocking clicks)
};

const loaderBox = {
  background: "transparent",   // 🔥 THIS removes white background
  padding: 0,                  // remove padding if you want only GIF
  borderRadius: 0,
  boxShadow: "none",
  textAlign: "center" as const
};

const reviewGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 12
};

const reviewLabel = {
  fontSize: 13,
  fontWeight: 600,
  color: "#6c757d",
  marginBottom: 4
};

const reviewValue = {
  fontSize: 15,
  fontWeight: 500,
  color: "#111"
};

const btnSpinner = {
  width: 14,
  height: 14,
  border: "2px solid white",
  borderTop: "2px solid transparent",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite"
};

const actionContainer = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 8,
  alignItems: "center"
};