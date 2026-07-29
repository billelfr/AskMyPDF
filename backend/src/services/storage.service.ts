import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';

import { r2Client, r2Config } from '../config/r2.js';

export class StorageService {
  /**
   * Uploads a file to Cloudflare R2
   * @param objectKey The key (path/filename) under which to store the object
   * @param buffer The file buffer
   * @param mimeType The MIME type of the file
   */
  static async uploadFile(objectKey: string, buffer: Buffer, mimeType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: objectKey,
      Body: buffer,
      ContentType: mimeType,
    });

    await r2Client.send(command);
  }

  /**
   * Retrieves a file from Cloudflare R2 as a Buffer
   * @param objectKey The key of the object to retrieve
   */
  static async getObjectBuffer(objectKey: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: r2Config.bucketName,
      Key: objectKey,
    });

    const response = await r2Client.send(command);
    if (!response.Body) {
      throw new Error(`Failed to retrieve object: ${objectKey}`);
    }
    
    // In Node.js stream, we can use the array buffer or stream to read the buffer
    const byteArray = await response.Body.transformToByteArray();
    return Buffer.from(byteArray);
  }

  /**
   * Deletes a file from Cloudflare R2
   * @param objectKey The key of the object to delete
   */
  static async deleteFile(objectKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: r2Config.bucketName,
      Key: objectKey,
    });

    await r2Client.send(command);
  }

  /**
   * Gets a pre-signed URL for temporary access to a file
   * @param objectKey The key of the object
   * @param expiresIn Expiration time in seconds
   */
  static async getSignedUrl(objectKey: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: r2Config.bucketName,
      Key: objectKey,
    });

    return await awsGetSignedUrl(r2Client, command, { expiresIn });
  }
}
