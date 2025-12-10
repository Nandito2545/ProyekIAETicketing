// api-gatewey/src/server.js

import express from "express";
import cors from "cors";
import path from "path"; 
import { fileURLToPath } from "url"; 

import userRouter from "./routes/userRoutes.js"; 
import eventRouter from "./routes/eventRoutes.js";
import ticketRouter from "./routes/ticketRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import adminRouter from "./routes/adminRoutes.js"; // ✅ PERBAIKAN: Import rute admin

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Sajikan folder 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/users", userRouter);
app.use("/api/events", eventRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/admin", adminRouter); 

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));