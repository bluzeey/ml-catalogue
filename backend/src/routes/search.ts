import express from "express";
import { searchCsvController } from "../controllers/searchCsvController";

const router = express.Router();

// Endpoint for search queries
router.get("/", (req, res) => {
  searchCsvController(req, res);
});

export default router;
