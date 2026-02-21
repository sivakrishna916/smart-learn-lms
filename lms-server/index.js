const dotenv = require('dotenv');
const app = require('./app');
const { getEnvConfig, validateEnv } = require('./config/env');
const { connectDatabase } = require('./config/database');

dotenv.config();

async function startServer() {
  try {
    const config = getEnvConfig();
    validateEnv(config);

    await connectDatabase(config.MONGO_URI);

    app.listen(config.PORT, () => {
      console.log(`Server running on port ${config.PORT}`);
    });
  } catch (error) {
    console.error('Startup validation error:', error.message);
    process.exit(1);
  }
}

startServer();
