targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment that can be used as part of naming resource convention')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Location for OpenAI resources')
param openAiLocation string = 'eastus'

// Optional parameters
@description('Id of the user or app to assign application roles')
param principalId string = ''

// Variables
var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = { 'azd-env-name': environmentName }

// Resource Group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

// Container Apps Environment
module containerAppsEnvironment './modules/container-apps-environment.bicep' = {
  name: 'container-apps-environment'
  scope: rg
  params: {
    name: '${abbrs.appManagedEnvironments}${resourceToken}'
    location: location
    logAnalyticsWorkspaceName: logAnalytics.outputs.name
    tags: tags
  }
}

// Container Registry
module containerRegistry './modules/container-registry.bicep' = {
  name: 'container-registry'
  scope: rg
  params: {
    name: '${abbrs.containerRegistryRegistries}${resourceToken}'
    location: location
    tags: tags
  }
}

// Log Analytics Workspace
module logAnalytics './modules/log-analytics.bicep' = {
  name: 'log-analytics'
  scope: rg
  params: {
    name: '${abbrs.operationalInsightsWorkspaces}${resourceToken}'
    location: location
    tags: tags
  }
}

// Application Insights
module applicationInsights './modules/application-insights.bicep' = {
  name: 'application-insights'
  scope: rg
  params: {
    name: '${abbrs.insightsComponents}${resourceToken}'
    location: location
    logAnalyticsWorkspaceId: logAnalytics.outputs.id
    tags: tags
  }
}

// Key Vault
module keyVault './modules/key-vault.bicep' = {
  name: 'key-vault'
  scope: rg
  params: {
    name: '${abbrs.keyVaultVaults}${resourceToken}'
    location: location
    principalId: principalId
    tags: tags
  }
}

// Storage Account
module storage './modules/storage-account.bicep' = {
  name: 'storage-account'
  scope: rg
  params: {
    name: '${abbrs.storageStorageAccounts}${resourceToken}'
    location: location
    tags: tags
  }
}

// Azure Database for MySQL
module mysql './modules/mysql.bicep' = {
  name: 'mysql'
  scope: rg
  params: {
    serverName: '${abbrs.dBforMySQLServers}${resourceToken}'
    databaseName: 'meeting_manager'
    location: location
    tags: tags
  }
}

// Cosmos DB for MongoDB
module cosmosDb './modules/cosmos-db.bicep' = {
  name: 'cosmos-db'
  scope: rg
  params: {
    accountName: '${abbrs.documentDBDatabaseAccounts}${resourceToken}'
    databaseName: 'meeting_manager'
    location: location
    tags: tags
  }
}

// OpenAI Service
module openAi './modules/openai.bicep' = {
  name: 'openai'
  scope: rg
  params: {
    name: '${abbrs.cognitiveServicesAccounts}${resourceToken}-openai'
    location: openAiLocation
    tags: tags
  }
}

// Cognitive Services
module cognitiveServices './modules/cognitive-services.bicep' = {
  name: 'cognitive-services'
  scope: rg
  params: {
    name: '${abbrs.cognitiveServicesAccounts}${resourceToken}'
    location: location
    tags: tags
  }
}

// Frontend Container App
module frontend './modules/container-app.bicep' = {
  name: 'frontend'
  scope: rg
  params: {
    name: '${abbrs.appContainerApps}frontend-${resourceToken}'
    location: location
    containerAppsEnvironmentId: containerAppsEnvironment.outputs.id
    containerRegistryName: containerRegistry.outputs.name
    containerImage: '${containerRegistry.outputs.name}.azurecr.io/meeting-manager-frontend:latest'
    tags: tags
    env: [
      {
        name: 'API_URL'
        value: '${backend.outputs.uri}/api'
      }
    ]
  }
}

// Backend Container App
module backend './modules/container-app.bicep' = {
  name: 'backend'
  scope: rg
  params: {
    name: '${abbrs.appContainerApps}backend-${resourceToken}'
    location: location
    containerAppsEnvironmentId: containerAppsEnvironment.outputs.id
    containerRegistryName: containerRegistry.outputs.name
    containerImage: '${containerRegistry.outputs.name}.azurecr.io/meeting-manager-backend:latest'
    tags: tags
    env: [
      {
        name: 'SPRING_PROFILES_ACTIVE'
        value: 'azure'
      }
      {
        name: 'DB_HOST'
        value: mysql.outputs.fullyQualifiedDomainName
      }
      {
        name: 'MONGODB_URI'
        value: 'mongodb://${cosmosDb.outputs.accountName}.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false'
      }
      {
        name: 'AZURE_OPENAI_ENDPOINT'
        value: openAi.outputs.endpoint
      }
      {
        name: 'AZURE_OPENAI_API_KEY'
        value: listKeys(openAi.outputs.id, '2023-10-01-preview').key1
      }
      {
        name: 'AZURE_OPENAI_DEPLOYMENT_NAME'
        value: 'gpt-35-turbo'
      }
      {
        name: 'AZURE_TEXT_ANALYTICS_ENDPOINT'
        value: cognitiveServices.outputs.endpoint
      }
    ]
  }
}

// Outputs
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_RESOURCE_GROUP string = rg.name

output AZURE_CONTAINER_REGISTRY_ENDPOINT string = containerRegistry.outputs.loginServer
output AZURE_CONTAINER_REGISTRY_NAME string = containerRegistry.outputs.name

output FRONTEND_URI string = frontend.outputs.uri
output BACKEND_URI string = backend.outputs.uri

output AZURE_OPENAI_ENDPOINT string = openAi.outputs.endpoint
output AZURE_COGNITIVE_SERVICES_ENDPOINT string = cognitiveServices.outputs.endpoint