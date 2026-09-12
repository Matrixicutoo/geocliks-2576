import { S3Client } from "@aws-sdk/client-s3";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const Bucket = process.env.S3_BUCKET!;

export async function presignPut(key: string, contentType: string, expiresIn = 900) {
  return getSignedUrl(s3, new PutObjectCommand({ Bucket, Key: key, ContentType: contentType }), {
    expiresIn,
  });
}

/**
 * `downloadName` makes the object come back as an attachment under that filename. The `download`
 * attribute on an anchor is ignored cross-origin, so a presigned link is the only place the
 * filename of an evidence download can be set.
 */
export async function presignGet(key: string, expiresIn = 60 * 60 * 24, downloadName?: string) {
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket,
      Key: key,
      ...(downloadName
        ? { ResponseContentDisposition: `attachment; filename="${downloadName.replace(/"/g, "")}"` }
        : {}),
    }),
    { expiresIn },
  );
}

export async function putObject(
  key: string,
  body: PutObjectCommandInput["Body"],
  contentType: string,
) {
  await s3.send(new PutObjectCommand({ Bucket, Key: key, Body: body, ContentType: contentType }));
  return key;
}

export async function getObjectBytes(key: string): Promise<Uint8Array | null> {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket, Key: key }));
    const bytes = await res.Body?.transformToByteArray();
    return bytes ?? null;
  } catch {
    return null;
  }
}

/** Remove one stored object. Never throws — a missing key is already the desired state. */
export async function deleteObject(key: string): Promise<boolean> {
  try {
    await s3.send(new DeleteObjectCommand({ Bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}
