require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
};

// Basic validation
if (!config.mongoUri) {
  throw new Error('MONGO_URI environment variable is not defined.');
}
if (!config.jwtSecret) {
  throw new Error('JWT_SECRET environment variable is not defined.');
}

module.exports = config;
