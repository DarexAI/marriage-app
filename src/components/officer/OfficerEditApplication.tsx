import { useEffect, useState } from "react";

interface Props {
  application: any;
}

const OfficerEditApplication = ({ application }: Props) => {
  const [formData, setFormData] = useState<any>({});
  const [documents, setDocuments] = useState<any>({});
  const [newDocs, setNewDocs] = useState<any>({});

  useEffect(() => {
    if (application) {
      setFormData(application.formData || {});
      setDocuments(application.documents || {});
    }
  }, [application]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDocChange = (key: string, file: File) => {
    setNewDocs((prev: any) => ({
      ...prev,
      [key]: file,
    }));
  };

  const updateApplication = async () => {
    const form = new FormData();

    form.append("data", JSON.stringify(formData));

    Object.entries(newDocs).forEach(([key, file]: any) => {
      form.append(key, file);
    });

    await fetch(
      `http://localhost:5000/api/officer/update-application/${application._id}`,
      {
        method: "PUT",
        body: form,
      }
    );

    alert("Application Updated Successfully");
  };

  return (
    <div style={container}>
      <h2>Marriage Application Details</h2>

      {/* ========= TEXT DATA ========= */}
      <div style={grid}>
        {Object.entries(formData).map(([key, value]: any) => {
          const isLarge =
            key.toLowerCase().includes("address");

          return (
            <div
              key={key}
              style={{
                ...fieldBox,
                gridColumn: isLarge ? "1 / -1" : "auto",
              }}
            >
              <label style={label}>
                {key.replace(/_/g, " ")}
              </label>

              <input
                value={value || ""}
                onChange={(e) =>
                  handleChange(key, e.target.value)
                }
                style={input}
              />
            </div>
          );
        })}
      </div>

      {/* ========= DOCUMENTS ========= */}
      <h3 style={{ marginTop: 40 }}>
        Uploaded Documents
      </h3>

      <div style={docGrid}>
        {Object.entries(documents).map(
          ([key, url]: any) => (
            <div key={key} style={docCard}>
              <p style={{ fontWeight: 600 }}>
                {key.replace(/_/g, " ")}
              </p>

              <div style={{ display: "flex", gap: 10 }}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  style={viewBtn}
                >
                  View
                </a>

                <input
                  type="file"
                  onChange={(e: any) =>
                    handleDocChange(
                      key,
                      e.target.files[0]
                    )
                  }
                />
              </div>
            </div>
          )
        )}
      </div>

      <button style={saveBtn} onClick={updateApplication}>
        Update Application
      </button>
    </div>
  );
};

export default OfficerEditApplication;


/* ===== STYLES ===== */

const container = {
  padding: 25,
  maxHeight: "80vh",
  overflow: "auto",
  background: "white",
  borderRadius: 12,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
};

const fieldBox = {
  display: "flex",
  flexDirection: "column" as const,
};

const label = {
  fontWeight: 600,
  marginBottom: 5,
};

const input = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
};

const docGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
  marginTop: 20,
};

const docCard = {
  padding: 15,
  background: "#f5f6f8",
  borderRadius: 10,
};

const viewBtn = {
  background: "#1976d2",
  color: "white",
  padding: "6px 12px",
  borderRadius: 6,
  textDecoration: "none",
};

const saveBtn = {
  marginTop: 30,
  padding: "12px 24px",
  borderRadius: 10,
  background: "#4caf50",
  color: "white",
  border: "none",
  fontSize: 16,
};
