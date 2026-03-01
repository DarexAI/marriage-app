const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const registrationRoutes = require("./routes/registrationRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const officerAuthRoutes = require("./routes/officerAuthRoutes");
const officerDashboardRoutes = require("./routes/officerDashboardRoutes");
const slotRoutes = require("./routes/slotRoutes"); // 👈 ADD THIS
const citizenRoutes = require("./routes/citizenRoutes");
const authRoutes = require("./routes/auth");

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", registrationRoutes);
app.use("/api", applicationRoutes);
app.use("/api/officer-auth", officerAuthRoutes);
app.use("/api/officer", officerDashboardRoutes);
app.use("/api", slotRoutes);
app.use("/api", citizenRoutes);
app.use("/api", require("./routes/physicalVerification"));
app.use("/api", require("./routes/upload"));
app.use("/api/super-admin", require("./routes/superAdminAuth"));
app.use("/api/admin", require("./routes/superAdmin"));
app.use("/api/auth", authRoutes);
app.use("/api/officer", require("./routes/dashboardStats"));
app.get("/", (req, res) => {
  res.send("API Running Successfully");
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
