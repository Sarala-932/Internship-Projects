import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/user.model.mjs";
import { config } from "../config/config.mjs";

let io;
const userSockets = new Map(); // Map<userId, Set<socketId>>

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      methods: ["GET", "POST", "PATCH"],
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    console.log(`User connected to socket: ${userId} (${socket.user.role})`);
    
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    socket.on("disconnect", () => {
      console.log(`User disconnected from socket: ${userId}`);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });
};

/**
 * Emit an event to a specific user
 * @param {string} userId - The recipient's user ID
 * @param {string} eventName - The socket event name
 * @param {object} payload - The data to send
 */
export const emitToUser = (userId, eventName, payload) => {
  if (!io) {
    console.warn("Socket.io is not initialized yet.");
    return;
  }
  const socketIds = userSockets.get(userId.toString());
  if (socketIds && socketIds.size > 0) {
    socketIds.forEach(socketId => {
      io.to(socketId).emit(eventName, payload);
    });
    return true; // Sent successfully
  }
  return false; // User is offline
};

/**
 * Emit an event to a group of users by role (e.g. all admins)
 */
export const emitToRole = async (hospitalId, role, eventName, payload) => {
  if (!io) return;
  const query = { role, isActive: true };
  if (hospitalId) query.hospitalId = hospitalId;
  const users = await User.find(query).select("_id");
  users.forEach((user) => {
    const socketIds = userSockets.get(user._id.toString());
    if (socketIds && socketIds.size > 0) {
      socketIds.forEach(socketId => {
        io.to(socketId).emit(eventName, payload);
      });
    }
  });
};

export const broadcastDataUpdate = async (hospitalId, resource) => {
  if (!io) return;
  const payload = { resource, timestamp: new Date() };
  
  const query = { isActive: true };
  if (hospitalId) query.hospitalId = hospitalId;
  
  const users = await User.find(query).select("_id");
  users.forEach((user) => {
    const socketIds = userSockets.get(user._id.toString());
    if (socketIds && socketIds.size > 0) {
      socketIds.forEach(socketId => {
        io.to(socketId).emit("data_updated", payload);
      });
    }
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

export const getConnectedSockets = () => {
  const result = {};
  userSockets.forEach((sockets, userId) => {
    result[userId] = Array.from(sockets);
  });
  return result;
};
