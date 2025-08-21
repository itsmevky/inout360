const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./Config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize app
const app = express();

// Middlewares
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json()); // for parsing application/json

// Health check route
app.get("/", (req, res) => {
  res.send("Contractor RFID Backend is Running ✅");
});

// Import routes
const authRoutes = require("./Modules/User/routes");
const employeeRoutes = require("./Modules/Employee/routes");
const contractorRoutes = require("./Modules/Contractor/routes");
const sectionRoutes = require("./Modules/Section/Routes");
const attendanceRoutes = require("./Modules/Attendence/routes");
const rfidRoutes = require("./Modules/Rfid/routes");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/contractors", contractorRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/rfid", rfidRoutes);

// Future routes (uncomment when ready)

// const attendanceRoutes = require("./routes/attendanceRoutes");

// app.use("/api/attendance", attendanceRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
