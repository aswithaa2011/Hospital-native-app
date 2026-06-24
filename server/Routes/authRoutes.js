import express from "express";
import { getStaff, login, register } from "../Controller/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/staff", authMiddleware, roleMiddleware("reception", "nurse", "chiefdoctor"), getStaff);

export default router;
