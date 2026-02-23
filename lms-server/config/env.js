function getEnvConfig() {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT || 5000),
    CLIENT_URL: process.env.CLIENT_URL,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: Number(process.env.EMAIL_PORT || 587),
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    ENABLE_DEBUG_ENDPOINTS: process.env.ENABLE_DEBUG_ENDPOINTS === 'true',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  };
}

function validateEnv(config) {
  const missing = [];
  if (!config.MONGO_URI) missing.push('MONGO_URI');
  if (!config.JWT_SECRET) missing.push('JWT_SECRET');
  if (config.NODE_ENV === 'production' && !config.CLIENT_URL) missing.push('CLIENT_URL');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  getEnvConfig,
  validateEnv,
};
