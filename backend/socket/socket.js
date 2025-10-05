

import { Server } from "socket.io";

const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            userSocketMap[userId] = socket.id;
            console.log(`user connected: userid = ${userId}, SocketId = ${socket.id}`);
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        socket.on("disconnect", () => {
            if (userId) {
                console.log(`user disconnected: userid = ${userId}, SocketId = ${socket.id}`);
                delete userSocketMap[userId];
            }
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    });
};
