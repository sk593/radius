provider 'br:shruthikumar.azurecr.io/bicep/aws@4.0.0'

param bucketName string

resource bucket 'AWS.S3/Bucket@default' existing =  {
  alias: bucketName
  properties: {
    BucketName: bucketName
  }
}

output var string = bucket.properties.BucketName
