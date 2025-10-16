#!/bin/bash

# Start Backend with Fathom Integration Enabled
# This script loads environment variables from .env and starts the backend

echo "🚀 Starting Meeting Manager Backend with Fathom Integration..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Using default configuration."
fi

# Load environment variables from .env if it exists
if [ -f .env ]; then
    echo "📝 Loading environment variables from .env..."
    export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
fi

# Ensure Fathom is enabled
export FATHOM_ENABLED=true

# Check if backend is already running
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Backend is already running on port 8080"
    echo "   Stop it first with: pkill -f 'spring-boot:run'"
    exit 1
fi

# Start the backend
echo "🔧 Starting Spring Boot application..."
./mvnw spring-boot:run -f backend/pom.xml > backend.log 2>&1 &

BACKEND_PID=$!
echo "✅ Backend started with PID: $BACKEND_PID"
echo "📋 Logs: tail -f backend.log"
echo "🔍 Health check: curl http://localhost:8080/api/webhooks/fathom/health"
echo ""
echo "Waiting for backend to start..."

# Wait for backend to be ready (max 30 seconds)
for i in {1..30}; do
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        echo "🎯 Fathom webhook endpoint: http://localhost:8080/api/webhooks/fathom"
        exit 0
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "⚠️  Backend is taking longer than expected to start. Check backend.log for details."
