#!/bin/bash

# WellBank Development Start Script
# Starts all services and the backend in development mode

set -e

echo "🏥 Starting WellBank Development Environment"
echo "==========================================="
echo ""

# Check if Docker services are running
if ! docker-compose ps | grep -q "Up"; then
    echo "🐳 Starting Docker services..."
    docker-compose up -d
    echo "⏳ Waiting for services to be ready..."
    sleep 5
else
    echo "✅ Docker services already running"
fi

echo ""
echo "🚀 Starting backend in development mode..."
echo ""

cd backend && npm run dev
