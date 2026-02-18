import React, { useState } from "react";

const ApplyMarriageStep1: React.FC = () => {
  const [form, setForm] = useState<any>({});

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ background: "white", padding: 25, borderRadius: 12 }}>
      
      {/* STEP TITLE */}
      <h2 style={{ marginBottom: 20 }}>Marriage Certificate Application</h2>

      {/* ---------- GROOM DETAILS ---------- */}
      <h3 style={sectionTitle}>Groom Details</h3>

      <div style={grid3}>
        <input name="firstName" placeholder="First Name *" style={input}/>
        <input name="middleName" placeholder="Middle Name" style={input}/>
        <input name="lastName" placeholder="Last Name *" style={input}/>
      </div>

      <div style={grid3}>
        <input name="firstMarathi" placeholder="First Name (Marathi)*" style={input}/>
        <input name="middleMarathi" placeholder="Middle Name (Marathi)" style={input}/>
        <input name="lastMarathi" placeholder="Last Name (Marathi)*" style={input}/>
      </div>

      <div style={grid2}>
        <input name="fatherName" placeholder="Father's Name *" style={input}/>
        <input type="date" name="dob" style={input}/>
      </div>

      <div style={grid2}>
        <input name="age" placeholder="Age at Marriage *" style={input}/>
        <select name="gender" style={input}>
          <option>Gender *</option>
          <option>Male</option>
          <option>Female</option>
        </select>
      </div>

      <div style={grid2}>
        <input name="occupation" placeholder="Occupation *" style={input}/>
        <select name="religion" style={input}>
          <option>Religion *</option>
          <option>Hindu</option>
          <option>Muslim</option>
          <option>Christian</option>
          <option>Sikh</option>
        </select>
      </div>

      <div style={grid2}>
        <input name="pan" placeholder="PAN Number" style={input}/>
        <input name="aadhaar" placeholder="Aadhaar Number *" style={input}/>
      </div>

      <textarea
        name="addressEnglish"
        placeholder="Complete Address in English *"
        style={textarea}
      />

      <textarea
        name="addressMarathi"
        placeholder="Complete Address in Marathi *"
        style={textarea}
      />

      {/* ---------- GROOM DOCUMENTS ---------- */}
      <h3 style={{ ...sectionTitle, marginTop: 30 }}>
        Groom Documents
      </h3>

      <div style={grid2}>
        <input type="file" style={input}/>
        <input type="file" style={input}/>
      </div>

      <div style={grid2}>
        <select style={input}>
          <option>Age Proof Type *</option>
          <option>School Leaving Certificate</option>
          <option>Birth Certificate</option>
          <option>Passport</option>
        </select>

        <input type="file" style={input}/>
      </div>

      <div style={grid2}>
        <select style={input}>
          <option>Residence Proof Type *</option>
          <option>Voter ID</option>
          <option>Electric Bill</option>
          <option>Ration Card</option>
        </select>

        <input type="file" style={input}/>
      </div>

    </div>
  );
};

export default ApplyMarriageStep1;


/* ---------- STYLES ---------- */

const input: React.CSSProperties = {
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
  background: "#f5f6f8",
  width: "100%",
};

const textarea: React.CSSProperties = {
  ...input,
  height: 70,
  marginTop: 15,
};

const grid2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 15,
  marginBottom: 15,
};

const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: 15,
  marginBottom: 15,
};

const sectionTitle: React.CSSProperties = {
  marginBottom: 10,
  color: "#3b6edc",
};
