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
const [documents, setDocuments] = useState<any>(null);
const [checkingDocs, setCheckingDocs] = useState(false);
const [popupMsg, setPopupMsg] = useState<string | null>(null);
const [slots, setSlots] = useState<any[]>([]);
const [showSlots, setShowSlots] = useState(false);
const [selectedSlot, setSelectedSlot] = useState<any>(null);
const [loadingTab, setLoadingTab] = useState<string | null>(null);
useEffect(() => {
  const stored = localStorage.getItem("applicant");

  if (!stored) {
    navigate("/login");
    return;
  }

  const parsed = JSON.parse(stored);

  // FETCH FROM MONGODB
  fetch(`${import.meta.env.VITE_API_URL}/profile/${parsed.email}`)
    .then((res) => res.json())
.then(async (data) => {
  if (data.success) {
    setUser(data.user);

    // FETCH APPLICATION STATUS
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/applications/status/${data.user.email}`
    );

    const appData = await res.json();
setApplication(appData.application || null);
setAppStatus(appData.status || "not_applied");
setCpan(appData.cpan || "");
// CHECK IF DOCUMENTS EXIST IN CERTIFICATES TABLE
if (appData.cpan) {
  try {
    setCheckingDocs(true);

    const docRes = await fetch(
      `${import.meta.env.VITE_API_URL}/documents/${appData.cpan}`
    );

    const docData = await docRes.json();

    if (docData.success) {
      setDocuments(docData.documents);
    } else {
      setDocuments(null);
    }

  } catch {
    setDocuments(null);
  } finally {
    setCheckingDocs(false);
  }
}

// CHECK IF SLOT STILL EXISTS
// CHECK IF SLOT STILL EXISTS
// RESTORE BOOKED SLOT AFTER REFRESH
if (appData.application?.appointmentSlot) {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/slots/${appData.application.appointmentSlot}`
    );

    const slotData = await res.json();

    if (slotData.success) {
      const slot = slotData.slot;

      setSelectedSlot({
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime
      });

      // ✅ DO NOT override status
    } else {
      setSelectedSlot(null);
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
      `${import.meta.env.VITE_API_URL}/slots/book`,
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
  setPopupMsg("Verification slot booked successfully!");
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
      setPopupMsg(data.msg);
    }

  } catch {
    setPopupMsg("Booking failed");
  }
};



  if (!user) return null;

  return (
    <>
      <Navbar />
      {popupMsg && (
  <div style={toastStyle}>
    <span>{popupMsg}</span>
    <span
      onClick={() => setPopupMsg(null)}
      style={closeStyle}
    >
      ✕
    </span>
  </div>
)}

      <div
        style={{
          minHeight: "80vh",
          background: "#f4f6f9",
          padding: "20px 15px",
boxSizing: "border-box",
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
alignItems: "center",
flexWrap: "wrap",
gap: 15
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
{appStatus === "physical_verification_completed" && " Physical Verification Completed"}
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/slots/available`);
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
      Book Slot
    </button>
  )}
</div>
{/* SELECTED SLOT DISPLAY */}
{selectedSlot &&
 appStatus !== "physical_verification_completed" &&
 appStatus !== "approved" && (
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
flexWrap: "wrap",
gap: 10,
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
            width: "100%",
maxWidth: 100,
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
  gap: 10,
  marginBottom: 25,
  borderBottom: "2px solid #ddd",
  overflowX: "auto",
  whiteSpace: "nowrap"
}}
        >
          {["profile", "applications", "apply", "notifications"].map((t) => (
           <button
  key={t}
  onClick={() => {
    if (t === tab) return;

    setLoadingTab(t);

    setTimeout(() => {
      setTab(t);
      setLoadingTab(null);
    }, 800);
  }}
 style={{
  border: "none",
  background: "none",
  padding: "10px 15px",
  cursor: "pointer",
  fontWeight: 600,
  borderBottom: tab === t ? "3px solid #3b6edc" : "none",
  color: tab === t ? "#3b6edc" : "black",
  position: "relative",

  minWidth: 120,      // 🔥 ADD THIS
  flexShrink: 0,      // 🔥 ADD THIS
  height: 40,
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}}
>
  {/* TEXT */}
  <span style={{ opacity: loadingTab === t ? 0 : 1 }}>
    {t === "profile" && "Profile"}
    {t === "applications" && "My Applications"}
    {t === "apply" && "Apply Marriage"}
    {t === "notifications" && "Notifications"}
  </span>

  {/* LOADER */}
  {loadingTab === t && (
    <span
      style={{
        position: "absolute",
        width: 18,
        height: 18,
        border: "2px solid #3b6edc",
        borderTop: "2px solid transparent",
        borderRadius: "50%",
        animation: "tabSpin 0.6s linear infinite"
      }}
    />
  )}
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
  : appStatus === "physical_verification_completed"
  ? "Physical Verification Completed"
  : appStatus === "verification_scheduled"
  ? "Verification Scheduled"
  : "Application In Progress"}

        </p>

        <p>
          <b>Date:</b>{" "}
          {new Date(application.createdAt).toLocaleDateString()}
        </p>

<h4 style={{ marginTop: 20 }}>Application Details</h4>
<SectionCard title="Generated Documents">

  {!cpan && (
    <Field label="Status" value="No application found." full />
  )}

  {cpan && checkingDocs && (
    <Field label="Status" value="Checking documents..." full />
  )}

  {cpan && !checkingDocs && documents && (
    <>
      {documents.certificateUrl && (
        <DocumentCard
          label="Marriage Certificate"
          url={documents.certificateUrl}
        />
      )}

      {documents.receiptUrl && (
        <DocumentCard
          label="Payment Receipt"
          url={documents.receiptUrl}
        />
      )}

      {documents.goshvaraUrl && (
        <DocumentCard
          label="Goshvara"
          url={documents.goshvaraUrl}
        />
      )}

      {!documents.certificateUrl &&
        !documents.receiptUrl &&
        !documents.goshvaraUrl && (
          <Field label="Status" value="No documents generated yet." full />
        )}
    </>
  )}

</SectionCard>
{/* GROOM SECTION */}
<SectionCard title="Groom Details">
  <Field label="Full Name"
    value={`${application.formData.groom_FirstName} ${application.formData.groom_MiddleName} ${application.formData.groom_LastName}`} />
  <Field label="Date of Birth" value={application.formData.groom_DateofBirth} />
  <Field label="Age at Marriage" value={application.formData.groom_AgeatMarriage} />
  <Field label="Occupation" value={application.formData.groom_Occupation} />
  <Field label="Religion" value={application.formData.groom_Religion} />
  <Field label="PAN Number" value={application.formData.groom_PANNumber} />
  <Field label="Aadhaar Number" value={application.formData.groom_AadhaarNumber} />
  <Field label="Address" value={application.formData.groom_CompleteAddressinEnglish} full />
</SectionCard>

{/* BRIDE SECTION */}
<SectionCard title="Bride Details">
  <Field label="Full Name"
    value={`${application.formData.bride_FirstName} ${application.formData.bride_MiddleName} ${application.formData.bride_LastName}`} />
  <Field label="Date of Birth" value={application.formData.bride_DateofBirth} />
  <Field label="Age at Marriage" value={application.formData.bride_AgeatMarriage} />
  <Field label="Occupation" value={application.formData.bride_Occupation} />
  <Field label="Religion" value={application.formData.bride_Religion} />
  <Field label="PAN Number" value={application.formData.bride_PANNumber} />
  <Field label="Aadhaar Number" value={application.formData.bride_AadhaarNumber} />
  <Field label="Address" value={application.formData.bride_CompleteAddressinEnglish} full />
</SectionCard>

{/* MARRIAGE DETAILS */}
<SectionCard title="Marriage Details">
  <Field label="Marriage Date" value={application.formData.marriage_MarriageDate} />
  <Field label="Place of Marriage" value={application.formData.marriage_PlaceofMarriage} />
  <Field label="Marriage Type" value={application.formData.marriage_MarriageType} />
  <Field label="Ward / Zone" value={application.formData["marriage_Ward/Zone"]} />
</SectionCard>

<SectionCard title="Witness 1 Details">
  <Field label="Full Name" value={application.formData.witness1_Witness1FullName} />
  <Field label="Mobile Number" value={application.formData.witness1_Witness1MobileNumber} />
  <Field label="Aadhaar Number" value={application.formData.witness1_Witness1AadhaarNumber} />
  <Field label="Relation" value={application.formData["witness1_RelationtoBride/Groom"]} />
  <Field label="ID Proof Type" value={application.formData.witness1_IDProofType} />
  <Field label="Address" value={application.formData.witness1_CompleteAddress} full />
</SectionCard>

<SectionCard title="Witness 2 Details">
  <Field label="Full Name" value={application.formData.witness2_Witness2FullName} />
  <Field label="Mobile Number" value={application.formData.witness2_Witness2MobileNumber} />
  <Field label="Aadhaar Number" value={application.formData.witness2_Witness2AadhaarNumber} />
  <Field label="Relation" value={application.formData["witness2_RelationtoBride/Groom"]} />
  <Field label="ID Proof Type" value={application.formData.witness2_IDProofType} />
  <Field label="Address" value={application.formData.witness2_CompleteAddress} full />
</SectionCard>

<SectionCard title="Witness 3 Details">
  <Field label="Full Name" value={application.formData.witness3_Witness3FullName} />
  <Field label="Mobile Number" value={application.formData.witness3_Witness3MobileNumber} />
  <Field label="Aadhaar Number" value={application.formData.witness3_Witness3AadhaarNumber} />
  <Field label="Relation" value={application.formData["witness3_RelationtoBride/Groom"]} />
  <Field label="ID Proof Type" value={application.formData.witness3_IDProofType} />
  <Field label="Address" value={application.formData.witness3_CompleteAddress} full />
</SectionCard>

<h4 style={{ marginTop: 25 }}>Uploaded Documents</h4>

<SectionCard title="Uploaded Documents">
  <DocumentCard label="Groom Photograph" url={application.documents?.groom_Photograph} />
  <DocumentCard label="Groom Aadhaar" url={application.documents?.groom_Aadhaar} />
  <DocumentCard label="Groom Age Proof" url={application.documents?.groom_ProofofAge} />
  <DocumentCard label="Groom Residence Proof" url={application.documents?.groom_ProofofResidence} />

  <DocumentCard label="Bride Photograph" url={application.documents?.bride_Photograph} />
  <DocumentCard label="Bride Aadhaar" url={application.documents?.bride_Aadhaar} />
  <DocumentCard label="Bride Age Proof" url={application.documents?.bride_ProofofAge} />
  <DocumentCard label="Bride Residence Proof" url={application.documents?.bride_ProofofResidence} />

  <DocumentCard label="Wedding Invitation" url={application.documents?.["marriageDoc_WeddingCard/Invitation"]} />
  <DocumentCard label="Marriage Affidavit" url={application.documents?.marriageDoc_MarriageAffidavit} />
  <DocumentCard label="Priest Certificate" url={application.documents?.["marriageDoc_PriestSignature/Certificate"]} />
  <DocumentCard label="Wedding Photo" url={application.documents?.marriageDoc_WeddingPhoto} />

  <DocumentCard label="Witness 1 ID Proof" url={application.documents?.witness1_IDProof} />
  <DocumentCard label="Witness 1 Photo" url={application.documents?.witness1_Witness1Photo} />

  <DocumentCard label="Witness 2 ID Proof" url={application.documents?.witness2_IDProof} />
  <DocumentCard label="Witness 2 Photo" url={application.documents?.witness2_Witness2Photo} />

  <DocumentCard label="Witness 3 ID Proof" url={application.documents?.witness3_IDProof} />
  <DocumentCard label="Witness 3 Photo" url={application.documents?.witness3_Witness3Photo} />
</SectionCard>
{/* GENERATED DOCUMENTS (CERTIFICATE / RECEIPT / GOSHVARA) */}



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
    <h3>Documents</h3>

    {!cpan && <p>No application found.</p>}

    {cpan && checkingDocs && (
      <p>Checking documents...</p>
    )}

    {cpan && !checkingDocs && !documents && (
      <p>No documents generated yet.</p>
    )}

    {cpan && !checkingDocs && documents && (
      <>
        {(documents.certificateUrl ||
          documents.receiptUrl ||
          documents.goshvaraUrl) ? (

          <div style={{ display: "flex",
gap: 10,
flexWrap: "wrap", marginTop: 20 }}>

            {documents.certificateUrl && (
              <button
                onClick={() =>
                  window.open(documents.certificateUrl, "_blank")
                }
                style={docBtnStyle}
              >
                View Certificate
              </button>
            )}

            {documents.receiptUrl && (
              <button
                onClick={() =>
                  window.open(documents.receiptUrl, "_blank")
                }
                style={docBtnStyle}
              >
                View Receipt
              </button>
            )}

            {documents.goshvaraUrl && (
              <button
                onClick={() =>
                  window.open(documents.goshvaraUrl, "_blank")
                }
                style={docBtnStyle}
              >
                View Goshvara
              </button>
            )}

          </div>

        ) : (
          <p>No documents available yet.</p>
        )}
      </>
    )}
  </div>
)}
      </div>
      <style>
{`
@keyframes tabSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`}
</style>
<style>
{`
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
`}
</style>
      <Footer />
    </>
  );
};

const cardStyle: React.CSSProperties = {
  background: "white",
  padding: "20px 15px",
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const tabLoaderOverlay: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(255,255,255,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const toastStyle: React.CSSProperties = {
  position: "fixed",
  top: 15,
  right: 15,
  left: 15, // 🔥 Important for mobile
  background: "#28a745",
  color: "white",
  padding: "12px 16px",
  borderRadius: 8,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  zIndex: 9999,
};

const docBtnStyle: React.CSSProperties = {
  padding: "10px 18px",
  background: "#3b6edc",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600
};

const closeStyle: React.CSSProperties = {
  cursor: "pointer",
  fontWeight: "bold",
};

const SectionCard = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      marginTop: 20,
      background: "#f9fafc",
      padding: 20,
      borderRadius: 12,
      border: "1px solid #e2e6ea"
    }}
  >
    <h3 style={{ marginBottom: 15 }}>{title}</h3>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: 15
      }}
    >
      {children}
    </div>
  </div>
);

const Field = ({
  label,
  value,
  full
}: {
  label: string;
  value: any;
  full?: boolean;
}) => (
  <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
    <div
      style={{
        fontSize: 13,
        color: "#666",
        marginBottom: 4
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontWeight: 600,
        color: "#222"
      }}
    >
      {value || "-"}
    </div>
  </div>
);


const DocumentCard = ({
  label,
  url
}: {
  label: string;
  url?: string;
}) => (
  <div
    style={{
      background: "#fff",
      padding: 12,
      borderRadius: 10,
      border: "1px solid #e2e6ea",
      display: "flex",
      flexDirection: "column",
      gap: 8
    }}
  >
    <div style={{ fontSize: 14, fontWeight: 600 }}>
      {label}
    </div>

    {url ? (
      <button
        onClick={() => window.open(url, "_blank")}
        style={{
          background: "#3b6edc",
          color: "#fff",
          border: "none",
          padding: "6px 10px",
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        View Document
      </button>
    ) : (
      <span style={{ fontSize: 12, color: "#999" }}>
        Not Uploaded
      </span>
    )}
  </div>
);


export default Dashboard;


