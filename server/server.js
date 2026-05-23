import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, "..", "client", "dist");

app.use(express.static(clientDist));

// Fallback: serve index.html for any non-API GET request (avoids path-to-regexp wildcard parsing)
app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api") || req.path.startsWith("/r/")) return next();
    const indexPath = path.join(clientDist, "index.html");
    res.sendFile(indexPath, (err) => {
        if (err) return next(err);
    });
});

app.get("/", (req, res) => {
    res.send("QRVerse backend running. Use the frontend on the client dev server or build + serve the static site.");
});

const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;

mongoose.connect(mongoUri)
.then(()=>console.log("mongodb connected"))
.catch((err)=>console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});
