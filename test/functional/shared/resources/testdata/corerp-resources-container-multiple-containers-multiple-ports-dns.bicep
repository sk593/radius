provider radius

@description('Specifies the location for resources.')
param location string = 'global'

@description('Specifies the image of the container resource.')
param magpieimage string

@description('Specifies the port of the container resource.')
param port int = 3000

@description('Specifies the environment for resources.')
param environment string

resource app 'Applications.Core/applications@2023-10-01-preview' = {
  name: 'corerp-resources-container-multiple-containers-multiple-ports-dns'
  location: location
  properties: {
    environment: environment
    extensions: [
      {
          kind: 'kubernetesNamespace'
          namespace: 'corerp-resources-container-multiple-containers-multiple-ports-dns'
      }
    ]
  }
}

resource containerqw 'Applications.Core/containers@2023-10-01-preview' = {
  name: 'containerqw'
  location: location
  properties: {
    application: app.id
    container: {
      image: magpieimage
    }
    connections: {
      containerqe: {
        source: 'http://containerqe:42'
      }
      containerqr: {
        source: 'http://containerqr:934'
      }
    }
  }
}

// canonically accurate ports :)
resource containerqe 'Applications.Core/containers@2023-10-01-preview' = {
  name: 'containerqe'
  location: location
  properties: {
    application: app.id
    container: {
      image: magpieimage
      ports: {
        web: {
          containerPort: port
        }
        wonderland: {
          containerPort: 42
        }
        vegas: {
          containerPort: 777
        }
      }
    }
  }
}

resource containerqr 'Applications.Core/containers@2023-10-01-preview' = {
  name: 'containerqr'
  location: location
  properties: {
    application: app.id
    container: {
      image: magpieimage
      ports: {
        web: {
          containerPort: port
        }
        hogwarts: {
          containerPort: 934
        }
        narnia: {
          containerPort: 7
        }
        asgard: {
          containerPort: 9
        }
      }
    }
  }
}
