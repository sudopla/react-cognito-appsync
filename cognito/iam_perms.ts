
// S3
export const S3_READ_ACCESS = [
  's3:ListBucket',
  's3:GetObject',
  's3:GetObjectTagging',
  's3:GetObjectVersionTagging'
]

export const S3_WRITE_ACCESS = [
  's3:ListBucket',
  's3:PutObject',
  's3:PutObjectAcl',
  's3:PutObjectTagging',
  's3:PutObjectVersionTagging'
]

export const S3_DELETE_ACCESS = [
  's3:DeleteObject',
  's3:DeleteObjectVersion',
  's3:DeleteObjectTagging',
  's3:DeleteObjectVersionTagging'
]