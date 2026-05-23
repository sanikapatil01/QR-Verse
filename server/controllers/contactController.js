export const handleContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    // For MVP we log the submission and return success. In future we can
    // persist to DB or forward via email (nodemailer).
    console.log("[Contact] submission:", { name, email, subject, message, ip: req.ip });

    res.status(200).json({ success: true, message: "Message received" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default handleContact;
