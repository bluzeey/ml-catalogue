import express from "express";
import cors from "cors";
import searchRoute from "./routes/search";

const app = express();

// Enable CORS for the frontend origin
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

// Attach routes
app.use("/api/search", searchRoute);

export default app;
