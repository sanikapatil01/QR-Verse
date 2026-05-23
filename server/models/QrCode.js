import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  type: {
    type: String,
    required: true,
    index: true
  },

  payload: {
    type: Object,
    default: {}
  },

  content: {
    type: String,
    required: true
  },

  isDynamic: {
    type: Boolean,
    default: false,
    index: true
  },

  slug: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },

  destinationUrl: {
    type: String
  },

  style: {
    type: Object,
    default: {}
  },

  previewDataUrl: {
    type: String
  },

  scansCount: {
    type: Number,
    default: 0
  },

  lastScannedAt: {
    type: Date
  }
}, { timestamps: true });

const QrCode = mongoose.model("QrCode", qrCodeSchema);

export default QrCode;

