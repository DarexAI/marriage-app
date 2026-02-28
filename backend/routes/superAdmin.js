const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const protect = require("../middleware/superAdminAuth");
const bcrypt = require("bcryptjs");
const Registration = require("../models/Registration");
const Officer = require("../models/Officer");
const Application = require("../models/Application");
const PhysicalVerification = require("../models/PhysicalVerification");
const axios = require("axios");
const path = require("path");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const Certificate = require("../models/Certificate");
const crypto = require("crypto");
const  PublicKey = require("@solana/web3.js");
const blockchainService = require("../services/blockchain");

// =====================================================
// OVERVIEW STATS
// =====================================================
router.get("/overview", protect, async (req, res) => {
  try {
    const totalUsers = await Registration.countDocuments();

    const pendingApps = await Application.countDocuments({
      status: { $ne: "physical_verification_completed" }
    });

    const activeOfficers = await Officer.countDocuments();

    res.json({
      success: true,
      totalUsers,
      pendingApps,
      activeOfficers
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});


// =====================================================
// GET ALL OFFICERS
// =====================================================
router.get("/officers", protect, async (req, res) => {
  try {
    const officers = await Officer.find().sort({ createdAt: -1 });
    res.json({ success: true, officers });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// =====================================================
// ADD OFFICER
// =====================================================
router.post("/officers", async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    let hashedPassword = "";

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const officer = new Officer({
      ...rest,
      password: hashedPassword
    });

    await officer.save();

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});


// =====================================================
// UPDATE OFFICER
// =====================================================
router.put("/officers/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await Officer.findByIdAndUpdate(req.params.id, updateData);

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

// =====================================================
// DELETE OFFICER
// =====================================================
router.delete("/officers/:id", protect, async (req, res) => {
  try {
    await Officer.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Officer deleted" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// =====================================================
// GET ALL CITIZENS
// =====================================================
router.get("/citizens", protect, async (req, res) => {
  try {
    const users = await Registration.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// =====================================================
// DELETE CITIZEN
// =====================================================
router.delete("/citizens/:id", protect, async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Citizen deleted" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});


router.get("/applications", protect, async (req, res) => {
  try {
    const apps = await PhysicalVerification.find()
      .populate({
        path: "applicationId",
        model: "applications"
      })
      .sort({ verifiedAt: -1 });

    // attach certificate info
    const appsWithCert = await Promise.all(
      apps.map(async (app) => {
        const cert = await Certificate.findOne({ cpan: app.cpan });

        return {
          ...app.toObject(),
          certificate: cert || null
        };
      })
    );

    res.json({
      success: true,
      apps: appsWithCert
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      apps: []
    });
  }
});

// =====================================================
// GET SINGLE APPLICATION FOR REVIEW
// =====================================================
router.get("/applications/:id", protect, async (req, res) => {
  try {
    const verification = await PhysicalVerification.findById(req.params.id)
      .populate({
        path: "applicationId",
        model: "applications"
      });

    if (!verification) {
      return res.json({ success: false });
    }

    // 🔥 Attach certificate
    const cert = await Certificate.findOne({ cpan: verification.cpan });

    res.json({
      success: true,
      app: {
        ...verification.toObject(),
        certificate: cert || null
      }
    });

  } catch (err) {
    console.error("SINGLE REVIEW ERROR:", err);
    res.status(500).json({ success: false });
  }
});


router.get("/generate-certificate/:id", protect, async (req, res) => {
  try {
    const verification = await PhysicalVerification.findById(req.params.id)
      .populate({
        path: "applicationId",
        model: "applications"
      });

    if (!verification) {
      return res.status(404).json({ success: false });
    }

    const app = verification.applicationId;
    const form = app.formData || {};
    const docs = app.documents || {};

  /* ===== DATA MAPPING (NEW CLEAN KEYS) ===== */

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
  message: "Certificate generated and stored"
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

router.get("/generate-receipt/:id", protect, async (req, res) => {
  try {
    const verification = await PhysicalVerification.findById(req.params.id)
        .populate({
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
     let certificate = await Certificate.findOne({ cpan: verification.cpan });

      if (certificate) {
        certificate.receiptUrl = result.secure_url;
        await certificate.save();
      } else {
        certificate = await Certificate.create({
          applicationId: app._id,
          cpan: verification.cpan,
          receiptUrl: result.secure_url
        });
      }

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

router.get("/generate-goshvara/:id", protect, async (req, res) => {
  try {
    const verification = await PhysicalVerification.findById(req.params.id)
      .populate({
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
      // 🔥 STORE OR UPDATE IN CERTIFICATE COLLECTION
      let certificate = await Certificate.findOne({ cpan: verification.cpan });

      if (certificate) {
        certificate.goshvaraUrl = result.secure_url;
        await certificate.save();
      } else {
        certificate = await Certificate.create({
          applicationId: app._id,
          cpan: verification.cpan,
          goshvaraUrl: result.secure_url
        });
      }
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


/**
 * POST /blockchain/register
 * Register a marriage certificate on Solana blockchain
 * @body {string} cpan - Certificate Public Announcement Number
 * @body {string} certificateUrl - URL of the generated certificate
 */
router.post("/blockchain/register", async (req, res) => {
  try {
    const { cpan, certificateUrl } = req.body;

    if (!cpan) {
      return res.status(400).json({
        success: false,
        message: "CPAN is required"
      });
    }

    if (!blockchainService.isReady()) {
      const initialized = await blockchainService.initialize();
      if (!initialized) {
        return res.status(503).json({
          success: false,
          message: "Blockchain service unavailable"
        });
      }
    }

    const certificate = await Certificate.findOne({ cpan });
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found for given CPAN"
      });
    }

    // check if already registered
    if (certificate.registeredOnChain) {
      return res.json({
        success: true,
        message: "Certificate already registered on blockchain",
        data: {
          certificateId: certificate.certificateId,
          txSignature: certificate.txSignature,
          certificateHash: certificate.certificateHash,
          blockchainStatus: certificate.blockchainStatus
        }
      });
    }

    // prepare certificate data for hashing
    const certData = JSON.stringify({
      cpan: cpan,
      certificateUrl: certificateUrl || certificate.certificateUrl,
      applicationId: certificate.applicationId,
      timestamp: new Date().toISOString()
    });

    const certId = `CERT-${cpan}`;
    const hash = blockchainService.hashCertificate(certData);

    console.log(`Registering certificate ${certId} on blockchain...`);

    const result = await blockchainService.registerCertificate(certId, hash);

    if (!result.success) {
      // update certificate with error
      certificate.blockchainStatus = "failed";
      certificate.blockchainError = result.error;
      certificate.certificateId = certId;
      certificate.certificateHash = result.certificateHash;
      await certificate.save();

      return res.status(500).json({
        success: false,
        message: "Blockchain registration failed",
        error: result.error
      });
    }

    // update certificate with blockchain data
   // ============================
// Update Mongo First
// ============================

certificate.certificateId = certId;
certificate.txSignature = result.txSignature;
certificate.certificateHash = result.certificateHash;
certificate.blockchainStatus = "confirmed";
certificate.registeredOnChain = true;
await certificate.save();

console.log(`Certificate ${certId} registered successfully`);

// ============================
// REGENERATE CERTIFICATE WITH GREEN BLOCK
// ============================

const verification = await PhysicalVerification.findOne({ cpan })
.populate({
  path: "applicationId",
  model: "applications"
});
if (!verification) {
  return res.status(404).json({ success: false });
}

const app = verification.applicationId;
const form = app.formData || {};
const docs = app.documents || {};


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

const doc = new PDFDocument({ size: "A4", margin: 40 });
const buffers = [];
doc.on("data", buffers.push.bind(buffers));


/* =============================
   COPY YOUR ORIGINAL CERTIFICATE BODY HERE
   (everything same as generate-certificate)
   until the SEAL section
============================= */

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
doc.moveDown(1);

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

// --- AFTER SEAL ---
// ============================
// PAGE 2 – 3 LINE VERIFICATION BOX
// ============================

doc.addPage();

// Border for page 2
doc.rect(20, 30, 555, 760).lineWidth(2).stroke();

const boxWidth = 520;
const boxHeight = 65;   // slightly taller for 3 lines
const boxX = 40;
const boxY = 60;

// Background
doc.rect(boxX, boxY, boxWidth, boxHeight)
   .fillColor("#e6f4ea")
   .fill();

// Border
doc.rect(boxX, boxY, boxWidth, boxHeight)
   .lineWidth(1)
   .strokeColor("#28a745")
   .stroke();

doc.fillColor("#155724");

// 🔹 Line 1 — Verification Title
doc.font("Helvetica-Bold")
   .fontSize(11)
   .text("Verified on Blockchain", boxX + 12, boxY + 8);

// 🔹 Line 2 — CPAN + Certificate ID
doc.font("Helvetica")
   .fontSize(9)
   .text(
     `CPAN: ${cpan}    |    Certificate ID: ${certId}`,
     boxX + 12,
     boxY + 25
   );

// Shorten long values for clean formatting
const shortHash = result.certificateHash.slice(0, 22) + "...";
const shortTx = result.txSignature.slice(0, 22) + "...";

// 🔹 Line 3 — Hash + TX
doc.fontSize(8)
   .text(
     `Hash: ${shortHash}    |    TX: ${shortTx}`,
     boxX + 12,
     boxY + 42,
     { width: boxWidth - 24 }
   );

doc.on("end", async () => {
  try {
    const pdfBuffer = Buffer.concat(buffers);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "marriage_certificates",
        resource_type: "raw",
        format: "pdf",
        public_id: `certificate-blockchain-${cpan}`
      },
      async (error, uploadResult) => {
        if (error) {
          return res.status(500).json({ success: false });
        }

        certificate.certificateUrl = uploadResult.secure_url;
        await certificate.save();

        return res.json({
          success: true,
          message: "Certificate registered and blockchain-stamped successfully",
          data: {
            certificateId: certId,
            txSignature: result.txSignature,
            certificateHash: result.certificateHash,
            blockchainStatus: "confirmed"
          }
        });
      }
    );

    streamifier.createReadStream(pdfBuffer).pipe(uploadStream);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
});

// MUST be after doc.on
doc.end();

} catch (error) {
  console.error("Blockchain route error:", error);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    error: error.message
  });
}
});

/**
 * GET /blockchain/verify/:cpan
 * Verify a certificate on blockchain
 */
router.get("/blockchain/verify/:cpan", async (req, res) => {
  try {
    const { cpan } = req.params;

    const certificate = await Certificate.findOne({ cpan });
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found"
      });
    }

    if (!certificate.registeredOnChain) {
      return res.json({
        success: false,
        verified: false,
        message: "Certificate not registered on blockchain"
      });
    }

    if (blockchainService.isReady()) {
      const certId = `CERT-${cpan}`;
      const verificationResult = await blockchainService.verifyCertificate(certId);

      return res.json({
        success: true,
        verified: verificationResult.verified,
        data: {
          certificateId: certificate.certificateId,
          txSignature: certificate.txSignature,
          certificateHash: certificate.certificateHash,
          blockchainStatus: certificate.blockchainStatus,
          ...verificationResult
        }
      });
    }

    res.json({
      success: true,
      verified: certificate.registeredOnChain,
      data: {
        certificateId: certificate.certificateId,
        txSignature: certificate.txSignature,
        certificateHash: certificate.certificateHash,
        blockchainStatus: certificate.blockchainStatus,
        note: "Blockchain verification unavailable, showing database status"
      }
    });

  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.message
    });
  }
});

/**
 * GET /blockchain/status
 * Get blockchain service status
 */
router.get("/blockchain/status", async (req, res) => {
  try {
    const isReady = blockchainService.isReady();
    
    if (!isReady) {
      await blockchainService.initialize();
    }

    const balance = blockchainService.isReady() ? await blockchainService.getBalance() : 0;

    res.json({
      success: true,
      status: {
        initialized: blockchainService.isReady(),
        walletBalance: balance,
        network: process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com"
      }
    });
  } catch (error) {
    res.json({
      success: false,
      status: {
        initialized: false,
        error: error.message
      }
    });
  }
});


// ============================================
// TEST BLOCKCHAIN PDF (NO DB, NO BLOCKCHAIN)
// ============================================

router.get("/test-blockchain-pdf", async (req, res) => {
  try {
    const PDFDocument = require("pdfkit");
    const path = require("path");
const cpan = "CPAN-TEST-123456";
const certId = "CERT-2025-28963133";
const result = {
  txSignature: "0x75301ba52f8e2c75e8..."
};
    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=test.pdf");

    doc.pipe(res);

    // Border
    doc.rect(20, 30, 555, 760).lineWidth(2).stroke();

    // Header
    doc.fontSize(18).text("Marriage Certificate (TEST MODE)", {
      align: "center"
    });

    doc.moveDown(2);

    doc.fontSize(12).text("This is a UI test certificate only.");
    doc.moveDown(1);

    doc.text("You can modify layout safely here.");
    doc.moveDown(5);

    // Fake footer
    const footerY = 720;

    doc.font("Helvetica-Bold")
      .text("Place : ULHASNAGAR", 50, footerY);

    doc.text("Date : ", 50, footerY + 15, { continued: true });
    doc.font("Helvetica-Bold")
      .text(new Date().toDateString());

    doc.circle(300, footerY + 15, 28).stroke();
    doc.text("Seal", 285, footerY + 10);

    doc.font("Helvetica-Bold")
      .text("Signature", 490, footerY);

    doc.text("Registrar of Marriages", 440, footerY + 15);
    doc.text("ULHASNAGAR-3", 460, footerY + 30);

    // -------- GREEN BLOCK (TEST ONLY) --------
// ============================
// BLOCKCHAIN PAGE (PAGE 2)
// ============================
doc.addPage();

// Optional border (keep if you want)
doc.rect(20, 30, 555, 760).lineWidth(2).stroke();

// SMALL COMPACT GREEN VERIFICATION BOX

const boxWidth = 520;
const boxHeight = 40;   // very small
const boxX = 40;
const boxY = 60;        // top of page

doc
  .rect(boxX, boxY, boxWidth, boxHeight)
  .fillColor("#e6f4ea")
  .fill();

doc
  .rect(boxX, boxY, boxWidth, boxHeight)
  .lineWidth(1)
  .strokeColor("#28a745")
  .stroke();

doc.fillColor("#155724");

// First line (bold style)
doc.font("Helvetica-Bold").fontSize(10)
  .text("Verified on BSC Blockchain", boxX + 10, boxY + 8);

// Second compact line
doc.font("Helvetica").fontSize(8)
  .text(
    `Cert No: ${certId}  |  CPAN: ${cpan}  |  TX: ${result.txSignature}`,
    boxX + 10,
    boxY + 22,
    { width: boxWidth - 20 }
  );
    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;