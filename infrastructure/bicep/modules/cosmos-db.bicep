@description('Cosmos DB account name')
param accountName string

@description('Cosmos DB database name')
param databaseName string

@description('Location for the Cosmos DB account.')
param location string = resourceGroup().location

@description('The tags to apply to the resources')
param tags object = {}

@description('The default consistency level of the Cosmos DB account.')
@allowed([
  'Eventual'
  'ConsistentPrefix'
  'Session'
  'BoundedStaleness'
  'Strong'
])
param defaultConsistencyLevel string = 'Session'

@description('Max stale requests. Required for BoundedStaleness. Valid ranges, Single Region: 10 to 1000000. Multi Region: 100000 to 1000000.')
@minValue(10)
@maxValue(2147483647)
param maxStalenessPrefix int = 100000

@description('Max lag time (minutes). Required for BoundedStaleness. Valid ranges, Single Region: 5 to 84600. Multi Region: 300 to 86400.')
@minValue(5)
@maxValue(86400)
param maxIntervalInSeconds int = 300

resource account 'Microsoft.DocumentDB/databaseAccounts@2023-09-15' = {
  name: toLower(accountName)
  location: location
  tags: tags
  kind: 'MongoDB'
  properties: {
    consistencyPolicy: {
      defaultConsistencyLevel: defaultConsistencyLevel
      maxStalenessPrefix: maxStalenessPrefix
      maxIntervalInSeconds: maxIntervalInSeconds
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    databaseAccountOfferType: 'Standard'
    enableAutomaticFailover: false
    enableMultipleWriteLocations: false
    apiProperties: {
      serverVersion: '4.2'
    }
    capabilities: [
      {
        name: 'EnableMongo'
      }
    ]
  }
}

resource database 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases@2023-09-15' = {
  parent: account
  name: databaseName
  properties: {
    resource: {
      id: databaseName
    }
  }
}

resource meetingsCollection 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases/collections@2023-09-15' = {
  parent: database
  name: 'meetings'
  properties: {
    resource: {
      id: 'meetings'
      shardKey: {
        _id: 'Hash'
      }
      indexes: [
        {
          key: {
            keys: [
              '_id'
            ]
          }
        }
      ]
    }
  }
}

@description('The resource ID of the Cosmos DB account')
output id string = account.id

@description('The endpoint of the Cosmos DB account')
output endpoint string = account.properties.documentEndpoint

@description('The name of the Cosmos DB account')
output accountName string = account.name
