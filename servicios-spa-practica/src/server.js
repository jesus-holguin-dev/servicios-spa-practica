// src/server.js
import app from "./app.js";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`SPA External APIs running on port ${port}`);
});
