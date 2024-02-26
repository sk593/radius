provider 'br:shruthikumar.azurecr.io/test/radius@1.0.0'

@description('Specifies the location for resources.')
param location string = 'global'

@description('Specifies the image of the container resource.')
param magpieimage string

@description('Specifies the port of the container resource.')
param port int = 3000

@description('Specifies the environment for resources.')
param environment string

var manifest = loadTextContent('manifest/sidecar.yaml')

resource app 'Applications.Core/applications@2023-10-01-preview' = {
  name: 'corerp-resources-container-sidecar'
  location: location
  properties: {
    environment: environment
    extensions: [
      {
          kind: 'kubernetesNamespace'
          namespace: 'corerp-resources-container-sidecar'
      }
    ]
  }
}

resource container 'Applications.Core/containers@2023-10-01-preview' = {
  name: 'ctnr-sidecar'
  location: location
  properties: {
    application: app.id
    container: {
      image: magpieimage
      ports: {
        web: {
          containerPort: port
        }
      }
    }
    connections: {}
    runtimes: {
      kubernetes: {
        base: manifest
      }
    }
  }
}

