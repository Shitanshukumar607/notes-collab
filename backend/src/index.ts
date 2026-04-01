import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth } from "./lib/auth";
import documentRoutes from "./routes/document.routes";
import authRoutes from "./routes/auth.routes";
import { handleSocketConnection } from "./controllers/socket.controller";

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api/documents", documentRoutes);
app.use("/api", authRoutes);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Server is running");
});

io.on("connection", handleSocketConnection);

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
