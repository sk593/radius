provider 'br:shruthikumar.azurecr.io/bicep/methods@1.0.0'

resource env 'Applications.Core/environments@2023-10-01-preview' = {
  name: 'my-k8s-env'
  location: 'global'
  properties: {
    compute: {
      kind: 'kubernetes'
      resourceId: 'self'
      namespace: 'my-k8s-env'
    }
  }
}
