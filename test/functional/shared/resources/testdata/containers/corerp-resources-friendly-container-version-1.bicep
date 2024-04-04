provider 'br:shruthikumar.azurecr.io/bicep/methods@3.0.0'

resource webapp 'Applications.Core/containers@2023-10-01-preview' = {
  name: 'my-ctnr'
  location: 'global'
  properties: {
    application: 'myapp'
    container: {
      image: 'test'
      env: {
        DBCONNECTION: redis.listSecrets().connectionString
      }
    }
    connections: {
      redis: {
        source: redis.id
      }
    }
  }
}

resource redis 'Applications.Datastores/redisCaches@2023-10-01-preview' = {
  name: 'my-rds'
  location: 'global'
  properties: {
    environment: 'test'
    application: 'myapp'
    resourceProvisioning: 'manual'
    host: 'my-ctnr'
    port: 6379
    secrets: {
      connectionString: 'my-ctnr:6379'
      password: ''
    }
  }
}
