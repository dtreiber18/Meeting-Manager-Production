@description('The name of the Application Insights resource')
param name string

@description('The location into which the resources should be deployed')
param location string = resourceGroup().location

@description('The resource ID of the Log Analytics workspace')
param logAnalyticsWorkspaceId string

@description('The tags to apply to the resources')
param tags object = {}

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: name
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspaceId
  }
}

@description('The resource ID of the Application Insights resource')
output id string = applicationInsights.id

@description('The instrumentation key of the Application Insights resource')
output instrumentationKey string = applicationInsights.properties.InstrumentationKey

@description('The connection string of the Application Insights resource')
output connectionString string = applicationInsights.properties.ConnectionString
