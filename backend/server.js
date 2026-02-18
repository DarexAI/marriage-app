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

const app = express();

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

app.get("/", (req, res) => {
  res.send("API Running Successfully");
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
