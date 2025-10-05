// socket.js
import { Server } from "socket.io";

const userSocketMap = {};
let io; // 👈 make io accessible globally within this module

// Get socket ID of a user by userId
export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

// Get the initialized io instance (to use in controllers)
export const getIO = () => io;

// Setup Socket.IO on the provided HTTP server
export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // 🔁 update for production if needed
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap[userId] = socket.id;
      console.log(`✅ User connected: userId = ${userId}, socketId = ${socket.id}`);
    }

    // Send the updated list of online users to everyone
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      if (userId) {
        console.log(`❌ User disconnected: userId = ${userId}, socketId = ${socket.id}`);
        delete userSocketMap[userId];
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};
