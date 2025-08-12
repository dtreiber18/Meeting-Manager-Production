@description('Server Name for Azure database for MySQL')
param serverName string

@description('Database name')
param databaseName string

@description('Location for all resources.')
param location string = resourceGroup().location

@description('The tags to apply to the resources')
param tags object = {}

@description('MySQL version')
@allowed([
  '8.0.21'
  '5.7'
])
param version string = '8.0.21'

@description('The administrator username of the SQL logical server.')
param administratorLogin string = 'mysqladmin'

@description('The administrator password of the SQL logical server.')
@secure()
param administratorLoginPassword string = newGuid()

resource mysqlServer 'Microsoft.DBforMySQL/flexibleServers@2023-06-30' = {
  name: serverName
  location: location
  tags: tags
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: version
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorLoginPassword
    storage: {
      storageSizeGB: 20
      iops: 360
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    network: {
      delegatedSubnetResourceId: null
      privateDnsZoneResourceId: null
      publicNetworkAccess: 'Enabled'
    }
  }
}

resource mysqlServerFirewallRule 'Microsoft.DBforMySQL/flexibleServers/firewallRules@2023-06-30' = {
  parent: mysqlServer
  name: 'AllowAllWindowsAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '255.255.255.255'
  }
}

resource mysqlDatabase 'Microsoft.DBforMySQL/flexibleServers/databases@2023-06-30' = {
  parent: mysqlServer
  name: databaseName
  properties: {
    charset: 'utf8'
    collation: 'utf8_general_ci'
  }
}

@description('The fully qualified domain name of the MySQL server')
output fullyQualifiedDomainName string = mysqlServer.properties.fullyQualifiedDomainName

@description('The administrator username')
output administratorLogin string = administratorLogin
