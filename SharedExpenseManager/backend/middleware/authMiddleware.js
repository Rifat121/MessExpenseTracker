const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      const decoded = jwt.verify(token.split(" ")[1], config.jwtSecret);
      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Unauthorized, invalid token" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized, no token provided" });
  }
};

exports.isAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res
      .status(403)
      .json({ message: "Only admins can perform this action." });
  }
  next();
};
