import { Result } from "../../Core/Result";
import { FileStorageService as IFileStorageService } from "../../Core/Services/OrderService";
import { OrderId, PaymentProofFile } from "../../Core/ValueObjects";

// Cloud storage interface (would be implemented with AWS S3, Google Cloud Storage, etc.)
interface CloudStorageProvider {
  uploadFile(
    bucket: string,
    key: string,
    buffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<string>;
  deleteFile(bucket: string, key: string): Promise<void>;
  getSignedUrl(bucket: string, key: string, expiresIn?: number): Promise<string>;
}

// File validation interface
interface FileValidator {
  validateFile(file: PaymentProofFile): Result<void>;
  sanitizeFileName(fileName: string): string;
}

export class FileStorageService implements IFileStorageService {
  private readonly bucketName: string;
  private readonly maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes: string[] = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ];

  constructor(
    private readonly cloudStorage: CloudStorageProvider,
    private readonly fileValidator: FileValidator,
    bucketName: string = "marcus-bikes-payment-proofs",
  ) {
    this.bucketName = bucketName;
  }

  async uploadPaymentProof(file: PaymentProofFile, orderId: OrderId): Promise<Result<string>> {
    try {
      // Validate file
      const validationResult = this.validatePaymentProofFile(file);
      if (validationResult.isError()) {
        return validationResult;
      }

      // Generate unique file key
      const fileKey = this.generateFileKey(orderId, file.fileName);

      // Sanitize file name
      const sanitizedFileName = this.fileValidator.sanitizeFileName(file.fileName);

      // Prepare metadata
      const metadata = {
        orderId: orderId.toString(),
        originalFileName: sanitizedFileName,
        uploadedAt: new Date().toISOString(),
        fileSize: file.fileSize.toString(),
      };

      // Convert file URL to buffer (in real implementation, this would be the actual file buffer)
      const fileBuffer = await this.getFileBuffer(file.fileUrl);

      // Upload to cloud storage
      const uploadedUrl = await this.cloudStorage.uploadFile(
        this.bucketName,
        fileKey,
        fileBuffer,
        file.mimeType,
        metadata,
      );

      return Result.success(uploadedUrl);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async deletePaymentProof(fileUrl: string): Promise<Result<void>> {
    try {
      // Extract file key from URL
      const fileKey = this.extractFileKeyFromUrl(fileUrl);

      if (!fileKey) {
        return Result.error("Invalid file URL");
      }

      // Delete from cloud storage
      await this.cloudStorage.deleteFile(this.bucketName, fileKey);

      return Result.success(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async getSignedUrl(fileUrl: string, expiresInSeconds: number = 3600): Promise<Result<string>> {
    try {
      // Extract file key from URL
      const fileKey = this.extractFileKeyFromUrl(fileUrl);

      if (!fileKey) {
        return Result.error("Invalid file URL");
      }

      // Get signed URL for secure access
      const signedUrl = await this.cloudStorage.getSignedUrl(this.bucketName, fileKey, expiresInSeconds);

      return Result.success(signedUrl);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private validatePaymentProofFile(file: PaymentProofFile): Result<string> {
    // File size validation
    if (file.fileSize > this.maxFileSize) {
      return Result.error(`File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    if (file.fileSize <= 0) {
      return Result.error("File size must be greater than 0");
    }

    // MIME type validation
    if (!this.allowedMimeTypes.includes(file.mimeType)) {
      return Result.error(
        `File type ${file.mimeType} is not allowed. Allowed types: ${this.allowedMimeTypes.join(", ")}`,
      );
    }

    // File name validation
    if (!file.fileName || file.fileName.trim().length === 0) {
      return Result.error("File name is required");
    }

    if (file.fileName.length > 255) {
      return Result.error("File name is too long (maximum 255 characters)");
    }

    // Check for potentially dangerous file extensions
    const dangerousExtensions = [".exe", ".bat", ".cmd", ".scr", ".pif", ".com"];
    const fileExtension = file.getFileExtension();
    if (dangerousExtensions.includes(`.${fileExtension}`)) {
      return Result.error("File type not allowed for security reasons");
    }

    return Result.success(file.fileUrl);
  }

  private generateFileKey(orderId: OrderId, fileName: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const sanitizedFileName = this.fileValidator.sanitizeFileName(fileName);

    return `payment-proofs/order-${orderId.value}/${timestamp}-${randomSuffix}-${sanitizedFileName}`;
  }

  private extractFileKeyFromUrl(fileUrl: string): string | null {
    try {
      // Extract file key from cloud storage URL
      // This implementation depends on the cloud storage provider
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split("/");

      // Find the part that starts with 'payment-proofs/'
      const paymentProofIndex = pathParts.findIndex((part) => part === "payment-proofs");
      if (paymentProofIndex === -1) {
        return null;
      }

      // Reconstruct the file key
      return pathParts.slice(paymentProofIndex).join("/");
    } catch (error) {
      return null;
    }
  }

  private async getFileBuffer(fileUrl: string): Promise<Buffer> {
    // In a real implementation, this would fetch the file from the temporary upload location
    // For now, we'll simulate it
    return Buffer.from("mock file content");
  }
}

// Default file validator implementation
export class DefaultFileValidator implements FileValidator {
  validateFile(file: PaymentProofFile): Result<void> {
    // Basic validation - can be extended
    if (!file.fileName || file.fileName.trim().length === 0) {
      return Result.error("File name is required");
    }

    if (file.fileSize <= 0) {
      return Result.error("File size must be greater than 0");
    }

    return Result.success(undefined);
  }

  sanitizeFileName(fileName: string): string {
    // Remove or replace potentially dangerous characters
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, "_") // Replace non-alphanumeric chars with underscore
      .replace(/_{2,}/g, "_") // Replace multiple underscores with single
      .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores
      .toLowerCase();
  }
}
