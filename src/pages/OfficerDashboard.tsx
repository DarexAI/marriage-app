import { useEffect, useState } from "react";
import OfficerEditApplication from "../components/officer/OfficerEditApplication";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface Slot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface Application {
  _id: string;
  cpan: string;
  status: string;
appointmentSlot?: {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  formData?: any;
  createdAt?: string;
}

const OfficerDashboard = () => {
const [applications, setApplications] = useState<Application[]>([]);
  const [viewApp, setViewApp] = useState<any>(null);

  const [slotModal, setSlotModal] = useState(false);
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [activeTab, setActiveTab] = useState("applications");
const [rescheduleApp, setRescheduleApp] = useState<Application | null>(null);
const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
const [citizens, setCitizens] = useState<any[]>([]);
const [viewCitizen, setViewCitizen] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/officer/applications")
      .then(res => res.json())
      .then(data => setApplications(data || []));
  }, []);

  useEffect(() => {
  if (activeTab === "citizens") {
    fetch("http://localhost:5000/api/citizens")
      .then(res => res.json())
      .then(data => {
        if (data.success) setCitizens(data.users);
      });
  }
}, [activeTab]);

const deleteCitizen = async (id: string) => {
  if (!window.confirm("Delete this citizen?")) return;

  await fetch(`http://localhost:5000/api/citizens/${id}`, {
    method: "DELETE"
  });

  setCitizens(prev => prev.filter(c => c._id !== id));
};


  const saveSlot = async () => {
    const officer = JSON.parse(localStorage.getItem("officer") || "{}");

    await fetch("http://localhost:5000/api/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        officerId: officer.officerId,
        date: slotDate,
        startTime,
        endTime
      })
    });

    alert("Slot Added");
    setSlotModal(false);
  };

const openReschedule = async (app: Application) => {
  setRescheduleApp(app);

  const res = await fetch(
    "http://localhost:5000/api/slots/available"
  );
  const data = await res.json();

  if (data.success) {
    setAvailableSlots(data.slots);
  }
};
const confirmReschedule = async (newSlotId: string) => {
  await fetch(
    "http://localhost:5000/api/slots/reschedule",
    {
      method:"PUT",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
oldSlotId: rescheduleApp?.appointmentSlot?._id,

        newSlotId,
applicationId: rescheduleApp?._id
      })
    }
  );

  alert("Appointment Rescheduled");
  setRescheduleApp(null);
  window.location.reload();
};



  return (
    <>
          <Navbar />

   <div
  style={{
    padding: 20,
    background: "#f4f6f9",
    color: "black",
    minHeight: "100vh",
    boxSizing: "border-box"
  }}
>

      
      {/* HEADER */}
      <div style={{ ...header, display: "flex", justifyContent: "space-between" }}>
        <div>
          <h2>Officer Dashboard – Vivek (OFF-2025-90157)</h2>
          <p>Marriage Registration Officer – Ward 4</p>
        </div>

        <button style={slotBtn} onClick={() => setSlotModal(true)}>
          Manage Slot Availability
        </button>
      </div>

      {/* TABS */}
      <div style={tabBar}>
        {["applications", "appointments", "citizens"].map(tab => (
          <button
          key={tab}
          onClick={() => setActiveTab(tab)}
            style={{
              ...tabBtn,
              borderBottom:
              activeTab === tab
              ? "3px solid #3b6edc"
                  : "3px solid transparent"
            }}
          >
            {tab === "applications" && "Applications"}
            {tab === "appointments" && "Upcoming Appointments"}
            {tab === "citizens" && "Citizens"}
          </button>
        ))}
      </div>

      {/* APPLICATION TAB */}
{/* APPLICATION TAB */}
{activeTab === "applications" && (
  <div style={card}>
    <h3>Applications</h3>

    <table
      width="100%"
      style={{
        marginTop: 15,
        borderCollapse: "collapse"
      }}
      >
      <thead>
        <tr style={{ background: "#f1f3f6" }}>
          <th style={th}>CPAN</th>
          <th style={th}>Applicant</th>
          <th style={th}>Date</th>
          <th style={th}>Status</th>
          <th style={th}>Action</th>
        </tr>
      </thead>

      <tbody>
        {applications.map(app => (
          <tr key={app._id} style={{ borderBottom: "1px solid #eee" }}>
            {/* CPAN */}
            <td style={td}>{app.cpan}</td>

            {/* Applicant */}
            <td style={td}>
              <b>
                {app.formData?.["groom_First Name *"]}{" "}
                {app.formData?.["groom_Last Name *"]}
              </b>
              <br />
              <small>{app.formData?.userId}</small>
            </td>

            {/* Date */}
            <td style={td}>
              {new Date(app.createdAt || "").toLocaleDateString()}
            </td>

            {/* Status */}
            <td style={td}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  fontSize: 12,
                  background:
                  app.status === "approved"
                  ? "#d4edda"
                  : app.status === "verification_scheduled"
                  ? "#cfe2ff"
                  : "#fff3cd"
                }}
                >
                {app.status === "verification_scheduled"
                  ? "Verification Scheduled"
                  : app.status}
              </span>
            </td>

            {/* Action */}
            <td style={td}>
              <button
                style={viewBtn}
                onClick={async () => {
                  const email = app.formData?.userId;
                  
                  const res = await fetch(
                    `http://localhost:5000/api/applications/by-email/${email}`
                  );
                  
                  const data = await res.json();
                  
                  if (data.success) {
                    setViewApp(data.application);
                  } else {
                    alert("Application not found");
                  }
                }}
                >
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


      {/* UPCOMING APPOINTMENTS TAB */}
{/* UPCOMING APPOINTMENTS TAB */}
{activeTab === "appointments" && (
  <div style={card}>
    <h3>Upcoming Appointments</h3>

    <table
      width="100%"
      style={{
        marginTop: 15,
        borderCollapse: "collapse"
      }}
    >
      <thead>
        <tr style={{ background: "#f1f3f6" }}>
          <th style={th}>CPAN</th>
          <th style={th}>Applicant</th>
          <th style={th}>Appointment Date</th>
          <th style={th}>Time</th>
          <th style={th}>Status</th>
          <th style={th}>Actions</th>
        </tr>
      </thead>

      <tbody>
        {applications
.filter(
  a =>
    a.status === "verification_scheduled" &&
    a.appointmentSlot?.date
  )
  
  .sort(
  (a, b) =>
    new Date(a.appointmentSlot!.date).getTime() -
    new Date(b.appointmentSlot!.date).getTime()
  )
  
  .map(app => (
    <tr key={app._id} style={{ borderBottom: "1px solid #eee" }}>
              {/* CPAN */}
              <td style={td}>{app.cpan}</td>

              {/* Applicant */}
              <td style={td}>
                <b>
                  {app.formData?.["groom_First Name *"]}{" "}
                  {app.formData?.["groom_Last Name *"]}
                </b>
                <br />
                <small>{app.formData?.userId}</small>
              </td>

              {/* Appointment Date */}
<td style={td}>
  {app.appointmentSlot
    ? new Date(app.appointmentSlot.date).toLocaleDateString()
    : "Not Assigned"}
</td>


              {/* Time */}
<td style={td}>
  {app.appointmentSlot
    ? `${app.appointmentSlot.startTime} - ${app.appointmentSlot.endTime}`
    : "Not Assigned"}
</td>



              {/* Status */}
              <td style={td}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 8,
                    fontSize: 12,
                    background: "#cfe2ff"
                  }}
                >
                  Verification Scheduled
                </span>
              </td>

              {/* Actions */}
              <td style={td}>
                <button
                  style={scheduleBtn}
                  onClick={() => openReschedule(app)}
                  >
                  Reschedule
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>

    {applications.filter(
      a => a.status === "verification_scheduled"
    ).length === 0 && (
      <p style={{ marginTop: 20 }}>
        No appointments scheduled yet.
      </p>
    )}
  </div>
)}
{/* RESCHEDULE MODAL */}
{rescheduleApp && (
  <div style={overlay}>
    <div style={modal}>
      <h3>Reschedule Appointment</h3>

      {availableSlots.length === 0 && (
        <p>No slots available</p>
      )}

      {availableSlots.map(slot => (
        <div
        key={slot._id}
        style={{
          padding: 10,
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between"
        }}
        >
          <span>
            {slot.date} | {slot.startTime} - {slot.endTime}
          </span>

          <button
            style={scheduleBtn}
            onClick={() => confirmReschedule(slot._id)}
          >
            Select
          </button>
        </div>
      ))}

      <button
        style={closeBtn}
        onClick={() => setRescheduleApp(null)}
        >
        Cancel
      </button>
    </div>
  </div>
)}




      {/* CITIZENS TAB */}
{activeTab === "citizens" && (
  <div style={card}>
    <h3>Citizens Records</h3>

    <table
      width="100%"
      style={{
        marginTop: 15,
        borderCollapse: "collapse"
      }}
    >
      <thead>
        <tr style={{ background: "#f1f3f6" }}>
          {/* <th style={th}>CPAN</th> */}
          <th style={th}>Name</th>
          <th style={th}>Email</th>
          <th style={th}>Mobile</th>
          <th style={th}>Created At</th>
          <th style={th}>Actions</th>
        </tr>
      </thead>

      <tbody>
        {citizens.map(c => (
          <tr key={c._id} style={{ borderBottom: "1px solid #eee" }}>
            {/* <td style={td}>{c.cpan || "-"}</td> */}

            <td style={td}>{c.name}</td>

            <td style={td}>{c.email}</td>

            <td style={td}>{c.phone}</td>

            <td style={td}>
              {new Date(c.createdAt).toLocaleDateString()}
            </td>

            <td style={td}>
              <button
                style={viewBtn}
                onClick={() => setViewCitizen(c)}
              >
                View
              </button>

              <button
                style={{
                  ...closeBtn,
                  background: "#dc3545",
                  color: "white"
                }}
                onClick={() => deleteCitizen(c._id)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
{viewCitizen && (
  <div style={overlay}>
    <div style={modal}>
      <h3>Citizen Details</h3>

      <pre>
        {JSON.stringify(viewCitizen, null, 2)}
      </pre>

      <button
        style={closeBtn}
        onClick={() => setViewCitizen(null)}
        >
        Close
      </button>
    </div>
  </div>
)}

      {/* VIEW APPLICATION MODAL */}
{viewApp && (
  <div style={overlay}>
    <div style={modal}>
      <h3>Application Details</h3>

      {/* SHOW SUBMITTED DATA */}
      <div
        style={{
          background: "#f5f6f8",
          padding: 15,
          borderRadius: 8,
          marginBottom: 20,
          maxHeight: 250,
          overflow: "auto"
        }}
        >
        <pre>
          {JSON.stringify(viewApp.formData, null, 2)}
        </pre>
      </div>

      <h4>Edit Application (Optional)</h4>

      {/* YOUR ORIGINAL FORM (UNCHANGED) */}
<OfficerEditApplication application={viewApp} />

      <button
        style={closeBtn}
        onClick={() => setViewApp(null)}
        >
        Close
      </button>
    </div>
  </div>
)}


      {/* SLOT AVAILABILITY MODAL */}
      {slotModal && (
        <div style={overlay}>
          <div style={modal}>
            <h3>Add Verification Slot</h3>

            <label>Date</label>
            <input
              type="date"
              value={slotDate}
              onChange={e => setSlotDate(e.target.value)}
              />

            <br /><br />

            <label>Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              />

            <br /><br />

            <label>End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
            />

            <br /><br />

            <button style={scheduleBtn} onClick={saveSlot}>
              Save Slot
            </button>

            <button style={closeBtn} onClick={() => setSlotModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
      <Footer />
</>
  );
};

export default OfficerDashboard;


/* ===== STYLES ===== */

const header = {
  background: "linear-gradient(90deg,#ff6a00,#ffa726)",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20,
  color: "black"
};

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 12
};

const overlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modal = {
  background: "#fff",
  padding: 30,
  borderRadius: 12,
  width: "80%",
  maxHeight: "90vh",
  overflow: "auto"
};

const viewBtn = {
  background: "#ff7043",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: 6,
  marginRight: 5
};

const scheduleBtn = {
  background: "#4caf50",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: 6
};

const closeBtn = {
  background: "#aaa",
  border: "none",
  padding: "6px 12px",
  borderRadius: 6,
  marginLeft: 10
};

const tabBar = {
  display: "flex",
  gap: 20,
  marginBottom: 20,
  borderBottom: "2px solid #ddd"
};

const tabBtn = {
  background: "none",
  border: "none",
  padding: "12px 20px",
  fontWeight: 600,
  cursor: "pointer",
  color: "black"
};

const slotBtn = {
  background: "#1976d2",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer"
};

const th = {
  padding: "12px 10px",
  textAlign: "left" as const,
  fontWeight: 600
};

const td = {
  padding: "12px 10px"
};
