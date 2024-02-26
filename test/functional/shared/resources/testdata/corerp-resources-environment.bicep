provider 'br:shruthikumar.azurecr.io/test/radius@1.0.0'

@description('Specifies the location for resources.')
param location string = 'global'

resource env 'Applications.Core/environments@2023-10-01-preview' = {
  name: 'corerp-resources-environment-env'
  location: location
  properties: {
    compute: {
      kind: 'kubernetes'
      resourceId: 'self'
      namespace: 'corerp-resources-environment-env'
    }
  }
}
