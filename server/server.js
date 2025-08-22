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

// -------------------
// ✅ Proper CORS Setup
// -------------------
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000", // main frontend
  "http://localhost:3001", // extra dev port
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps / curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json()); // for parsing application/json

// -------------------
// Routes
// -------------------
app.get("/", (req, res) => {
  res.send("Contractor RFID Backend is Running ✅");
});

const authRoutes = require("./Modules/User/routes");
const employeeRoutes = require("./Modules/Employee/routes");
const contractorRoutes = require("./Modules/Contractor/routes");
const sectionRoutes = require("./Modules/Section/Routes");
const attendanceRoutes = require("./Modules/Attendence/routes");
const rfidRoutes = require("./Modules/Rfid/routes");

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/contractors", contractorRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/rfid", rfidRoutes);
app.use("/api/employee", employeeRoutes);

// -------------------
// Global error handler
// -------------------
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({ message: err.message || "Something went wrong!" });
});

// -------------------
// Start server
// -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
