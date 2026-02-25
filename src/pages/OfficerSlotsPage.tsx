import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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

const fetchSlots = async () => {
  const officer = JSON.parse(localStorage.getItem("officer") || "{}");

  if (!officer?.officerId) return;

  const res = await fetch(
    `http://localhost:5000/api/slots?officerId=${officer.officerId}`
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
      `http://localhost:5000/api/slots?officerId=${officer.officerId}`
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

    await fetch(`http://localhost:5000/api/slots/${id}`, {
      method: "DELETE"
    });

    fetchSlots();
  };

  const updateSlot = async (slot: Slot) => {
    const startTime = prompt("New Start Time", slot.startTime);
    const endTime = prompt("New End Time", slot.endTime);

    if (!startTime || !endTime) return;

    await fetch(`http://localhost:5000/api/slots/${slot._id}`, {
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

    await fetch("http://localhost:5000/api/slots", {
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

  return (
    <>
    <Navbar/>
    <div
  style={{
    padding: 20,
    background: "#ffffff",
    color: "#000000",
    minHeight: "100vh"
  }}
>
      <h2>Slot Management</h2>

     <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>DateDate</th>
            <th style={thStyle}>DateTime</th>
            <th style={thStyle}>DateStatus</th>
            <th style={thStyle}>DateCPAN</th>
            <th style={thStyle}>DateAction</th>
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
    <div style={modal}>
      <h3>Add New Slot</h3>

      {/* Calendar popup */}
      <label>Date</label>
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
      />

      <br /><br />

      {/* Time popup */}
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

      <button
        onClick={async () => {
          const officer = JSON.parse(
            localStorage.getItem("officer") || "{}"
          );
          
          await fetch("http://localhost:5000/api/slots", {
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
          window.location.reload();
        }}
        style={scheduleBtn}
      >
        Save Slot
      </button>

      <button
        onClick={() => setShowAddModal(false)}
        style={closeBtn}
      >
        Cancel
      </button>
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