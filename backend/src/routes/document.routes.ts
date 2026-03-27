import { Router } from "express";
import {
  createDocument,
  deleteDocument,
  addCollaborator,
  getDocument,
  getDocuments,
  updateDocument,
} from "../controllers/document.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getDocuments);
router.post("/", createDocument);
router.get("/:id", getDocument);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);
router.post("/:id/collaborators", addCollaborator);

export default router;
