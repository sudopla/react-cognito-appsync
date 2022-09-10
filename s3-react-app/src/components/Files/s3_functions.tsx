import { S3Client, ListObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { FileProperties } from './types'

const bucketName = process.env.REACT_APP_FILES_BUCKET_NAME || ''

export const listFiles = async (client: S3Client): Promise<FileProperties[] | undefined> => {
  try {
    const response = await client.send(
      new ListObjectsCommand({
        Bucket: bucketName
      })
    )
    const s3Files = response.Contents?.map((obj) => {
      return {
        name: obj.Key,
        size: (obj.Size && obj.Size / 1024)?.toFixed(2) || '',
        lastModified:
          obj.LastModified?.toLocaleDateString('en-us', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) || ''
      } as FileProperties
    })
    return s3Files
  } catch (err) {
    console.log(err)
    throw Error(err as string)
  }
}

export const uploadFile = async (client: S3Client, file: File) => {
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: file.name,
        Body: file
      })
    )
  } catch (err) {
    console.log(err)
    throw Error(err as string)
  }
}
