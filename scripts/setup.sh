#!/bin/bash

# WellBank Setup Script
# This script sets up the development environment

set -e

echo "🏥 WellBank Healthcare Platform - Setup Script"
echo "=============================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
npm run install:all
echo "✅ Dependencies installed"
echo ""

# Build shared types
echo "🔨 Building shared types..."
npm run shared:build
echo "✅ Shared types built"
echo ""

# Setup environment file
echo "⚙️  Setting up environment..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from .env.example"
else
    echo "ℹ️  backend/.env already exists, skipping"
fi
echo ""

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d
echo "✅ Docker services started"
echo ""

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service health
echo "🔍 Checking service health..."
docker-compose ps
echo ""

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Review backend/.env and adjust if needed"
echo "   2. Start the backend: npm run backend:dev"
echo "   3. Visit http://localhost:3000/api/v1/docs for API documentation"
echo ""
echo "🔧 Development tools:"
echo "   - PostgreSQL: localhost:5432 (user: wellbank, password: wellbank_dev_password)"
echo "   - Redis: localhost:6379"
echo "   - Vault: http://localhost:8200 (token: dev-only-token)"
echo "   - MinIO: http://localhost:9001 (user: minioadmin, password: minioadmin)"
echo "   - MailHog: http://localhost:8025"
echo ""
echo "🚀 Happy coding!"
