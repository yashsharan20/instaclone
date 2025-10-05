// index.js
import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import { setupSocket } from "./socket/socket.js"; // ✅ FIX: Import setupSocket only

dotenv.config();

const app = express();
const server = http.createServer(app);
setupSocket(server); // ✅ Initialize socket.io on server

// For __dirname compatibility in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: "http://localhost:5173", // 🔁 Change this for production
  credentials: true,
};
app.use(cors(corsOptions));

// API Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

// Serve frontend
app.use(express.static(path.join(__dirname, "frontend", "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  connectDB();
  console.log(`✅ Server listening on port ${PORT}`);
});
