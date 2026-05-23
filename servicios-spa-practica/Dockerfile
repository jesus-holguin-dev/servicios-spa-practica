FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias (solo prod)
RUN npm ci --omit=dev

# Copiar el resto del código
COPY . .

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Exponer el puerto interno
EXPOSE 3000

# Comando de inicio
CMD ["node", "src/server.js"]
