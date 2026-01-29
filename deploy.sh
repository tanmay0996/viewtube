#!/bin/bash

echo "🚀 Starting deployment..."

echo "📥 Pulling latest code from GitHub..."
git pull origin main

echo "🛑 Stopping containers..."
docker-compose down

echo "🔨 Building and starting containers..."
docker-compose up -d --build

echo "🧹 Cleaning up unused Docker resources..."
docker system prune -af

echo "✅ Deployment complete!"
