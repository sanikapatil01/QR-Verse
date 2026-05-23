import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  apiKey: {
    type: String,
    unique: true,
    index: true,
    default: () => crypto.randomBytes(24).toString("hex")
  }

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
