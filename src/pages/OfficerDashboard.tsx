import { useEffect, useState } from "react";
import OfficerEditApplication from "../components/officer/OfficerEditApplication";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

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

const DetailItem = ({ label, value }: any) => (
  <div style={detailCard}>
    <label style={detailLabel}>{label}</label>
    <div style={detailValue}>{value || "-"}</div>
  </div>
);

const OfficerDashboard = () => {
const [applications, setApplications] = useState<Application[]>([]);
  const [viewApp, setViewApp] = useState<any>(null);
  const [scheduleApp, setScheduleApp] = useState<any>(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [slotModal, setSlotModal] = useState(false);
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [activeTab, setActiveTab] = useState("applications");
const [rescheduleApp, setRescheduleApp] = useState<Application | null>(null);
const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
const [menuOpen, setMenuOpen] = useState(false);
const navigate = useNavigate();
const [verifyApp, setVerifyApp] = useState<any>(null);
const [groomPhoto, setGroomPhoto] = useState("");
const [bridePhoto, setBridePhoto] = useState("");
const [w1Photo, setW1Photo] = useState("");
const [w2Photo, setW2Photo] = useState("");
const [w3Photo, setW3Photo] = useState("");
const [selectedSlot, setSelectedSlot] = useState("");
const [selectedDate, setSelectedDate] = useState("");
const [filteredApps, setFilteredApps] = useState<Application[]>([]);
const [slotOptions, setSlotOptions] = useState<Slot[]>([]);
const [cameraOpen, setCameraOpen] = useState(false);
const [reportType, setReportType] = useState("");
const [currentSetter, setCurrentSetter] = useState<any>(null);
const [stream, setStream] = useState<any>(null);
const [documentsVerified, setDocumentsVerified] = useState(false);
const [citizens, setCitizens] = useState<any[]>([]);
const [viewCitizen, setViewCitizen] = useState<any>(null);
const [officer] = useState<any>(() => {
  const stored = localStorage.getItem("officer");
  return stored ? JSON.parse(stored) : null;
});

useEffect(() => {
  fetch(`${import.meta.env.VITE_API_URL}/slots`)
    .then(res => res.json())
    .then(data => {
      if (data.success) setSlotOptions(data.slots);
    });
}, []);

const filterReports = () => {
  let filtered = applications;

  if (reportType === "slot" && selectedSlot) {
    filtered = applications.filter(
      app => app.appointmentSlot?._id === selectedSlot
    );
  }

if (reportType === "date" && selectedDate) {
  filtered = applications.filter(app => {
    if (!app.appointmentSlot?.date) return false;

    return (
      new Date(app.appointmentSlot.date)
        .toISOString()
        .slice(0, 10) === selectedDate
    );
  });
}

  setFilteredApps(filtered);
};

const printReport = () => {
  const printWindow = window.open("", "", "width=900,height=700");

  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Applications Report</title>
      </head>
      <body>
        <h2>Applications Report</h2>
        <table border="1" cellspacing="0" cellpadding="6">
          <tr>
            <th>CPAN</th>
            <th>Name</th>
            <th>Date</th>
            <th>Slot</th>
          </tr>
          ${filteredApps
            .map(
              a => `
              <tr>
                <td>${a.cpan}</td>
                <td>${a.formData?.["groom_First Name *"] || ""}</td>
                <td>${new Date(
                  a.createdAt || ""
                ).toLocaleDateString()}</td>
                <td>${
                  a.appointmentSlot
                    ? `${a.appointmentSlot.date} ${a.appointmentSlot.startTime}`
                    : "-"
                }</td>
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

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/officer/applications`)
      .then(res => res.json())
      .then(data => setApplications(data || []));
  }, []);

  useEffect(() => {
  if (activeTab === "citizens") {
    fetch(`${import.meta.env.VITE_API_URL}/citizens`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setCitizens(data.users);
      });
  }
}, [activeTab]);

const deleteCitizen = async (id: string) => {
  if (!window.confirm("Delete this citizen?")) return;

  await fetch(`{import.meta.env.VITE_API_URL}/citizens/${id}`, {
    method: "DELETE"
  });

  setCitizens(prev => prev.filter(c => c._id !== id));
};


  const scheduleAppointment = async () => {
    await fetch(
      `${import.meta.env.VITE_API_URL}/officer/schedule/${scheduleApp._id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentDate })
      }
    );

    setApplications(prev =>
      prev.map(a =>
        a._id === scheduleApp._id
          ? { ...a, appointmentDate }
          : a
      )
    );

    setScheduleApp(null);
  };

  const saveSlot = async () => {
    const officer = JSON.parse(localStorage.getItem("officer") || "{}");

    await fetch(`${import.meta.env.VITE_API_URL}/slots`, {
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
    `${import.meta.env.VITE_API_URL}/slots/available`
  );
  const data = await res.json();

  if (data.success) {
    setAvailableSlots(data.slots);
  }
};
const confirmReschedule = async (newSlotId: string) => {
  await fetch(
    `${import.meta.env.VITE_API_URL}/slots/reschedule`,
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

const captureImage = () => {
  const video = document.getElementById("cameraVideo") as HTMLVideoElement;

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx?.drawImage(video, 0, 0);

  const imageData = canvas.toDataURL("image/jpeg");

  currentSetter(imageData);

  stream?.getTracks().forEach((t: any) => t.stop());
  setCameraOpen(false);
};

const uploadToCloudinary = async (image: string) => {
  if (!image) return "";

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/upload-photo`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image })
    }
  );

  const data = await res.json();
  return data.url;
};



const openCamera = async (setter: any) => {
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true
  });

  setStream(mediaStream);
  setCurrentSetter(() => setter);
  setCameraOpen(true);
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
<div style={header}>
  <div style={{ display: "flex", justifyContent: "space-between" }}>
    <div>
      <h2>
        Officer Dashboard – {officer?.name} ({officer?.officerId})
      </h2>

      <p>Marriage Registration Officer – {officer?.ward}</p>
    </div>

    {/* Hamburger */}
    <button
      style={hamburgerBtn}
      onClick={() => setMenuOpen(!menuOpen)}
    >
      ☰
    </button>
  </div>

  {/* Dropdown Menu */}
  {menuOpen && (
    <div style={dropdownMenu}>
      <button
        style={dropdownItem}
onClick={() => {
  navigate("/officer/slots");
  setMenuOpen(false);
}}
      >
        Manage Slot Availability
      </button>
    </div>
  )}
</div>

{/* ===== DASHBOARD STATS ===== */}
<div style={statsContainer}>
  {[
    { label: "Total Applications", value: 11, color: "#1976d2" },
    { label: "Docs Submitted", value: 8, color: "#f57c00" },
    { label: "Physical Verification", value: 9, color: "#1565c0" },
    { label: "Total Approved", value: 9, color: "#2e7d32" },
    { label: "Today's Pending", value: 0, color: "#d32f2f" },
    { label: "Certificates Issued", value: 7, color: "#2e7d32" }
  ].map((item, i) => (
    <div key={i} style={statCard}>
      <h2 style={{ margin: 0, color: item.color }}>
        {item.value}
      </h2>
      <p style={{ margin: "6px 0 0", fontSize: 14 }}>
        {item.label}
      </p>
    </div>
  ))}
</div>

      {/* TABS */}
      <div style={tabBar}>
        {["applications", "appointments", "citizens", "report"].map(tab => (
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
            {tab === "report" && "Report"}
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
        `${import.meta.env.VITE_API_URL}/applications/by-email/${email}`
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

  {/* SHOW ONLY AFTER PHYSICAL VERIFICATION */}
  {app.status === "physical_verification_completed" && (
    <>
      {/* RECEIPT */}
      <button
        style={{ ...certificateBtn, marginLeft: 6 }}
        onClick={async () => {
          try {
            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/officer/generate-receipt/${app.cpan}`
            );

            const data = await res.json();

            if (data.success) {
              window.open(data.url, "_blank");
            } else {
              alert("Failed to generate receipt");
            }
          } catch (err) {
            console.log(err);
            alert("Receipt error");
          }
        }}
      >
        Receipt
      </button>

      {/* GOSHVARA */}
      <button
        style={{ ...certificateBtn, marginLeft: 6 }}
        onClick={async () => {
          try {
            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/officer/generate-goshvara/${app.cpan}`
            );

            const data = await res.json();

            if (data.success) {
              window.open(data.url, "_blank");
            } else {
              alert("Failed to generate Goshvara");
            }
          } catch (err) {
            console.log(err);
            alert("Goshvara error");
          }
        }}
      >
        Goshvara
      </button>

      {/* CERTIFICATE */}
      <button
        style={{ ...certificateBtn, marginLeft: 6 }}
        onClick={async () => {
          try {
            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/officer/generate-certificate/${app.cpan}`
            );

            const data = await res.json();

            if (data.success) {
              window.open(data.url, "_blank");
            } else {
              alert("Failed to generate certificate");
            }
          } catch (err) {
            console.log(err);
            alert("Certificate error");
          }
        }}
      >
        Certificate
      </button>
    </>
  )}
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
  {app.status === "physical_verification_completed" ? (
    <span style={{ color: "green", fontWeight: 600 }}>
      Verification Completed
    </span>
  ) : (
    <>
      <button
        style={scheduleBtn}
        onClick={() => openReschedule(app)}
      >
        Reschedule
      </button>

      <button
        style={{ ...viewBtn, marginLeft: 8 }}
        onClick={() => setVerifyApp(app)}
      >
        Verify
      </button>
    </>
  )}
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

{verifyApp && (
  <div style={overlay}>
    <div style={modal}>
     <h3>Application Verification – {verifyApp.cpan}</h3>
<h4>Uploaded Documents</h4>
<h4>Edit Application (Optional)</h4>
<OfficerEditApplication application={verifyApp} />

      {/* DOCUMENT CHECK */}
      <h4>Document Verification</h4>
      <label>
        <input
          type="checkbox"
          checked={documentsVerified}
          onChange={() => setDocumentsVerified(!documentsVerified)}
        />
        Documents verified physically
      </label>

      <hr />

      {/* LIVE PHOTO SECTION */}
      <h4>Live Photo Capture</h4>

{[
  { label: "Groom", setter: setGroomPhoto, photo: groomPhoto },
  { label: "Bride", setter: setBridePhoto, photo: bridePhoto },
  { label: "Witness 1", setter: setW1Photo, photo: w1Photo },
  { label: "Witness 2", setter: setW2Photo, photo: w2Photo },
  { label: "Witness 3", setter: setW3Photo, photo: w3Photo }
].map(({ label, setter, photo }) => (
  <div key={label} style={{ marginBottom: 15 }}>
    <b>{label}</b>

    <button
      style={{ ...scheduleBtn, marginLeft: 10 }}
      onClick={() => openCamera(setter)}
    >
      Capture
    </button>

    {photo && (
      <img
        src={photo}
        alt="preview"
        style={{ width: 150, marginTop: 10, borderRadius: 6 }}
      />
    )}
  </div>
))}

      <button
        style={scheduleBtn}
onClick={async () => {
  const officer = JSON.parse(
    localStorage.getItem("officer") || "{}"
  );

  const groomUrl = await uploadToCloudinary(groomPhoto);
  const brideUrl = await uploadToCloudinary(bridePhoto);
  const w1Url = await uploadToCloudinary(w1Photo);
  const w2Url = await uploadToCloudinary(w2Photo);
  const w3Url = await uploadToCloudinary(w3Photo);

  await fetch(
    `${import.meta.env.VITE_API_URL}/physical-verify`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId: verifyApp._id,
        cpan: verifyApp.cpan,
        officerId: officer.officerId,
        documentsVerified,
        livePhotos: {
          groom: groomUrl,
          bride: brideUrl,
          witness1: w1Url,
          witness2: w2Url,
          witness3: w3Url
        }
      })
    }
  );

  alert("Verification saved");

  setVerifyApp(null);
}}
      >
        Save Verification
      </button>

      <button
        style={closeBtn}
        onClick={() => setVerifyApp(null)}
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

{activeTab === "report" && (
  <div style={card}>
    <h3>Reports</h3>

    {/* FILTER TYPE SELECTOR */}
    <div style={{ marginBottom: 15 }}>
      <select
        value={reportType}
        onChange={(e) => {
          setReportType(e.target.value);
          setSelectedSlot("");
          setSelectedDate("");
        }}
      >
        <option value="">Select Report Type</option>
        <option value="slot">Slot Wise Report</option>
        <option value="date">Date Wise Report</option>
      </select>
    </div>

    {/* Filters */}
    <div style={{ display: "flex", gap: 15, marginBottom: 20 }}>
      
      {/* SLOT FILTER */}
      {reportType === "slot" && (
        <select
          value={selectedSlot}
          onChange={e => setSelectedSlot(e.target.value)}
        >
          <option value="">Select Slot</option>
          {slotOptions.map(slot => (
            <option key={slot._id} value={slot._id}>
              {slot.date} | {slot.startTime}-{slot.endTime}
            </option>
          ))}
        </select>
      )}

      {/* DATE FILTER */}
      {reportType === "date" && (
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
      )}

      <button style={scheduleBtn} onClick={filterReports}>
        Filter
      </button>

      <button style={viewBtn} onClick={printReport}>
        Print
      </button>
    </div>

    {/* TABLE */}
    <table width="100%" style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f1f3f6" }}>
          <th style={th}>CPAN</th>
          <th style={th}>Applicant</th>
          <th style={th}>Slot Date</th>
          <th style={th}>Time</th>
        </tr>
      </thead>

      <tbody>
        {filteredApps.map(app => (
          <tr key={app._id}>
            <td style={td}>{app.cpan}</td>

            <td style={td}>
              {app.formData?.["groom_First Name *"]}{" "}
              {app.formData?.["groom_Last Name *"]}
            </td>

            <td style={td}>
              {app.appointmentSlot?.date || "-"}
            </td>

            <td style={td}>
              {app.appointmentSlot
                ? `${app.appointmentSlot.startTime} - ${app.appointmentSlot.endTime}`
                : "-"}
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
      <h3 style={{ marginBottom: 20 }}>Citizen Details</h3>

      <div style={detailsGrid}>
        <DetailItem label="Full Name" value={viewCitizen.name} />
        <DetailItem label="Email" value={viewCitizen.email} />
        <DetailItem label="Mobile Number" value={viewCitizen.phone} />
        <DetailItem
          label="Created At"
          value={new Date(viewCitizen.createdAt).toLocaleString()}
        />
        <DetailItem label="User ID" value={viewCitizen._id} />
      </div>

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

{cameraOpen && (
  <div style={overlay}>
    <div style={modal}>
      <h3>Capture Live Photo</h3>

      <video
        id="cameraVideo"
        autoPlay
        playsInline
        ref={video => {
          if (video && stream) video.srcObject = stream;
        }}
        style={{
          width: "100%",
          borderRadius: 8
        }}
      />

      <div style={{ marginTop: 15 }}>
        <button
          style={scheduleBtn}
          onClick={captureImage}
        >
          Capture Photo
        </button>

        <button
          style={closeBtn}
          onClick={() => {
            stream?.getTracks().forEach((t: any) => t.stop());
            setCameraOpen(false);
          }}
        >
          Cancel
        </button>
      </div>
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



const th = {
  padding: "12px 10px",
  textAlign: "left" as const,
  fontWeight: 600
};

const td = {
  padding: "12px 10px"
};


const hamburgerBtn = {
  background: "transparent",
  border: "none",
  fontSize: 22,
  cursor: "pointer",
  color: "black"
};

const dropdownMenu = {
  marginTop: 10,
  background: "#e19316",
  borderRadius: 8,
  padding: 10,
  width: 220,
  boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
};

const dropdownItem = {
  background: "none",
  border: "none",
  padding: 10,
  width: "100%",
  textAlign: "left" as const,
  cursor: "pointer",
  color:"black",
  fontWeight: 600
};

const statsContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 15,
  marginBottom: 20
};

const statCard = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  textAlign: "center" as const,
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
};

const detailsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 15,
  marginBottom: 20
};

const detailCard = {
  background: "#f8f9fb",
  padding: 15,
  borderRadius: 10,
  border: "1px solid #e0e0e0"
};

const detailLabel = {
  fontSize: 13,
  fontWeight: 600,
  color: "#666",
  marginBottom: 6,
  display: "block"
};

const detailValue = {
  fontSize: 15,
  fontWeight: 500,
  color: "#111"
};

const certificateBtn = {
  background: "#3b6edc",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: 6,
  cursor: "pointer"
};