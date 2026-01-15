const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authrouter = require("./routes/authrouter.js");
const connectDB = require("./config/db.js");
const cors = require("cors");


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authrouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log("server running on port",PORT);
})