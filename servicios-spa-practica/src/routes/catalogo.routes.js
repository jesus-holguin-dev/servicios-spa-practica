
import { Router } from "express";
import { obtenerCatalogo } from "../controllers/catalogo.controller.js";
const router = Router();
router.get("/catalogo", obtenerCatalogo);
export default router;
