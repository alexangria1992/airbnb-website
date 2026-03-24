require("dotenv").config();

const express = require("express");
const app = express();
const PORT = 3000;
const colors = require("colors");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const listingRoutes = require("./routes/listingRoutes");
const reservationRoutes = require("./routes/reservationRoutes");

const router = express.Router();

module.exports = router;
// Middleware to parse JSON (if needed for your API)
app.use(cors());

app.use(express.json());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/reservations", reservationRoutes);
// MongoDB connection
const DBConnection = process.env.MONGODB_URI;

mongoose
  .connect(DBConnection)
  .then(() => {
    console.log("MongoDB connected successfully!".brightGreen);
    // Start the server AFTER the database connection is established

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}/`.brightMagenta);
    });
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB".brightRed);
    console.log(err);
  });
