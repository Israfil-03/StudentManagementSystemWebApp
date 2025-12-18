const app = require('./app');
const config = require('./config/env');

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🌟 MIRAGE Student Management System                     ║
║                                                           ║
║   Server running on port ${PORT}                            ║
║   Environment: ${config.nodeEnv.padEnd(11)}                          ║
║                                                           ║
║   API Base: http://localhost:${PORT}/api/v1                 ║
║   Health:   http://localhost:${PORT}/api/v1/health          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
