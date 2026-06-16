import express from "express";
import dotenv from "dotenv";

import apiRoutes from "./routes";
import dayjs from "dayjs";
import { NextFunction, Request, Response } from "express";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const app = express();

const requestTimeMiddleware = function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.requestTime = dayjs().valueOf();

  next();
};

app.use(express.json());
app.use(requestTimeMiddleware);
app.use("/api", apiRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
