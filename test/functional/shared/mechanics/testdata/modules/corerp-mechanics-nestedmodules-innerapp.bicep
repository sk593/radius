provider 'br:shruthikumar.azurecr.io/bicep/radius@1.0.0'

param location string
param environment string

resource innerApp 'Applications.Core/applications@2023-10-01-preview' = {
  name: 'corerp-mechanics-nestedmodules-innerapp-app'
  location: location
  properties: {
    environment: environment
  }
}
