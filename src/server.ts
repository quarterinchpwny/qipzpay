import express from "express";
import dotenv from "dotenv";

import apiRoutes from "./routes";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const app = express();

app.use(express.json());
app.use("/api", apiRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
