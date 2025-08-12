@description('The name of the Container App')
param name string

@description('The location into which the resources should be deployed')
param location string = resourceGroup().location

@description('The tags to apply to the resources')
param tags object = {}

@description('The resource ID of the Container Apps Environment')
param containerAppsEnvironmentId string

@description('The name of the Container Registry')
param containerRegistryName string

@description('Environment variables for the container')
param env array = []

@description('CPU cores allocated to a single container instance')
param cpu string = '0.5'

@description('Memory allocated to a single container instance')
param memory string = '1.0Gi'

@description('Minimum number of replicas that will be deployed')
@minValue(0)
@maxValue(25)
param minReplicas int = 1

@description('Maximum number of replicas that will be deployed')
@minValue(1)
@maxValue(25)
param maxReplicas int = 3

@description('The target port for the container')
param targetPort int = 8080

@description('The path to use for health checks')
param healthCheckPath string = '/health'

@description('The container image to deploy')
param containerImage string = 'nginx:latest'

resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: containerAppsEnvironmentId
    configuration: {
      ingress: {
        external: true
        targetPort: targetPort
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: '${containerRegistryName}.azurecr.io'
          identity: 'system'
        }
      ]
      secrets: []
    }
    template: {
      containers: [
        {
          image: containerImage
          name: name
          env: env
          resources: {
            cpu: json(cpu)
            memory: memory
          }
          probes: [
            {
              type: 'liveness'
              httpGet: {
                path: healthCheckPath
                port: targetPort
                scheme: 'HTTP'
              }
              initialDelaySeconds: 30
              periodSeconds: 10
              timeoutSeconds: 5
              failureThreshold: 3
            }
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        rules: [
          {
            name: 'http-rule'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}

@description('The resource ID of the Container App')
output id string = containerApp.id

@description('The name of the Container App')
output name string = containerApp.name

@description('The URI of the Container App')
output uri string = 'https://${containerApp.properties.configuration.ingress.fqdn}'

@description('The FQDN of the Container App')
output fqdn string = containerApp.properties.configuration.ingress.fqdn
