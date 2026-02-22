import { useEffect, useState } from "react";

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

  const fetchSlots = () => {
    fetch("http://localhost:5000/api/slots")
      .then(res => res.json())
      .then(data => {
        if (data.success) setSlots(data.slots);
      });
  };

  useEffect(() => {
    fetchSlots();
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
    <div
  style={{
    padding: 20,
    background: "#ffffff",
    color: "#000000",
    minHeight: "100vh"
  }}
>
      <h2>Slot Management</h2>

      <table width="100%" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>CPAN</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {slots.map(slot => (
            <tr key={slot._id}>
              <td>{new Date(slot.date).toLocaleDateString()}</td>

              <td>
                {slot.startTime} - {slot.endTime}
              </td>

              <td>
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

              <td>{slot.cpan || "-"}</td>

              <td>
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
  );
};

export default OfficerSlotsPage;

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
  padding: 25,
  borderRadius: 10,
  width: 320
};

const scheduleBtn = {
  background: "#4caf50",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
  cursor: "pointer"
};

const closeBtn = {
  background: "#aaa",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
  marginLeft: 10,
  cursor: "pointer"
};