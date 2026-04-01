import { Router } from "express";
import { getMe } from "../controllers/auth.controller";

const router = Router();

router.get("/me", getMe);

export default router;
