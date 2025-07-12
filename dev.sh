#!/bin/bash

echo "🚀 Starting CareTracker Development Environment..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start the development environment
echo "🔨 Building and starting development containers..."
docker-compose -f docker-compose.dev.yml up --build

echo ""
echo "✅ Development environment started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo "🗄️  Database: localhost:5432"
echo ""
echo "💡 Hot reloading is enabled! Any changes to your code will automatically refresh the applications."
echo "🛑 Press Ctrl+C to stop the development environment." 