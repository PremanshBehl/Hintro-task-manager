import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.config.js";
import morgan from "morgan";

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);
app.use(cookieParser());
app.use(morgan("dev"));

// Socket.io
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinBoard", (boardId) => {
        socket.join(boardId);
        console.log(`User ${socket.id} joined board ${boardId}`);
    });

    socket.on("leaveBoard", (boardId) => {
        socket.leave(boardId);
        console.log(`User ${socket.id} left board ${boardId}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Make io accessible in routes
app.set("io", io);

// Routes
import authRoutes from "./routes/auth.routes.js";
import appRoutes from "./routes/app.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api", appRoutes);

// Basic route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
