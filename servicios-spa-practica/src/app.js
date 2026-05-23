// src/app.js
import express from "express"; 
import catalogoRoutes from "./routes/catalogo.routes.js"; 
import disponibilidadRoutes from "./routes/disponibilidad.routes.js"; 
import ventasMallRoutes from "./routes/ventasMall.routes.js"; 
import pagosRoutes from "./routes/pagos.routes.js"; 
import categoriasRoutes from "./routes/categorias.routes.js";
import citasWebRoutes from "./routes/citasWeb.routes.js";  

import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express(); 
app.use(express.json()); 

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://spa-servicios.rtakabinetsolutions.com",
      "http://api-servicios-spa.rtakabinetsolutions.com"
    ],
    methods: "GET,POST,PUT,DELETE",
    credentials: true
  })
);

app.use("/api", catalogoRoutes); 
app.use("/api", disponibilidadRoutes); 
app.use("/api", ventasMallRoutes); 
app.use("/api", pagosRoutes); 
app.use("/api", categoriasRoutes);
app.use("/api", citasWebRoutes);   

export default app;
