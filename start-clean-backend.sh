#!/bin/bash

# Clean Database and Start Production-Ready Backend
# This script removes demo data and starts with a clean database

echo "🧹 Cleaning demo data from database..."

# Connect to MySQL and clean demo data
mysql -u root -p -e "
USE meetingmanager;
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM action_items WHERE organization_id IN (SELECT id FROM organizations WHERE name LIKE '%Sample%' OR name LIKE '%Acme%' OR domain = 'example.com');
DELETE FROM meeting_participants WHERE email LIKE '%example.com';
DELETE FROM meetings WHERE organization_id IN (SELECT id FROM organizations WHERE name LIKE '%Sample%' OR name LIKE '%Acme%' OR domain = 'example.com');
DELETE FROM users WHERE email LIKE '%example.com' OR email LIKE '%acme.com' OR organization_id IN (SELECT id FROM organizations WHERE name LIKE '%Sample%' OR name LIKE '%Acme%' OR domain = 'example.com');
DELETE FROM organizations WHERE name LIKE '%Sample%' OR name LIKE '%Acme%' OR domain = 'example.com';
SET FOREIGN_KEY_CHECKS = 1;
"

echo "✅ Demo data cleaned from database"

echo "🚀 Starting production-ready backend..."
cd "$(dirname "$0")/backend"
./mvnw spring-boot:run
