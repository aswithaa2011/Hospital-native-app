import Patient from "../model/Patient.js";

const patientPopulate = [
  { path: "assignedNurse", select: "username fullName role" },
  { path: "assignedDoctor", select: "username fullName role" },
];

export const admitPatient = async (req, res) => {
  try {
    const { name, age, contact, symptoms, nurseId } = req.body;

    if (!name || !age || !symptoms) {
      return res.status(400).json({ message: "Name, age, and symptoms are required" });
    }

    const patient = await Patient.create({
      name,
      age,
      contact,
      symptoms,
      assignedNurse: nurseId || null,
      status: nurseId ? "Nurse Assigned" : "Admitted",
    });

    const populated = await Patient.findById(patient._id).populate(patientPopulate);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPatients = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "nurse") {
      filter.$or = [{ assignedNurse: req.user._id }, { assignedNurse: null }];
    }

    const patients = await Patient.find(filter).populate(patientPopulate).sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignNurse = async (req, res) => {
  try {
    const { nurseId } = req.body;

    if (!nurseId) {
      return res.status(400).json({ message: "nurseId is required" });
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { assignedNurse: nurseId, status: "Nurse Assigned" },
      { new: true, runValidators: true }
    ).populate(patientPopulate);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignRoomDoctor = async (req, res) => {
  try {
    const { roomNumber, doctorId } = req.body;

    if (!roomNumber || !doctorId) {
      return res.status(400).json({ message: "Room number and doctor are required" });
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        roomNumber,
        assignedDoctor: doctorId,
        assignedNurse: req.user._id,
        status: "Room Assigned",
      },
      { new: true, runValidators: true }
    ).populate(patientPopulate);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const myPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ assignedDoctor: req.user._id })
      .populate(patientPopulate)
      .sort({ updatedAt: -1 });

    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const diagnosis = async (req, res) => {
  try {
    const { diagnosis: diagnosisText } = req.body;

    if (!diagnosisText) {
      return res.status(400).json({ message: "Diagnosis is required" });
    }

    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, assignedDoctor: req.user._id },
      {
        diagnosis: diagnosisText,
        status: "Reported To Chief",
        reviewed: false,
      },
      { new: true, runValidators: true }
    ).populate(patientPopulate);

    if (!patient) {
      return res.status(404).json({ message: "Assigned patient not found" });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reportedPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ status: "Reported To Chief" })
      .populate(patientPopulate)
      .sort({ updatedAt: -1 });

    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewPatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        reviewed: true,
        status: "Reviewed",
        chiefNotes: req.body.chiefNotes || "",
      },
      { new: true, runValidators: true }
    ).populate(patientPopulate);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
