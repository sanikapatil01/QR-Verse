import mongoose from "mongoose";

const scanEventSchema = new mongoose.Schema({
  qrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QrCode",
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  ip: String,
  userAgent: String,
  scannedAt: {
    type: Date,
    default: () => new Date(),
    index: true
  }
});

const ScanEvent = mongoose.model("ScanEvent", scanEventSchema);

export default ScanEvent;

