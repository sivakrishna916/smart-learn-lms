function getEnvConfig() {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT || 5000),
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: Number(process.env.EMAIL_PORT || 587),
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    ENABLE_DEBUG_ENDPOINTS: process.env.ENABLE_DEBUG_ENDPOINTS === 'true',
  };
}

function validateEnv(config) {
  const missing = [];
  if (!config.MONGO_URI) missing.push('MONGO_URI');
  if (!config.JWT_SECRET) missing.push('JWT_SECRET');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  getEnvConfig,
  validateEnv,
};
