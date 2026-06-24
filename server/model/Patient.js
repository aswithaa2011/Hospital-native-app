import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
    },
    contact: {
      type: String,
      trim: true,
      default: "",
    },
    symptoms: {
      type: String,
      required: true,
      trim: true,
    },
    assignedNurse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    roomNumber: {
      type: String,
      trim: true,
      default: "",
    },
    diagnosis: {
      type: String,
      trim: true,
      default: "",
    },
    chiefNotes: {
      type: String,
      trim: true,
      default: "",
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Admitted", "Nurse Assigned", "Room Assigned", "Reported To Chief", "Reviewed"],
      default: "Admitted",
    },
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
