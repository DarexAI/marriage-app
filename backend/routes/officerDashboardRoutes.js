const express = require("express");
const router = express.Router();

const Application = require("../models/Application");
console.log("✅ OfficerDashboardRoutes Loaded");

const upload = require("../config/multer");
const PDFDocument = require("pdfkit");
const bcrypt = require("bcryptjs");
const Registration = require("../models/Registration");
const Officer = require("../models/Officer");
const PhysicalVerification = require("../models/PhysicalVerification");
const axios = require("axios");
const path = require("path");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const Certificate = require("../models/Certificate");
// GET ALL APPLICATIONS
router.get("/applications", async (req, res) => {
const apps = await Application.find()
  .populate("appointmentSlot") // ⭐ THIS IS KEY
  .sort({ createdAt: -1 });

res.json(apps);

});

// UPDATE STATUS
router.put("/applications/:id", async (req, res) => {
  await Application.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status }
  );

  res.json({ success: true });
});
router.put("/schedule/:id", async (req, res) => {
  try {
    await Application.findByIdAndUpdate(
      req.params.id,
      { appointmentDate: req.body.appointmentDate }
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

router.put("/update-application/:id", upload.any(), async (req, res) => {
  try {
    // GET EXISTING APPLICATION
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false });
    }

    // PARSE FORM DATA
    let formData = {};
    if (req.body.data) {
      formData = JSON.parse(req.body.data);
    }

    // START WITH EXISTING DOCUMENTS
    const documents = { ...application.documents };

    // REPLACE ONLY NEW UPLOADED FILES
    if (req.files) {
      req.files.forEach(file => {
        documents[file.fieldname] = file.path;
      });
    }

    // UPDATE APPLICATION
    application.formData = formData;
    application.documents = documents;

    await application.save();

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


router.get("/generate-certificate/:id", async (req, res) => {
  try {
    const verification = await PhysicalVerification.findOne({
  cpan: req.params.id
}).populate({
  path: "applicationId",
  model: "applications"
});

    if (!verification) {
      return res.status(404).json({ success: false });
    }

    const app = verification.applicationId;
    const form = app.formData || {};
    const docs = app.documents || {};

    /* ===== DATA MAPPING (CORRECT KEYS) ===== */
/* ===== DATA MAPPING (NEW KEYS) ===== */

const groomNameEnglish =
  `${form["groom_FirstName"] || ""} ${form["groom_LastName"] || ""}`;

const groomNameMarathi =
  `${form["groom_FirstName(Marathi)"] || ""} ${form["groom_LastName(Marathi)"] || ""}`;

const brideNameEnglish =
  `${form["bride_FirstName"] || ""} ${form["bride_LastName"] || ""}`;

const brideNameMarathi =
  `${form["bride_FirstName(Marathi)"] || ""} ${form["bride_LastName(Marathi)"] || ""}`;

const groomAddressEnglish =
  form["groom_CompleteAddressinEnglish"] || "N/A";

const groomAddressMarathi =
  form["groom_CompleteAddressinMarathi"] || "N/A";

const brideAddressEnglish =
  form["bride_CompleteAddressinEnglish"] || "N/A";

const brideAddressMarathi =
  form["bride_CompleteAddressinMarathi"] || "N/A";

const marriageDate =
  form["marriage_MarriageDate"] || "N/A";

const marriagePlace =
  form["marriage_PlaceofMarriage"] || "N/A";

const appDate = new Date(app.createdAt).toLocaleDateString();

const cpan = verification.cpan;
    /* ===== PDF SETUP ===== */

    const doc = new PDFDocument({ size: "A4", margin: 40 });
const buffers = [];
doc.on("data", buffers.push.bind(buffers));
const pageWidth = doc.page.width;
const contentWidth = pageWidth - 100; // safe margin width
    

    /* ===== LOAD MARATHI FONT ===== */
    doc.registerFont(
      "marathi",
      path.join(__dirname, "../fonts/NotoSansDevanagari-Regular.ttf")
    );

    /* ===== TIMESTAMP TOP ===== */
    const now = new Date().toLocaleString();
    doc.fontSize(8).text(now, { align: "right" });

    /* ===== BORDER ===== */
    doc.rect(20, 30, 555, 760).lineWidth(2).stroke();

    /* ===== LOGOS ===== */
    const logo = path.join(__dirname, "../assets/logo.png");

    try {
      doc.image(logo, 40, 60, { width: 50 });
      doc.image(logo, 500, 60, { width: 50 });
    } catch (e) {
      console.log("Logo missing");
    }

    /* ===== HEADER ===== */
const headerImage = path.join(
  __dirname,
  "../assets/header.png"
);

// Full width header
doc.image(headerImage, 40, 40, {
  width: doc.page.width - 80
});

// Move cursor below header
doc.moveDown(22);
/* ===== HUSBAND DETAILS ===== */
/* ===== CERTIFICATE BODY (MATCH OFFICIAL PDF STYLE) ===== */

doc.moveDown(2);

// CERTIFICATION LINE
doc.font("marathi").fontSize(12)
.text(
  "प्रमाणित करण्यात येते की / Certified that, Marriage between",
  { align: "center" }
);

doc.moveDown(1);

/* ===== HUSBAND DETAILS ===== */
doc.font("marathi").fontSize(12)
.text(
  `पतीचे नाव : ${groomNameMarathi}          आधार क्रमांक /Aadhar No.: ${
    form["groom_AadhaarNumber"] || "N/A"
  }`
);

doc.font("Helvetica")
.text(`Name of Husband : ${groomNameEnglish}`);

doc.font("marathi")
.text(`राहणार : ${groomAddressMarathi}`);

doc.font("Helvetica")
.text(`residing at : ${groomAddressEnglish}`);

/* ===== WIFE DETAILS ===== */
doc.moveDown(1);

doc.font("marathi")
.text(
  `पत्नीचे नाव : ${brideNameMarathi}          आधार क्रमांक /Aadhar No.: ${
    form["bride_AadhaarNumber"] || "N/A"
  }`
);

doc.font("Helvetica")
.text(`Wife's name : ${brideNameEnglish}`);

doc.font("marathi")
.text(`राहणार : ${brideAddressMarathi}`);

doc.font("Helvetica")
.text(`residing at : ${brideAddressEnglish}`);

/* ===== MARRIAGE PARAGRAPH ===== */
doc.moveDown(2);

doc.font("marathi").fontSize(12)
.text(
`यांचा विवाह दिनांक ${marriageDate} रोजी ${marriagePlace} येथे (ठिकाणी) विवाह विधी संपन्न झाला. त्याची महाराष्ट्र विवाह नोंदणी विधेयक १९९८ अन्वये CPAN ${cpan} वर दिनांक ${appDate} रोजी माझ्याकडून नोंदणी करण्यात आली आहे.`,
{
  align: "justify",
  width: doc.page.width - 80
}
);

doc.moveDown();

doc.font("Helvetica").fontSize(11)
.text(
`Solemnized on Date : ${marriageDate} at ${marriagePlace} (Place) is registered by me on Date : ${appDate} at CPAN : ${cpan} of register of Marriages maintained under the Maharashtra Regulation of Marriage Bureaus and Registrationof Marriages Act 1998.`,
{
  align: "justify",
  width: doc.page.width - 80
}
);
    /* ===== PHOTOS FROM APPLICATION DOCUMENTS ===== */

doc.moveDown(1);
const imageY = doc.y + 5;
if (docs["groom_Photograph"]) {
  const g = await axios.get(docs["groom_Photograph"], {
    responseType: "arraybuffer"
  });

  doc.image(g.data, 100, imageY, {
    fit: [90, 110],
    align: "center"
  });
}

if (docs["bride_Photograph"]) {
  const b = await axios.get(docs["bride_Photograph"], {
    responseType: "arraybuffer"
  });

  doc.image(b.data, 420, imageY, {
    fit: [90, 110],
    align: "center"
  });
}
    /* ===== FOOTER ===== */
const footerY = 720;

// LEFT
doc.font("Helvetica-Bold")
  .text("Place : ULHASNAGAR", 50, footerY);

doc.text("Date : ", 50, footerY + 15, { continued: true });

doc.font("Helvetica-Bold")
  .text(new Date().toDateString());

// CENTER SEAL
doc.circle(300, footerY + 15, 28).stroke();
doc.fontSize(10).text("Seal", 285, footerY + 10);

// RIGHT SIGNATURE
doc.font("Helvetica-Bold")
  .text("Signature", 490, footerY);

doc.text("Registrar of Marriages", 440, footerY + 15);
doc.text("ULHASNAGAR-3", 460, footerY + 30);
/* Bottom Timestamp EXACT */
doc.on("end", async () => {
  try {
    const pdfBuffer = Buffer.concat(buffers);

    // ⭐ Prevent duplicate certificate generation
    const existing = await Certificate.findOne({ cpan: verification.cpan });
    if (existing) {
      return res.json({
        success: true,
        url: existing.certificateUrl
      });
    }

const uploadStream = cloudinary.uploader.upload_stream(
  {
    folder: "marriage_certificates",
    resource_type: "raw",       // REQUIRED for PDF
    format: "pdf",              // ensures correct file type
    public_id: `certificate-${verification.cpan}` // NO .pdf here
  },
  async (error, result) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ success: false });
    }

    await Certificate.create({
      applicationId: app._id,
      cpan: verification.cpan,
      certificateUrl: result.secure_url
    });

    res.json({
      success: true,
      url: result.secure_url
    });
  }
);

    streamifier.createReadStream(pdfBuffer).pipe(uploadStream);

  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ success: false });
  }
});
doc.end();   // ⭐ THIS LINE WAS MISSING

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


router.get("/generate-receipt/:id", async (req, res) => {
  try {
const verification = await PhysicalVerification.findOne({
  cpan: req.params.id
}).populate({
  path: "applicationId",
  model: "applications"
});

    if (!verification) {
      return res.status(404).json({ success: false });
    }

    const app = verification.applicationId;
    const form = app.formData || {};

   const groomName =
  `${form["groom_FirstName"] || ""} ${form["groom_LastName"] || ""}`;

const brideName =
  `${form["bride_FirstName"] || ""} ${form["bride_LastName"] || ""}`;

const marriageDate =
  form["marriage_MarriageDate"] || "N/A";

    const receiptDate = new Date().toLocaleDateString("en-IN");

    // ⭐ NEW FORMAT
    const receiptNo = `RC/${verification.cpan}`;
    const cpan = verification.cpan;

    const penalty = 200;
    const registrationFee = 50;
    const totalAmount = penalty + registrationFee;

    const doc = new PDFDocument({ size: "A4", margin: 30 });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    const logo = path.join(__dirname, "../assets/logo.png");

    doc.registerFont(
      "marathi",
      path.join(__dirname, "../fonts/NotoSansDevanagari-Regular.ttf")
    );

    /* ===== FUNCTION TO DRAW ONE RECEIPT COPY ===== */
const drawReceipt = (copyLabel) => {
  const startX = 40;
  let y = doc.y;

  const tableWidth = 520;
   const totalWidth = 520;
  const colWidth = totalWidth / 3;


  /* ===== HEADER ROW (LOGO + TITLE + COPY LABEL) ===== */
 /* ===== HEADER TABLE (UNEQUAL CELLS) ===== */

const logoCell = 80;      // small
const headingCell = 300;  // biggest center
const copyCell = 140;     // medium right

doc.rect(startX, y, logoCell, 60).stroke();
doc.rect(startX + logoCell, y, headingCell, 60).stroke();
doc.rect(startX + logoCell + headingCell, y, copyCell, 60).stroke();

/* LOGO */
try {
  doc.image(logo, startX + 15, y + 10, { width: 45 });
} catch {}

/* CENTER HEADING */
doc.font("marathi").fontSize(18)
  .text("पावती", startX + logoCell, y + 8, {
    width: headingCell,
    align: "center"
  });

doc.fontSize(10)
  .text(
    "( महाराष्ट्र विवाह मंडळाचे विनियमन विवाह नोंदणी अधिनियम १९९८ )",
    startX + logoCell,
    y + 30,
    {
      width: headingCell,
      align: "center"
    }
  );

/* COPY LABEL */
doc.font("Helvetica-Bold")
  .text(copyLabel,
    startX + logoCell + headingCell,
    y + 20,
    {
      width: copyCell,
      align: "center"
    }
  );

y += 60;

  /* ===== RECEIPT NO ROW ===== */

  const colW = tableWidth / 3;

  doc.rect(startX, y, colW, 25).stroke();
  doc.rect(startX + colW, y, colW, 25).stroke();
  doc.rect(startX + colW * 2, y, colW, 25).stroke();

  doc.text("Receipt.No.", startX + 8, y + 6);
  doc.text("Date Of Receipt", startX + colW + 8, y + 6);
  doc.text("Related To", startX + colW * 2 + 8, y + 6);

  y += 25;

  doc.rect(startX, y, colW, 25).stroke();
  doc.rect(startX + colW, y, colW, 25).stroke();
  doc.rect(startX + colW * 2, y, colW, 25).stroke();

  doc.text(receiptNo, startX + 8, y + 6);
  doc.text(receiptDate, startX + colW + 8, y + 6);

  doc.font("marathi")
    .text("विवाह नोंदणी विभाग", startX + colW * 2 + 8, y + 6);

  y += 35;

  /* ===== NAME TABLE ===== */

  const drawRow = (label, value) => {
    doc.rect(startX, y, 220, 25).stroke();
    doc.rect(startX + 220, y, 300, 25).stroke();

    doc.font("Helvetica")
      .text(label, startX + 8, y + 6);

    doc.text(value, startX + 230, y + 6);

    y += 25;
  };

  drawRow("Groom Name", groomName);
  drawRow("Bride Name", brideName);
  drawRow("CPAN", cpan);
  drawRow("Marriage Date", marriageDate);

  y += 10;

  /* ===== DETAILS HEADER ===== */

  doc.rect(startX, y, 400, 25).stroke();
  doc.rect(startX + 400, y, 120, 25).stroke();

  doc.text("Details", startX + 8, y + 6);
  doc.text("Amount", startX + 410, y + 6);

  y += 25;

  /* ===== DETAIL ROW 1 ===== */

  doc.rect(startX, y, 400, 45).stroke();
  doc.rect(startX + 400, y, 120, 45).stroke();

  doc.font("marathi").text(
    "विवाह शास्त्रोक्त पद्धतीने झाल्यानंतर १ वर्षाहून अधिक कालावधीने नोंदणी केल्यास दंड",
    startX + 8,
    y + 5,
    { width: 380 }
  );

  doc.font("Helvetica")
    .text("200/-", startX + 420, y + 12);

  y += 45;

  /* ===== DETAIL ROW 2 ===== */

  doc.rect(startX, y, 400, 25).stroke();
  doc.rect(startX + 400, y, 120, 25).stroke();

  doc.font("marathi")
    .text("विवाह नोंदणी शुल्क", startX + 8, y + 6);

  doc.font("Helvetica")
    .text("50/-", startX + 420, y + 6);

  y += 25;

  /* ===== AMOUNT WORDS MERGED CELL ===== */

  doc.rect(startX, y, tableWidth, 25).stroke();

  doc.font("Helvetica")
    .text(
      "Amt in words / Two Hundred Fifty Rupees Only",
      startX + 8,
      y + 6
    );

  y += 25;

  /* ===== TOTAL ROW ===== */

  doc.rect(startX, y, 400, 25).stroke();
  doc.rect(startX + 400, y, 120, 25).stroke();

  doc.text("Total Received Amt./", startX + 8, y + 6);
  doc.text("250", startX + 480, y + 6);

  y += 40;
 doc.moveDown(2);
doc.font("marathi")
  .text("विवाह निबंधक, ULHASNAGAR-3",
    startX,
    y,
    {
      width: 520,
      align: "right",
      lineBreak: false
    }
  );

  doc.moveDown(2);
};
    /* ===== OFFICE COPY ===== */
// small header line
const headerText =
  `${new Date().toLocaleString("en-IN")} Ulhasnagar Municipal Corporation | Payment Receipt`;

doc.font("Helvetica")
  .fontSize(8)
  .text(headerText, { align: "center" });

doc.moveDown();

// first copy
drawReceipt("Office Copy");

doc.addPage();

// header again for second copy
doc.font("Helvetica")
  .fontSize(8)
  .text(headerText, { align: "center" });

doc.moveDown();

// second copy
drawReceipt("Main Copy");
    /* ===== UPLOAD TO CLOUDINARY ===== */
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "marriage_receipts",
          resource_type: "raw",
          format: "pdf",
          public_id: `receipt-${verification.cpan}`
        },
        async (error, result) => {
          if (error)
            return res.status(500).json({ success: false });

          res.json({
            success: true,
            url: result.secure_url
          });
        }
      );

      streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

router.get("/generate-goshvara/:id", async (req, res) => {
  try {
const verification = await PhysicalVerification.findOne({
  cpan: req.params.id
}).populate({
  path: "applicationId",
  model: "applications"
});

    if (!verification) {
      return res.status(404).json({ success: false });
    }

    const app = verification.applicationId;
    const form = app.formData || {};
    const docs = app.documents || {};

    const doc = new PDFDocument({ size: "A4", margin: 25 });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    doc.registerFont(
      "marathi",
      path.join(__dirname, "../fonts/NotoSansDevanagari-Regular.ttf")
    );

   const groomName =
  `${form["groom_FirstName"] || ""} ${form["groom_LastName"] || ""}`;

const brideName =
  `${form["bride_FirstName"] || ""} ${form["bride_LastName"] || ""}`;

const groomAddress =
  form["groom_CompleteAddressinEnglish"] || "N/A";

const brideAddress =
  form["bride_CompleteAddressinEnglish"] || "N/A";

const marriageDate =
  form["marriage_MarriageDate"] || "N/A";

    const cpan = verification.cpan;

    /* ================= HEADER TABLE ================= */
const drawMainTable = async (doc, form, docs, verification, page = 1) => {

  const startX = 40;
  let y = doc.y;

  const col1 = 280;
  const col2 = 120;
  const col3 = 120;

  const drawHeaderRow = () => {
    doc.rect(startX, y, col1 + col2 + col3, 40).stroke();

    doc.font("marathi")
      .text("गोषवारा भाग १", startX + 150, y + 5);

    doc.text("विवाह निबंधक कार्यालय :", startX + 350, y + 5);
    doc.text("ULHASNAGAR-3", startX + 350, y + 20);

    y += 40;

    doc.rect(startX, y, col1 + col2 + col3, 25).stroke();

    doc.text(
      `विवाह नोंदणी क्र. ${verification.cpan}`,
      startX + 10,
      y + 5
    );

    doc.text(
      new Date().toLocaleDateString(),
      startX + 270,
      y + 5
    );

    doc.text(
      new Date().toLocaleTimeString(),
      startX + 390,
      y + 5
    );

    y += 25;
  };

  const drawPersonRow = async (title, name, address, photoUrl) => {

    // header labels row
    doc.rect(startX, y, col1, 25).stroke();
    doc.rect(startX + col1, y, col2, 25).stroke();
    doc.rect(startX + col1 + col2, y, col3, 25).stroke();

    doc.font("marathi").text(title, startX + 5, y + 5);
    doc.text("छायाचित्र", startX + col1 + 20, y + 5);
    doc.text("अंगठयाचा ठसा", startX + col1 + col2 + 5, y + 5);

    y += 25;

    // content row
    doc.rect(startX, y, col1, 120).stroke();
    doc.rect(startX + col1, y, col2, 120).stroke();
    doc.rect(startX + col1 + col2, y, col3, 120).stroke();

    doc.text(
      `नाव : ${name}\nपत्ता : ${address}\nसही :`,
      startX + 10,
      y + 10
    );

    // ⭐ FIXED PHOTO LOAD
    if (photoUrl) {
      try {
        const img = await axios.get(photoUrl, {
          responseType: "arraybuffer"
        });

        doc.image(img.data, startX + col1 + 10, y + 10, {
          fit: [100, 90]
        });
      } catch (err) {
        console.log("Image load error");
      }
    }

    y += 120;
  };

  const drawSealRow = () => {
    doc.rect(startX, y, col1 + col2 + col3, 180).stroke();

    doc.text("Seal", startX + 10, y + 150);
    doc.text("विवाह निबंधक सही", startX + 350, y + 150);
  };

  drawHeaderRow();

 if (page === 1) {
  await drawPersonRow(
    "वराची माहिती",
    `${form["groom_FirstName"] || ""} ${form["groom_LastName"] || ""}`,
    form["groom_CompleteAddressinEnglish"] || "N/A",
    docs["groom_Photograph"]
  );

  await drawPersonRow(
    "वधूची माहिती",
    `${form["bride_FirstName"] || ""} ${form["bride_LastName"] || ""}`,
    form["bride_CompleteAddressinEnglish"] || "N/A",
    docs["bride_Photograph"]
  );
} else {
  await drawPersonRow(
    "साक्षीदार १",
    form["witness1_Witness1FullName"] || "",
    form["witness1_CompleteAddress"] || "N/A",
    docs["witness1_Witness1Photo"]
  );

  await drawPersonRow(
    "साक्षीदार २",
    form["witness2_Witness2FullName"] || "",
    form["witness2_CompleteAddress"] || "N/A",
    docs["witness2_Witness2Photo"]
  );

  await drawPersonRow(
    "साक्षीदार ३",
    form["witness3_Witness3FullName"] || "",
    form["witness3_CompleteAddress"] || "N/A",
    docs["witness3_Witness3Photo"]
  );
}

  drawSealRow();
};

await drawMainTable(doc, form, docs, verification, 1);

doc.addPage();

await drawMainTable(doc, form, docs, verification, 2);

    /* ================= UPLOAD ================= */

    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "goshvara",
          resource_type: "raw",
          format: "pdf",
          public_id: `goshvara-${verification.cpan}`
        },
        async (err, result) => {
          if (err)
            return res.status(500).json({ success: false });

          res.json({
            success: true,
            url: result.secure_url
          });
        }
      );

      streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
    });

    doc.end();
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});


router.get("/test-route", (req, res) => {
  res.send("Officer route working");
});
module.exports = router;
