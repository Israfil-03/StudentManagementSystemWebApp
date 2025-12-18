const app = require('./app');
const config = require('./config/env');
const { execSync } = require('child_process');
const prisma = require('./db/prisma');

const PORT = config.port;

// Run database migrations and seed on startup (for production)
async function initializeDatabase() {
  if (config.nodeEnv === 'production') {
    console.log('🔄 Running database migrations...');
    try {
      execSync('npx prisma migrate deploy', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Migrations completed successfully');
      
      // Check if we need to seed
      const userCount = await prisma.user.count();
      if (userCount === 0) {
        console.log('🌱 Seeding database...');
        execSync('npx prisma db seed', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        console.log('✅ Database seeded successfully');
      }
    } catch (error) {
      console.error('❌ Database initialization error:', error.message);
      // Don't exit - let the server start anyway so health checks work
    }
  }
}

async function startServer() {
  await initializeDatabase();
  
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
}

startServer();
