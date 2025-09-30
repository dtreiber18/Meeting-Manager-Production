#!/bin/bash

echo "🔧 Fixing Container App Environment Variables..."

# Set environment variables for the container app
az containerapp update \
  --name ca-backend \
  --resource-group rg-dev \
  --set-env-vars \
    "SPRING_PROFILES_ACTIVE=prod" \
    "DB_URL=jdbc:mysql://mysql-meetingmanager-dev.mysql.database.azure.com:3306/meeting_manager?useSSL=true&requireSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" \
    "DB_USERNAME=meetingadmin" \
    "DB_PASSWORD=MeetingManager2025!" \
    "JPA_DDL_AUTO=update" \
    "JPA_SHOW_SQL=false"

echo "✅ Environment variables updated!"

echo "🔍 Checking deployment status..."
az containerapp revision list --name ca-backend --resource-group rg-dev --query "[0].{name:name,active:properties.active,replicas:properties.replicas,provisioningState:properties.provisioningState}" --output table

echo "⏳ Waiting for new revision to be healthy..."
sleep 30

echo "🧪 Testing API endpoint..."
curl -I https://ca-backend.salmonfield-f21211f0.eastus.azurecontainerapps.io/actuator/health