import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : authHeader;

  if (!token) {
    return res.status(401).json({
      message: "No token"
    });
  }

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;
    req.userId = decoded?.id;

    next();

  } catch (error) {

    res.status(401).json({
      message: "Invalid token"
    });

  }
};
