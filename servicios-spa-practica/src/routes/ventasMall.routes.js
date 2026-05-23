
import { Router } from "express";
import { registrarVentaMall } from "../controllers/ventasMall.controller.js";
const router = Router();
router.post("/registrar-venta", registrarVentaMall);
export default router;
