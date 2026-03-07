import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
interface Slot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  cpan?: string;
}

const OfficerSlotsPage = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
const [showAddModal, setShowAddModal] = useState(false);
const [date, setDate] = useState("");
const [startTime, setStartTime] = useState("");
const [endTime, setEndTime] = useState("");
const navigate = useNavigate();

const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 768);
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);

const fetchSlots = async () => {
  const officer = JSON.parse(localStorage.getItem("officer") || "{}");

  if (!officer?.officerId) return;

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/slots?officerId=${officer.officerId}`
  );

  const data = await res.json();

  if (data.success) {
    setSlots(data.slots);
  }
};

 useEffect(() => {
  const loadSlots = async () => {
    const officer = JSON.parse(localStorage.getItem("officer") || "{}");

    if (!officer?.officerId) return;

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/slots?officerId=${officer.officerId}`
    );

    const data = await res.json();

    if (data.success) {
      setSlots(data.slots);
    }
  };

  loadSlots();
}, []);
  const deleteSlot = async (id: string) => {
    if (!window.confirm("Delete this slot?")) return;

    await fetch(`${import.meta.env.VITE_API_URL}/slots/${id}`, {
      method: "DELETE"
    });

    fetchSlots();
  };

  const updateSlot = async (slot: Slot) => {
    const startTime = prompt("New Start Time", slot.startTime);
    const endTime = prompt("New End Time", slot.endTime);

    if (!startTime || !endTime) return;

    await fetch(`${import.meta.env.VITE_API_URL}/slots/${slot._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime, endTime })
    });

    fetchSlots();
  };

  const addSlot = async () => {
    const date = prompt("Enter Date (YYYY-MM-DD)");
    const startTime = prompt("Start Time (HH:mm)");
    const endTime = prompt("End Time (HH:mm)");

    if (!date || !startTime || !endTime) return;

    const officer = JSON.parse(localStorage.getItem("officer") || "{}");

    await fetch(`${import.meta.env.VITE_API_URL}/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        officerId: officer.officerId,
        date,
        startTime,
        endTime
      })
    });

    fetchSlots();
  };
const generateDaySlots = async () => {
  if (!date) {
    alert("Please select a date first");
    return;
  }

  const officer = JSON.parse(localStorage.getItem("officer") || "{}");

  const timeSlots = [
    ["10:00 AM","10:30 AM"],
    ["10:30 AM","11:00 AM"],
    ["11:00 AM","11:30 AM"],
    ["11:30 AM","12:00 PM"],
    ["12:00 PM","12:30 PM"],
    ["12:30 PM","01:00 PM"],
    ["01:00 PM","01:30 PM"],
    ["02:00 PM","02:30 PM"],
    ["02:30 PM","03:00 PM"],
    ["03:00 PM","03:30 PM"],
    ["03:30 PM","04:00 PM"],
    ["04:00 PM","04:30 PM"],
    ["04:30 PM","05:00 PM"]
  ];

  const slotsToCreate = timeSlots.map(([start,end]) => ({
    officerId: officer.officerId,
    date,
    startTime: start,
    endTime: end
  }));

  await Promise.all(
    slotsToCreate.map(slot =>
      fetch(`${import.meta.env.VITE_API_URL}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slot)
      })
    )
  );

  setShowAddModal(false);
  fetchSlots();
};

  return (
    <>
    <Navbar/>
<div
  style={{
    padding: isMobile ? 15 : 20,
    background: "#ffffff",
    color: "#000000",
    minHeight: "100vh",
    width: "100%",
    maxWidth: "100vw",
    boxSizing: "border-box",
    overflowX: "hidden"
  }}
>
  <button
  onClick={() => navigate("/officer")}
  style={backBtn}
>
  ← Back to Dashboard
</button>
      <h2>Slot Management</h2>

<div
  style={{
    width: "100%",
    overflowX: isMobile ? "auto" : "visible",
    WebkitOverflowScrolling: "touch"
  }}
>
  <table
    style={{
      ...tableStyle,
      minWidth: isMobile ? 650 : "100%"
    }}
  >
        <thead>
          <tr>
          <th style={thStyle}>Date</th>
<th style={thStyle}>Time</th>
<th style={thStyle}>Status</th>
<th style={thStyle}>CPAN</th>
<th style={thStyle}>Action</th>
          </tr>
        </thead>

        <tbody>
          {slots.map(slot => (
            <tr key={slot._id} style={trStyle}>
              <td style={tdStyle}>{new Date(slot.date).toLocaleDateString()}</td>

              <td style={tdStyle}>
                {slot.startTime} - {slot.endTime}
              </td>

              <td style={tdStyle}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    background:
                    slot.status === "booked"
                    ? "#fff3cd"
                        : "#d4edda"
                      }}
                      >
                  {slot.status}
                </span>
              </td>

              <td style={tdStyle}>{slot.cpan || "-"}</td>

              <td style={tdStyle}>
                {slot.status === "available" && (
                  <>
                    <button
                      onClick={() => updateSlot(slot)}
                      style={{
                        background: "#1976d2",
                        color: "white",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: 6,
                        marginRight: 5
                      }}
                      >
                      Update
                    </button>

                    <button
                      onClick={() => deleteSlot(slot._id)}
                      style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: 6
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Add Slot Button */}
      <div style={{ marginTop: 30 }}>
       <button
  onClick={() => setShowAddModal(true)}
  style={{
    background: "#4caf50",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: 8
  }}
>
  + Add New Slot
</button>
{showAddModal && (
  <div style={overlay}>
    <div style={modalNew}>
      <h2 style={{ marginBottom: 20 }}>Add Appointment Slot</h2>

      <div style={field}>
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={field}>
        <label>Start Time</label>
        <input
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={field}>
        <label>End Time</label>
        <input
          type="time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginTop: 25 }}>
        <button
          onClick={async () => {
            const officer = JSON.parse(
              localStorage.getItem("officer") || "{}"
            );

            await fetch(`${import.meta.env.VITE_API_URL}/slots`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                officerId: officer.officerId,
                date,
                startTime,
                endTime
              })
            });

            setShowAddModal(false);
            fetchSlots();
          }}
          style={saveBtn}
        >
          Save Slot
        </button>
        <button
onClick={generateDaySlots}
  style={{
    background: "#1976d2",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    marginRight: 10
  }}
>
  Generate full day slots
</button>

        <button
          onClick={() => setShowAddModal(false)}
          style={cancelBtn}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
      </div>
      
    </div>
    <Footer/>
        </>
  );
};

export default OfficerSlotsPage;

const overlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backdropFilter: "blur(3px)",   // modern blur effect
  zIndex: 999
};

const modal = {
  background: "#ffffff",
  padding: "30px 28px",
  borderRadius: 16,
  width: 360,
  boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
  animation: "fadeIn 0.25s ease",
  fontFamily: "Segoe UI, sans-serif"
};

const scheduleBtn = {
  background: "linear-gradient(135deg,#45A98F,#2F7F6A)",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  transition: "0.25s",
  boxShadow: "0 4px 12px rgba(69,169,143,0.35)"
};

const closeBtn = {
  background: "#eef1f5",
  color: "#333",
  border: "none",
  padding: "10px 18px",
  borderRadius: 8,
  marginLeft: 12,
  cursor: "pointer",
  fontWeight: 500,
  transition: "0.25s"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "separate" as const,
  borderSpacing: "0 8px",
};

const thStyle = {
  textAlign: "left" as const,
  padding: "12px 14px",
  fontWeight: 600,
  color: "#1f2d2a",
  background: "#f1f4f8",
  borderBottom: "2px solid #e0e6ed",
};

const trStyle = {
  background: "#ffffff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  borderRadius: 8,
};

const tdStyle = {
  padding: "12px 14px",
  borderTop: "1px solid #f0f0f0",
};

const statusBadge = {
  padding: "4px 12px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: 0.3,
};

const backBtn = {
  background: "transparent",
  border: "1px solid #45A98F",
  color: "#45A98F",
  padding: "8px 16px",
  borderRadius: 8,
  cursor: "pointer",
  marginBottom: 15,
  fontWeight: 600
};

const modalNew = {
  background: "#fff",
  padding: 30,
  borderRadius: 16,
 width: "95%",
maxWidth: 380,
  boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
  fontFamily: "Segoe UI"
};

const field = {
  marginBottom: 16,
  display: "flex",
  flexDirection: "column" as const
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  marginTop: 5,
  fontSize: 14
};

const saveBtn = {
  background: "#45A98F",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  marginRight: 10
};

const cancelBtn = {
  background: "#f1f1f1",
  border: "none",
  padding: "10px 20px",
  borderRadius: 8,
  cursor: "pointer"
};