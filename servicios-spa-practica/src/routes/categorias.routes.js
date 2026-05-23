// src/routes/categorias.routes.js
import { Router } from "express";
import {
  obtenerCategorias,
  obtenerServiciosDeCategoria
} from "../controllers/categorias.controller.js";

const router = Router();

// Lista de categorías
router.get("/categorias", obtenerCategorias);

// Servicios de una categoría
router.get("/categorias/:idCategoria/servicios", obtenerServiciosDeCategoria);

export default router;
