import { Result } from "../Core/Result";
import { OrderService } from "../Core/Services/OrderService";
import { CustomerId, OrderId, PaymentProofFile } from "../Core/ValueObjects";

export interface UploadPaymentProofRequest {
  readonly orderId: number;
  readonly customerId: number;
  readonly fileName: string;
  readonly fileUrl: string;
  readonly fileSize: number;
  readonly mimeType: string;
}

export interface UploadPaymentProofResponse {
  readonly orderId: number;
  readonly status: string;
  readonly paymentProofUploaded: boolean;
  readonly uploadedAt: Date;
}

export class UploadPaymentProofAction {
  constructor(private readonly orderService: OrderService) {}

  async execute(request: UploadPaymentProofRequest): Promise<Result<UploadPaymentProofResponse>> {
    try {
      // Validate request
      const validationResult = this.validateRequest(request);
      if (validationResult.isError()) {
        return Result.error(validationResult.getError());
      }

      // Create value objects
      const orderId = new OrderId(request.orderId);
      const customerId = new CustomerId(request.customerId);
      const paymentProofFile = new PaymentProofFile(
        request.fileName,
        request.fileUrl,
        request.fileSize,
        request.mimeType,
      );

      // Upload payment proof through domain service
      const orderResult = await this.orderService.uploadPaymentProof(orderId, customerId, paymentProofFile);

      if (orderResult.isError()) {
        return Result.error(orderResult.getError());
      }

      const order = orderResult.getValue();

      // Map to response
      const response: UploadPaymentProofResponse = {
        orderId: order.id,
        status: order.status,
        paymentProofUploaded: order.hasPaymentProof(),
        uploadedAt: order.paymentProof?.uploadedAt || new Date(),
      };

      return Result.success(response);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private validateRequest(request: UploadPaymentProofRequest): Result<void> {
    if (!request.orderId || request.orderId <= 0) {
      return Result.error("Valid order ID is required");
    }

    if (!request.customerId || request.customerId <= 0) {
      return Result.error("Valid customer ID is required");
    }

    if (!request.fileName || request.fileName.trim().length === 0) {
      return Result.error("File name is required");
    }

    if (!request.fileUrl || request.fileUrl.trim().length === 0) {
      return Result.error("File URL is required");
    }

    if (!request.fileSize || request.fileSize <= 0) {
      return Result.error("Valid file size is required");
    }

    if (!request.mimeType || request.mimeType.trim().length === 0) {
      return Result.error("MIME type is required");
    }

    // Validate file size (max 10MB)
    const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
    if (request.fileSize > maxFileSize) {
      return Result.error("File size cannot exceed 10MB");
    }

    return Result.success(undefined);
  }
}
