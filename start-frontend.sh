#!/bin/bash

# Start the frontend with proxy configuration
cd "$(dirname "$0")/frontend"
echo "Starting Angular development server with proxy configuration..."
echo "Frontend will be available at: http://localhost:4200"
echo "API requests will be proxied to: http://localhost:8081"
echo ""

npx --force ng serve --proxy-config proxy.conf.json --port 4200
