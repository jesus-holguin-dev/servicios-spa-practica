import express from "express";
import { registrarCitaWeb } from "../controllers/citasWeb.controller.js";

const router = express.Router();

router.post("/web", registrarCitaWeb);

export default router;