// src/app.js
import express from "express";
import cors from "cors";

// Import semua routes
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes utama
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

// Root test endpoint (optional)
app.get("/", (req, res) => {
  res.json({ message: "API Gateway is running successfully 🚀" });
});

//404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
