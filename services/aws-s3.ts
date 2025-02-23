import { S3Client } from "@aws-sdk/client-s3";

const bucketReg =  process.env.BUCKET_REG;
const accessKey =  process.env.ACCESS_K;
const sAccessKey =  process.env.S_ACCESS_K;

const s3 = new S3Client ({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: sAccessKey,
  },
  region: bucketReg
})

export default s3