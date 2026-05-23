import QRCode from "qrcode";
import crypto from "crypto";
import mongoose from "mongoose";
import QrCode from "../models/QrCode.js";
import ScanEvent from "../models/ScanEvent.js";
import { buildQrContent } from "../utils/buildQrContent.js";
import User from "../models/User.js";

const makeSlug = () => crypto.randomBytes(6).toString("base64url");

const normalizeDestinationUrl = (rawUrl) => {
  const url = String(rawUrl || "").trim();
  if (!url) return "";
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) return url;
  if (/^\/\//.test(url)) return `https:${url}`;

  const isLocal = /^(localhost|127(?:\.\d+){0,2}\.\d+|10(?:\.\d+){0,2}\.\d+|172\.(1[6-9]|2\d|3[0-1])(?:\.\d+){0,2}\.\d+|192\.168(?:\.\d+){0,2}\.\d+)(:\d+)?(\/.*)?$/i;
  const isHost = /^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+(:\d+)?(\/.*)?$/i;

  if (isLocal.test(url)) {
    return `http://${url}`;
  }

  if (isHost.test(url)) {
    return `https://${url}`;
  }

  throw new Error("Destination must be a full URL or a valid hostname/local address.");
};

const normalizeStyle = (style) => {
  const s = style || {};
  return {
    width: Number(s.width) || 300,
    margin: Number.isFinite(Number(s.margin)) ? Number(s.margin) : 2,
    errorCorrectionLevel: s.errorCorrectionLevel || "M",
    darkColor: s.darkColor || "#000000",
    lightColor: s.lightColor || "#FFFFFF"
  };
};

export const generateQR = async (req, res) => {
  try {
    const { type, payload, style, dynamic, previewDataUrl } = req.body;

    const normalizedStyle = normalizeStyle(style);
    const baseContent = buildQrContent({ type, payload });

    if (!baseContent) {
      return res.status(400).json({ success: false, message: "Missing content" });
    }

    let isDynamic = Boolean(dynamic);
    let slug;
    let destinationUrl;
    let content = baseContent;

    if (isDynamic) {
      destinationUrl = normalizeDestinationUrl(baseContent);
      const publicBaseUrl = (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");
      if (!publicBaseUrl) {
        return res.status(400).json({
          success: false,
          message: "PUBLIC_BASE_URL is required for dynamic QR"
        });
      }
      slug = makeSlug();
      content = `${publicBaseUrl}/r/${slug}`;
    }

    const qrImage = await QRCode.toDataURL(content, {
      width: normalizedStyle.width,
      margin: normalizedStyle.margin,
      errorCorrectionLevel: normalizedStyle.errorCorrectionLevel,
      color: {
        dark: normalizedStyle.darkColor,
        light: normalizedStyle.lightColor
      }
    });

    const qrDoc = await QrCode.create({
      userId: req.userId,
      type: String(type || "text"),
      payload: payload || {},
      content,
      isDynamic,
      slug,
      destinationUrl,
      style: normalizedStyle,
      previewDataUrl: previewDataUrl || qrImage
    });

    res.status(201).json({
      success: true,
      qr: qrDoc,
      qrImage
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listHistory = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const items = await QrCode.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [totalGenerated, byTypeAgg, scansAgg, recent] = await Promise.all([
      QrCode.countDocuments({ userId }),
      QrCode.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      QrCode.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: null, scansTotal: { $sum: "$scansCount" } } }
      ]),
      QrCode.find({ userId }).sort({ updatedAt: -1 }).limit(10).select("type scansCount lastScannedAt createdAt isDynamic slug content")
    ]);

    const byType = Object.fromEntries(byTypeAgg.map((x) => [x._id, x.count]));
    const mostUsedType = byTypeAgg[0]?._id || null;
    const scansTotal = scansAgg?.[0]?.scansTotal || 0;

    res.status(200).json({
      success: true,
      totalGenerated,
      byType,
      mostUsedType,
      scansTotal,
      recent
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDynamicDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { destinationUrl } = req.body;

    const qr = await QrCode.findOne({ _id: id, userId: req.userId });
    if (!qr) return res.status(404).json({ success: false, message: "QR not found" });
    if (!qr.isDynamic) return res.status(400).json({ success: false, message: "Not a dynamic QR" });
    if (!destinationUrl) return res.status(400).json({ success: false, message: "destinationUrl required" });

    qr.destinationUrl = normalizeDestinationUrl(destinationUrl);
    await qr.save();

    res.status(200).json({ success: true, qr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const redirectDynamic = async (req, res) => {
  try {
    const { slug } = req.params;
    const qr = await QrCode.findOne({ slug, isDynamic: true });
    if (!qr) return res.status(404).send("Not found");

    const destinationUrl = qr.destinationUrl || "";
    if (!destinationUrl) {
      console.warn(`[QR Redirect] slug=${slug} qrId=${qr._id} - destination not set`);
      return res.status(400).send("Destination not set");
    }

    console.log(`[QR Redirect] slug=${slug} qrId=${qr._id} dest=${destinationUrl} ip=${req.ip} ua=${req.headers['user-agent']}`);

    qr.scansCount += 1;
    qr.lastScannedAt = new Date();
    await qr.save();

    await ScanEvent.create({
      qrId: qr._id,
      userId: qr.userId,
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.redirect(302, destinationUrl);
  } catch (error) {
    res.status(500).send("Server error");
  }
};

export const publicGenerate = async (req, res) => {
  try {
    const { type, payload, style, dynamic } = req.body;
    const normalizedStyle = normalizeStyle(style);
    const baseContent = buildQrContent({ type, payload });

    if (!baseContent) return res.status(400).json({ success: false, message: "Missing content" });

    let content = baseContent;
    if (dynamic) {
      return res.status(400).json({ success: false, message: "Dynamic QR requires user auth (MVP)" });
    }

    const qrImage = await QRCode.toDataURL(content, {
      width: normalizedStyle.width,
      margin: normalizedStyle.margin,
      errorCorrectionLevel: normalizedStyle.errorCorrectionLevel,
      color: { dark: normalizedStyle.darkColor, light: normalizedStyle.lightColor }
    });

    const apiKey = req.headers["x-api-key"];
    const user = apiKey ? await User.findOne({ apiKey }).select("_id") : null;

    if (user?._id) {
      await QrCode.create({
        userId: user._id,
        type: String(type || "text"),
        payload: payload || {},
        content,
        isDynamic: false,
        style: normalizedStyle,
        previewDataUrl: qrImage
      });
    }

    res.status(200).json({ success: true, content, qrImage, stored: Boolean(user?._id) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const renderSvg = async (req, res) => {
  try {
    const { content, style } = req.body;
    const normalizedStyle = normalizeStyle(style);
    if (!content) return res.status(400).json({ success: false, message: "content required" });

    const svg = await QRCode.toString(String(content), {
      type: "svg",
      margin: normalizedStyle.margin,
      errorCorrectionLevel: normalizedStyle.errorCorrectionLevel,
      color: {
        dark: normalizedStyle.darkColor,
        light: normalizedStyle.lightColor
      }
    });

    res.status(200).json({ success: true, svg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
