@description('The name of the Cognitive Services account')
param name string

@description('The location into which the resources should be deployed')
param location string = resourceGroup().location

@description('The tags to apply to the resources')
param tags object = {}

resource cognitiveServices 'Microsoft.CognitiveServices/accounts@2023-10-01-preview' = {
  name: name
  location: location
  tags: tags
  kind: 'CognitiveServices'
  properties: {
    apiProperties: {
      statisticsEnabled: false
    }
  }
  sku: {
    name: 'S0'
  }
}

@description('The resource ID of the Cognitive Services account')
output id string = cognitiveServices.id

@description('The endpoint of the Cognitive Services account')
output endpoint string = cognitiveServices.properties.endpoint

@description('The name of the Cognitive Services account')
output name string = cognitiveServices.name
