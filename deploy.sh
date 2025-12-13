#!/bin/bash

# Azure App Service custom deployment script for monorepo
# This script handles the server deployment from a monorepo structure

echo "========== Starting custom deployment =========="

# Navigate to the repository root
cd "$DEPLOYMENT_SOURCE"

echo "Installing root dependencies..."
npm install

echo "Navigating to server directory..."
cd server

echo "Installing server dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Building server..."
npm run build

echo "Running database migrations..."
npx prisma migrate deploy || echo "Migration failed or no pending migrations"

# Copy the built files to the deployment target
echo "Copying files to deployment target..."
mkdir -p "$DEPLOYMENT_TARGET"
cp -r dist/* "$DEPLOYMENT_TARGET/"
cp -r node_modules "$DEPLOYMENT_TARGET/"
cp -r prisma "$DEPLOYMENT_TARGET/"
cp package.json "$DEPLOYMENT_TARGET/"

echo "========== Deployment completed =========="
