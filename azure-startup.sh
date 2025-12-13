#!/bin/bash
# Azure App Service - Node.js Startup Script
# This script is executed when the Azure App Service starts

# Navigate to the app directory
cd /home/site/wwwroot

# Install server dependencies and generate Prisma client
cd server && npm install && npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Start the server
node dist/index.js
