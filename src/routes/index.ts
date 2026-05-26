import { Router } from "express";

import externalRoutes from "./external.routes";

const router = Router();

router.use("/price", externalRoutes);
// router.use("/updates", updatesRoutes);

export default router;
