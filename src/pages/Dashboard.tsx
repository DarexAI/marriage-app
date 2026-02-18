import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ApplyMarriageForm from "../components/ApplyMarriageForm";


interface Applicant {
  name: string;
  email: string;
  phone: string;
  aadhaar?: string;
}


const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<Applicant | null>(null);
  const [tab, setTab] = useState("profile");
  const [application, setApplication] = useState<any>(null);
const [appStatus, setAppStatus] = useState("not_applied");
const [cpan, setCpan] = useState("");

const [slots, setSlots] = useState<any[]>([]);
const [showSlots, setShowSlots] = useState(false);
const [selectedSlot, setSelectedSlot] = useState<any>(null);


useEffect(() => {
  const stored = localStorage.getItem("applicant");

  if (!stored) {
    navigate("/login");
    return;
  }

  const parsed = JSON.parse(stored);

  // FETCH FROM MONGODB
  fetch(`http://localhost:5000/api/profile/${parsed.email}`)
    .then((res) => res.json())
.then(async (data) => {
  if (data.success) {
    setUser(data.user);

    // FETCH APPLICATION STATUS
    const res = await fetch(
      `http://localhost:5000/api/applications/status/${data.user.email}`
    );

    const appData = await res.json();
setApplication(appData.application || null);
setAppStatus(appData.status || "not_applied");
setCpan(appData.cpan || "");

// CHECK IF SLOT STILL EXISTS
// CHECK IF SLOT STILL EXISTS
// RESTORE BOOKED SLOT AFTER REFRESH
if (appData.application?.appointmentSlot) {
  try {
    const res = await fetch(
      `http://localhost:5000/api/slots/${appData.application.appointmentSlot}`
    );

    const slotData = await res.json();

    if (slotData.success) {
      const slot = slotData.slot;

      setSelectedSlot({
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime
      });

      setAppStatus("verification_scheduled");
    } else {
      // Slot deleted
      setSelectedSlot(null);
      setAppStatus("in_progress");
    }
  } catch {
    console.log("Slot fetch failed");
  }
}




  }
  
})
    .catch(() => navigate("/login"));

}, [navigate]);

const bookSlot = async (slotId: string) => {
  try {
    const res = await fetch(
      "http://localhost:5000/api/slots/book",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId,
          applicationId: application._id,
          cpan,
          email: user?.email
        })
      }
    );

    const data = await res.json();

    if (data.success) {
      alert("Verification slot booked");

      // UPDATE UI WITHOUT RELOAD
      const slot = slots.find(s => s._id === slotId);
setSelectedSlot(slot);
setAppStatus("verification_scheduled");

setApplication((prev: any) => ({
  ...prev,
  appointmentSlot: slot._id,
  appointmentDate: slot.date,
  appointmentStartTime: slot.startTime,
  appointmentEndTime: slot.endTime,
  status: "verification_scheduled"
}));

setShowSlots(false);

    } else {
      alert(data.msg);
    }

  } catch {
    alert("Booking failed");
  }
};



  if (!user) return null;

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: "80vh",
          background: "#f4f6f9",
          padding: 40,
          fontFamily: "Segoe UI",
          color: "black",
        }}
      >
        {/* USER CARD */}
<div
  style={{
    background: "white",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginBottom: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }}
>
  {/* LEFT SIDE INFO */}
  <div>
    <h2 style={{ margin: 0 }}>{user.name}</h2>

    <div
      style={{
        marginTop: 8,
        padding: "6px 12px",
        display: "inline-block",
        borderRadius: 8,
background:
  appStatus === "approved"
    ? "#d4edda"
    : appStatus === "verification_scheduled"
    ? "#cfe2ff"
    : appStatus === "in_progress"
    ? "#fff3cd"
    : "#f8d7da",

      }}
    >
      Status:
      <b>
{appStatus === "not_applied" && " Not Applied"}
{appStatus === "in_progress" && " Application In Progress"}
{appStatus === "verification_scheduled" && " Verification Scheduled"}
{appStatus === "approved" && " Approved"}

      </b>
    </div>

    {cpan && (
      <p style={{ marginTop: 6 }}>
        <b>CPAN:</b> {cpan}
      </p>
    )}

    <p>{user.email}</p>
    <p>{user.phone}</p>
  </div>

  {/* RIGHT SIDE SLOT BUTTON */}
 {application && (
  <button
    disabled={selectedSlot !== null}
    onClick={async () => {
    setShowSlots(!showSlots);

    if (!showSlots) {
      const res = await fetch("http://localhost:5000/api/slots/available");
      const data = await res.json();
      if (data.success) setSlots(data.slots);
    }
  }}

      style={{
        padding: "12px 20px",
       background: selectedSlot ? "#aaa" : "#3b6edc",
cursor: selectedSlot ? "not-allowed" : "pointer",

        color: "white",
        border: "none",
        borderRadius: 8,
        height: "fit-content"
      }}
    >
      Select Slot
    </button>
  )}
</div>
{/* SELECTED SLOT DISPLAY */}
{selectedSlot && (
  <div
    style={{
      background: "#fff",
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
    }}
  >
    <strong>Verification Slot Scheduled:</strong>

    <div style={{ marginTop: 6 }}>
      📅 Date: {selectedSlot.date}
    </div>

    <div>
      ⏰ Time: {selectedSlot.startTime} - {selectedSlot.endTime}
    </div>
  </div>
)}


{showSlots && (
  <div style={{ marginBottom: 20 }}>
    <h4>Available Slots</h4>

    {slots.length === 0 && <p>No slots available</p>}

    {slots.map(slot => (
      <div
        key={slot._id}
        style={{
          display: "flex",
          justifyContent: "space-between",
          background: "#fff",
          padding: 12,
          borderRadius: 8,
          marginBottom: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}
      >
        <span>
          {slot.date} | {slot.startTime} - {slot.endTime}
        </span>

        <button
          onClick={() => bookSlot(slot._id)}
          style={{
            background: "#28a745",
            color: "white",
            border: "none",
            padding: "6px 14px",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Book
        </button>
      </div>
    ))}
  </div>
)}


        {/* TABS */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginBottom: 25,
            borderBottom: "2px solid #ddd",
          }}
        >
          {["profile", "applications", "apply", "notifications"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                border: "none",
                background: "none",
                padding: "10px 15px",
                cursor: "pointer",
                fontWeight: 600,
                borderBottom:
                  tab === t ? "3px solid #3b6edc" : "none",
                color: tab === t ? "#3b6edc" : "black",
              }}
            >
              {t === "profile" && "Profile"}
              {t === "applications" && "My Applications"}
              {t === "apply" && "Apply Marriage"}
              {t === "notifications" && "Notifications"}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}

        {tab === "profile" && (
          <div style={cardStyle}>
            <h3>Profile Information</h3>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Aadhaar:</strong> {user.aadhaar}</p>

          </div>
        )}

{tab === "applications" && (
  <div style={cardStyle}>
    <h3>My Application</h3>

    {!application ? (
      <p>No applications submitted yet.</p>
    ) : (
      <>
        <p>
          <b>CPAN:</b> {cpan}
        </p>

        <p>
          <b>Status:</b>{" "}
{appStatus === "approved"
  ? "Approved"
  : appStatus === "verification_scheduled"
  ? "Verification Scheduled"
  : "Application In Progress"}

        </p>

        <p>
          <b>Date:</b>{" "}
          {new Date(application.createdAt).toLocaleDateString()}
        </p>

<h4>Application Details</h4>

<div style={{ marginTop: 10 }}>
{Object.entries(application.formData || {})
  .filter(([key]) => key !== "userId")
  .map(([key, value]) => (
    <p key={key}>
      <strong>
        {key.replace(/_/g, " ").replace("*", "")}:
      </strong>{" "}
      {String(value)}
    </p>
  ))}

</div>

<h4 style={{ marginTop: 25 }}>Uploaded Documents</h4>

<div>
  {application.documents &&
    Object.entries(application.documents).map(([key, url]) => (
      <p key={key}>
        <strong>
          {key.replace(/_/g, " ").replace("*", "")}:
        </strong>{" "}
        <a
          href={url as string}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#3b6edc" }}
        >
          View Document
        </a>
      </p>
    ))}
</div>


      </>
    )}
  </div>
)}


{tab === "apply" && (
  <div style={cardStyle}>
    {appStatus === "not_applied" ? (
      <ApplyMarriageForm />
    ) : (
      <div style={{ textAlign: "center" }}>
        <h3>Already Applied</h3>
        <p>Status: {appStatus}</p>
        {cpan && <p>CPAN: {cpan}</p>}
      </div>
    )}
  </div>
)}


        {tab === "notifications" && (
          <div style={cardStyle}>
            <h3>Notifications</h3>
            <p>No new notifications.</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: 25,
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

export default Dashboard;
