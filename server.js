const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authrouter = require("./routes/authrouter.js");
const connectDB = require("./config/db.js");
const http = require("http"); // Needed for socket.io
const { Server } = require("socket.io");
const cors = require("cors");


dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // wrap express server

app.use(cors());
app.use(express.json());

const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/upload", uploadRoutes);
// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // your frontend URL
    methods: ["GET", "POST"],
  },
});

// Handle connection
io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  // Listen for custom events
  socket.on("send_notification", (data) => {
    console.log("Notification data:", data);

    // Emit event to all clients
    io.emit("receive_notification", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
  });
});

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);

// Normal Express routes here
app.get("/", (req, res) => res.send("Server is running"));
app.use("/api/auth", authrouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log("server running on port",PORT);
})