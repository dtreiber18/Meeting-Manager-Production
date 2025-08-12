@description('The name of the OpenAI service')
param name string

@description('Location for the OpenAI service')
param location string = 'eastus'

@description('The tags to apply to the resources')
param tags object = {}

@description('The custom subdomain name used to access the API')
param customSubDomainName string = name

resource openAIService 'Microsoft.CognitiveServices/accounts@2023-10-01-preview' = {
  name: name
  location: location
  tags: tags
  kind: 'OpenAI'
  properties: {
    apiProperties: {
      statisticsEnabled: false
    }
    customSubDomainName: customSubDomainName
  }
  sku: {
    name: 'S0'
  }
}

resource gpt35TurboDeployment 'Microsoft.CognitiveServices/accounts/deployments@2023-10-01-preview' = {
  parent: openAIService
  name: 'gpt-35-turbo'
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-35-turbo'
      version: '0125'
    }
  }
  sku: {
    name: 'Standard'
    capacity: 10
  }
}

@description('The resource ID of the OpenAI service')
output id string = openAIService.id

@description('The endpoint of the OpenAI service')
output endpoint string = openAIService.properties.endpoint

@description('The name of the OpenAI service')
output name string = openAIService.name
