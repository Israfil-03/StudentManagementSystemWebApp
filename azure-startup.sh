# Azure App Service - Node.js Configuration
# This file configures how Azure runs the Node.js app

# Startup command for Azure
# Azure will use this to start the application
az webapp config set --startup-file "cd server && npm run start"
