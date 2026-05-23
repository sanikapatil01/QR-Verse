import express from "express";
import cors from "cors";

import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import { redirectDynamic } from "./controllers/qrController.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/contact", contactRoutes);
app.get("/r/:slug", redirectDynamic);




app.get("/", (req, res) => {
    res.send("QRVerse backend running. Use the frontend on the client dev server or build + serve the static site.");
});

const mongoUri = process.env.MONGO_URI || process.env.MONGO_URI;

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("mongodb connected"))
.catch((err)=>console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});
