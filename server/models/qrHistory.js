import mongoose from "mongoose";

const qrHistorySchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  text: String,

  qrImage: String,

  qrType: String

}, { timestamps: true });

const QRHistory = mongoose.model("QRHistory", qrHistorySchema);

export default QRHistory;