import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../../scripts/swagger-output.json";
import externalRoutes from "./external.routes";

const router = Router();

router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
router.use("/external", externalRoutes);

export default router;
