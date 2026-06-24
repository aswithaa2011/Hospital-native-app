import express from "express";
import {
  admitPatient,
  assignNurse,
  assignRoomDoctor,
  diagnosis,
  getAllPatients,
  myPatients,
  reportedPatients,
  reviewPatient,
} from "../Controller/patientController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/admit", roleMiddleware("reception"), admitPatient);
router.get("/all", roleMiddleware("reception", "nurse", "chiefdoctor"), getAllPatients);
router.put("/assign-nurse/:id", roleMiddleware("reception"), assignNurse);
router.put("/assign-room/:id", roleMiddleware("nurse"), assignRoomDoctor);
router.get("/my-patients", roleMiddleware("doctor"), myPatients);
router.put("/diagnosis/:id", roleMiddleware("doctor"), diagnosis);
router.get("/reported", roleMiddleware("chiefdoctor"), reportedPatients);
router.put("/review/:id", roleMiddleware("chiefdoctor"), reviewPatient);

export default router;
