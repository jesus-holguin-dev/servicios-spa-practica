
import { Router } from "express";
import { solicitarTransaccion } from "../controllers/pagos.controller.js";
const router = Router();
router.post("/pagos/solicitar-transaccion", solicitarTransaccion);
export default router;
