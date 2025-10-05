import { Server } from "socket.io";

const userSocketMap = {};
let io; // Will hold the Socket.IO server instance

// Returns socket ID for a given userId
export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

// Returns the initialized io instance (to use in other modules/controllers)
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized! Call setupSocket first.");
  }
  return io;
};

// Initialize Socket.IO on the HTTP server
export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Adjust this in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap[userId] = socket.id;
      console.log(`✅ User connected: userId = ${userId}, socketId = ${socket.id}`);
    }

    // Notify everyone about current online users
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
