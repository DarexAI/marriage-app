import React, { useState } from "react";

const ApplyMarriageForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});

  const next = () => step < 6 && setStep(step + 1);
  const prev = () => step > 1 && setStep(step - 1);
const [showSuccess, setShowSuccess] = useState(false);
const [cpan, setCpan] = useState("");


const submitApplication = async () => {
  try {
    const form = new FormData();
    const textData: any = {};

    Object.entries(formData).forEach(([key, val]: any) => {
      if (val instanceof File) {
        form.append(key, val);
      } else {
        textData[key] = val;
      }
    });

    const applicant = JSON.parse(
      localStorage.getItem("applicant") || "{}"
    );

    // ADD USER ID INSIDE JSON
    textData.userId = applicant.email;
form.append("userId", applicant.email);
    // SEND JSON ONCE
    form.append("data", JSON.stringify(textData));

    const res = await fetch(
      "http://localhost:5000/api/applications",
      {
        method: "POST",
        body: form,
      }
    );

    const data = await res.json();

    if (data.success) {
      setCpan(data.cpan);
      setShowSuccess(true);
      setTimeout(() => window.location.reload(), 1500);
    } else {
      alert("Submission failed");
    }

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};




  return (
    <div style={{ background: "white", padding: 25, borderRadius: 12 }}>
      {/* STEP NAVIGATION */}
      <div style={navStyle}>
        {[
          "Groom Details",
          "Bride Details",
          "Marriage Details",
          "Witness 1",
          "Witness 2",
          "Witness 3",
        ].map((s, i) => (
          <div
            key={i}
            onClick={() => setStep(i + 1)}
            style={{
              ...navItem,
              color: step === i + 1 ? "#3b6edc" : "black",
              borderBottom:
                step === i + 1 ? "3px solid #3b6edc" : "none",
              cursor: "pointer",
            }}
          >
            {s}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <h3 style={title}>Groom Details</h3>
<NameFields prefix="groom" formData={formData} setFormData={setFormData} />
<BasicDetails prefix="groom" formData={formData} setFormData={setFormData} />
<AddressFields prefix="groom" formData={formData} setFormData={setFormData} />
<Documents prefix="groom" title="Groom Documents" formData={formData} setFormData={setFormData} />

        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <h3 style={title}>Bride Details</h3>
<NameFields prefix="bride" formData={formData} setFormData={setFormData} />
<BasicDetails prefix="bride" formData={formData} setFormData={setFormData} />
<AddressFields prefix="bride" formData={formData} setFormData={setFormData} />
<Documents prefix="bride" title="Bride Documents" formData={formData} setFormData={setFormData} />

        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <h3 style={title}>Marriage Details</h3>
<MarriageDetails prefix="marriage" formData={formData} setFormData={setFormData} />
<PriestDetails prefix="priest" formData={formData} setFormData={setFormData} />
<MarriageDocuments prefix="marriageDoc" formData={formData} setFormData={setFormData} />

        </>
      )}

      {/* WITNESS STEPS */}
      {step >= 4 && step <= 6 && (
        <>
          <h3 style={title}>Witness {step - 3}</h3>
<WitnessDetails
  prefix={`witness${step - 3}`}
  number={step - 3}
  formData={formData}
  setFormData={setFormData}
/>

<WitnessDocuments
  prefix={`witness${step - 3}`}
  number={step - 3}
  formData={formData}
  setFormData={setFormData}
/>

        </>
      )}

      {/* NAV BUTTONS */}
      <div style={{ marginTop: 30, display: "flex", gap: 10 }}>
        {step > 1 && (
          <button style={btn} onClick={prev}>
            Previous
          </button>
        )}

        {step < 6 ? (
          <button style={btnPrimary} onClick={next}>
            Next
          </button>
        ) : (
          <button style={btnPrimary} onClick={submitApplication}>
            Submit Application
          </button>
        )}
      </div>
      {showSuccess && (
  <div style={popupOverlay}>
    <div style={popupCard}>
      <div style={{ fontSize: 40, color: "green" }}>✓</div>

      <h2 style={{ marginTop: 10 }}>
        Application Complete!
      </h2>

      <p>
        Your marriage registration application has been
        submitted successfully.
      </p>

      <p style={{ marginTop: 10 }}>
        <b>CPAN:</b> {cpan}
      </p>

      <button
        style={dashboardBtn}
        onClick={() => window.location.href = "/dashboard"}
      >
        Go to Dashboard
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default ApplyMarriageForm;



/* REUSABLE SECTIONS */

const NameFields = ({ prefix, formData, setFormData }: any) => (
  <>
    <div style={grid3}>
      <Field prefix={prefix} label="First Name *" formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label="Middle Name" formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label="Last Name *" formData={formData} setFormData={setFormData} />
    </div>

    <div style={grid3}>
      <Field prefix={prefix} label="First Name (Marathi)*" formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label="Middle Name (Marathi)" formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label="Last Name (Marathi)*" formData={formData} setFormData={setFormData} />
    </div>
  </>
);

const BasicDetails = ({ prefix, formData, setFormData }: any) => (

  <>
    <div style={grid2}>
      <Field prefix={prefix} label="Father's Name *" formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label="Date of Birth *" type="date" formData={formData} setFormData={setFormData} />
    </div>

    <div style={grid2}>
      <Field prefix={prefix} label="Age at Marriage *" formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label="Gender *" formData={formData} setFormData={setFormData} />
    </div>

    <div style={grid2}>
      <Field prefix={prefix} label="Occupation *" formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label="Religion *" formData={formData} setFormData={setFormData} />
    </div>

    <div style={grid2}>
      <Field prefix={prefix} label="PAN Number" formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label="Aadhaar Number *" formData={formData} setFormData={setFormData} />
    </div>
  </>
);

const AddressFields = ({ prefix, formData, setFormData }: any) => (

  <>
    <Field prefix={prefix} label="Complete Address in English *" textarea formData={formData} setFormData={setFormData} />
    <Field prefix={prefix} label="Complete Address in Marathi *" textarea formData={formData} setFormData={setFormData} />
  </>
);

const Documents = ({ prefix, title, formData, setFormData }: any) => (
  <>
    <h3 style={{ ...titleStyle, marginTop: 30 }}>{title}</h3>

    <div style={grid2}>
      <Field prefix={prefix} label="Photograph *" type="file" formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label="Aadhaar *" type="file" formData={formData} setFormData={setFormData} />
    </div>

    <div style={grid2}>
      <Field prefix={prefix} label="Age Proof Type *" formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label="Proof of Age *" type="file" formData={formData} setFormData={setFormData} />
    </div>

    <div style={grid2}>
      <Field prefix={prefix} label="Residence Proof Type *" formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label="Proof of Residence *" type="file" formData={formData} setFormData={setFormData} />
    </div>
  </>
);
const MarriageDetails = ({ prefix, formData, setFormData }: any) => (
  <>
    <h3 style={{ ...titleStyle, marginTop: 20 }}>
      Marriage Details
    </h3>

    <div style={grid2}>
      <Field prefix={prefix} label="Marriage Date *" type="date" formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label="Place of Marriage *" formData={formData} setFormData={setFormData} />
    </div>

    <div style={grid2}>
      <Field prefix={prefix} label="Marriage Type *" formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label="Ward/Zone *" formData={formData} setFormData={setFormData} />
    </div>
  </>
);

const PriestDetails = ({ prefix, formData, setFormData }: any) => (
  <>
    <h3 style={{ ...titleStyle, marginTop: 30 }}>
      Priest Details
    </h3>

    <div style={grid2}>
      <Field prefix={prefix} label="Priest / Registrar Name *" formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label="Priest Aadhaar Number *" formData={formData} setFormData={setFormData} />
    </div>

    <Field prefix={prefix} label="Priest Address *" textarea formData={formData} setFormData={setFormData} />
  </>
);

const MarriageDocuments = ({ prefix, formData, setFormData }: any) => (
  <>
    <h3 style={{ ...titleStyle, marginTop: 30 }}>
      Marriage Documents
    </h3>

    <div style={grid2}>
      <Field prefix={prefix} label="Wedding Card / Invitation *" type="file" formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label="Priest Signature / Certificate *" type="file" formData={formData} setFormData={setFormData} />
    </div>

    <div style={grid2}>
      <Field prefix={prefix} label="Marriage Affidavit *" type="file" formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label="Wedding Photo *" type="file" formData={formData} setFormData={setFormData} />
    </div>
  </>
);

const WitnessDetails = ({ prefix, number, formData, setFormData }: any) => (
  <>
    <h3 style={{ ...titleStyle, marginTop: 20 }}>
      Witness {number} Details
    </h3>

    <div style={grid2}>
      <Field prefix={prefix} label={`Witness ${number} Full Name *`} formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label={`Witness ${number} Mobile Number *`} formData={formData} setFormData={setFormData} />
    </div>

    <div style={grid2}>
      <Field prefix={prefix} label={`Witness ${number} Aadhaar Number *`} formData={formData} setFormData={setFormData} />
      <Field prefix={prefix} label="Relation to Bride/Groom *" formData={formData} setFormData={setFormData} />
    </div>

    <Field prefix={prefix} label="Complete Address *" textarea formData={formData} setFormData={setFormData} />
  </>
);

const WitnessDocuments = ({ prefix, number, formData, setFormData }: any) => (
  <>
    <h3 style={{ ...titleStyle, marginTop: 30 }}>
      Witness {number} Documents
    </h3>

    <div style={grid2}>
      <Field
        key={`${prefix}_idtype`}
        prefix={prefix}
        label="ID Proof Type *"
        formData={formData}
        setFormData={setFormData}
      />

      <Field
        key={`${prefix}_idproof`}
        prefix={prefix}
        label="ID Proof *"
        type="file"
        formData={formData}
        setFormData={setFormData}
      />
    </div>

    <div style={grid2}>
      <Field
        key={`${prefix}_photo`}
        prefix={prefix}
        label={`Witness ${number} Photo *`}
        type="file"
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  </>
);



/* FIELD COMPONENT */
const Field = ({ label, type, textarea, prefix, formData, setFormData }: any) => {
  const key = `${prefix}_${label}`;

const handleChange = (e: any) => {
  let val;

  if (type === "file") {
    const file = e.target.files?.[0];

    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (file.size > maxSize) {
        alert("File must be less than 2 MB");
        e.target.value = ""; // reset input
        return;
      }
    }

    val = file || null;
  } else {
    val = e.target.value;

    if (label.includes("Aadhaar")) {
      val = val.replace(/\D/g, "");
      if (val.length > 12) val = val.slice(0, 12);
    }
  }

  setFormData((prev: any) => ({
    ...prev,
    [key]: val,
  }));
};



  return (
    <div style={{ marginBottom: 15 }}>
      <label style={labelStyle}>{label}</label>

      {textarea ? (
        <textarea
          style={textareaStyle}
          value={formData[key] || ""}
          onChange={handleChange}
        />
      ) :

type === "file" ? (
  <div>
    <input
      type="file"
      onChange={handleChange}
      style={{ display: "none" }}
      id={key}
    />

    <label
      htmlFor={key}
      style={{
        ...input,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <span>
        {formData[key]?.name || "Choose File"}
      </span>

      <span style={{ color: "#666" }}>
        Browse
      </span>
    </label>
  </div>
) :


      type === "date" ? (
        <input
          type="date"
          style={{ ...input, background: "#f5f6f8", color: "black" }}
          value={formData[key] || ""}
          onChange={handleChange}
        />
      ) :

      label.includes("Age at Marriage") ? (
        <input
          type="number"
          min="0"
          style={input}
          value={formData[key] || ""}
          onChange={handleChange}
        />
      ) :

      label.includes("Gender") ? (
        <select
          style={input}
          value={formData[key] || ""}
          onChange={handleChange}
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>
      ) :

      label.includes("Marriage Type") ? (
        <select
          style={input}
          value={formData[key] || ""}
          onChange={handleChange}
        >
          <option value="">Select Marriage Type</option>
          <option>Hindu Marriage</option>
          <option>Court Marriage</option>
          <option>Muslim Marriage</option>
          <option>Christian Marriage</option>
          <option>Special Marriage Act</option>
        </select>
      ) :

      label.includes("Ward/Zone") ? (
        <select
          style={input}
          value={formData[key] || ""}
          onChange={handleChange}
        >
          <option value="">Select Ward/Zone</option>
          <option>Ward 1</option>
          <option>Ward 2</option>
          <option>Ward 3</option>
          <option>Ward 4</option>
        </select>
      ) :

      label.includes("ID Proof Type") ? (
        <select
          style={input}
          value={formData[key] || ""}
          onChange={handleChange}
        >
          <option>Select ID Proof</option>
          <option>Aadhaar Card</option>
          <option>Voter ID</option>
          <option>Passport</option>
          <option>Driving License</option>
          <option>PAN Card</option>
        </select>
      ) :

      label.includes("Religion") ? (
        <input
          type="text"
          style={input}
          value={formData[key] || ""}
          onChange={handleChange}
        />
      ) :

      (
        <input
          type={type || "text"}
          style={input}
          value={formData[key] || ""}
          onChange={handleChange}
        />
      )}
    </div>
  );
};




/* STYLES */

const navStyle: React.CSSProperties = {
  display: "flex",
  gap: 20,
  borderBottom: "2px solid #ddd",
  marginBottom: 20,
};

const navItem: React.CSSProperties = {
  padding: "10px 15px",
  fontWeight: 600,
};

const btn: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 6,
  border: "1px solid #ccc",
  cursor: "pointer",
};

const btnPrimary: React.CSSProperties = {
  ...btn,
  background: "#3b6edc",
  color: "white",
  border: "none",
};

const title: React.CSSProperties = {
  color: "#3b6edc",
  marginBottom: 15,
};

const titleStyle: React.CSSProperties = {
  color: "#3b6edc",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 5,
  fontWeight: 600,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
  background: "#f5f6f8",
  color: "black",
};

const textareaStyle: React.CSSProperties = {
  ...input,
  height: 70,
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 15,
};

const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 15,
};

const popupOverlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999
};

const popupCard: React.CSSProperties = {
  background: "#fff",
  padding: 30,
  borderRadius: 12,
  textAlign: "center",
  width: 380,
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
};

const dashboardBtn: React.CSSProperties = {
  marginTop: 20,
  padding: "10px 20px",
  borderRadius: 6,
  border: "none",
  background: "#28a745",
  color: "white",
  cursor: "pointer",
  fontWeight: 600
};
