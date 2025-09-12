#!/bin/bash
# Script to start the Meeting Manager backend server

echo "Starting Meeting Manager Backend Server..."
cd /Users/DougTreiber/Meeting-Manager-Production

# Start the backend server
./mvnw spring-boot:run -f backend/pom.xml
