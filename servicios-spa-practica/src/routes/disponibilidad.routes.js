// src/routes/disponibilidad.routes.js
import { Router } from "express";
import {
  verificarDisponibilidad,
  obtenerHorariosDia,
} from "../controllers/disponibilidad.controller.js";

const router = Router();

// POST /api/disponibilidad  -> checar un solo horario (como ya lo tienes)
router.post("/disponibilidad", verificarDisponibilidad);

// POST /api/disponibilidad/horarios-dia  -> devolver TODAS las horas de un día
router.post("/disponibilidad/horarios-dia", obtenerHorariosDia);

export default router;

