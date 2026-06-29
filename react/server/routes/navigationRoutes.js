import express from "express";
import { getNavigations } from "../controllers/navigationController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(checkAuth);

router.get("/navigations", getNavigations);

export default router;