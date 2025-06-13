import { PaymentProof } from "../../Core/Entities";
import { Result } from "../../Core/Result";
import { PaymentProofRepository as IPaymentProofRepository } from "../../Core/Services/OrderService";
import { OrderId } from "../../Core/ValueObjects";

// Database entity interface
interface PaymentProofEntity {
  id: number;
  order_id: number;
  file_name: string;
  file_url: string;
  uploaded_at: Date;
  uploaded_by: number;
}

// Mock database interface
interface Database {
  paymentProofs: {
    findByOrderId(orderId: number): Promise<PaymentProofEntity | null>;
    insert(paymentProof: Omit<PaymentProofEntity, "id">): Promise<PaymentProofEntity>;
    update(id: number, paymentProof: Partial<PaymentProofEntity>): Promise<PaymentProofEntity>;
    delete(id: number): Promise<void>;
  };
}

export class PaymentProofRepository implements IPaymentProofRepository {
  constructor(private readonly database: Database) {}

  async save(paymentProof: PaymentProof): Promise<Result<PaymentProof>> {
    try {
      if (paymentProof.id === 0) {
        // Create new payment proof
        return await this.createPaymentProof(paymentProof);
      } else {
        // Update existing payment proof
        return await this.updatePaymentProof(paymentProof);
      }
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findByOrderId(orderId: OrderId): Promise<Result<PaymentProof | null>> {
    try {
      const paymentProofEntity = await this.database.paymentProofs.findByOrderId(orderId.value);

      if (!paymentProofEntity) {
        return Result.success(null);
      }

      const paymentProof = this.mapEntityToPaymentProof(paymentProofEntity);
      return Result.success(paymentProof);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async delete(paymentProofId: number): Promise<Result<void>> {
    try {
      await this.database.paymentProofs.delete(paymentProofId);
      return Result.success(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async createPaymentProof(paymentProof: PaymentProof): Promise<Result<PaymentProof>> {
    try {
      const paymentProofEntity = await this.database.paymentProofs.insert({
        order_id: paymentProof.orderId,
        file_name: paymentProof.fileName,
        file_url: paymentProof.fileUrl,
        uploaded_at: paymentProof.uploadedAt,
        uploaded_by: paymentProof.uploadedBy,
      });

      const savedPaymentProof = this.mapEntityToPaymentProof(paymentProofEntity);
      return Result.success(savedPaymentProof);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async updatePaymentProof(paymentProof: PaymentProof): Promise<Result<PaymentProof>> {
    try {
      const paymentProofEntity = await this.database.paymentProofs.update(paymentProof.id, {
        file_name: paymentProof.fileName,
        file_url: paymentProof.fileUrl,
        uploaded_at: paymentProof.uploadedAt,
        uploaded_by: paymentProof.uploadedBy,
      });

      const savedPaymentProof = this.mapEntityToPaymentProof(paymentProofEntity);
      return Result.success(savedPaymentProof);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private mapEntityToPaymentProof(entity: PaymentProofEntity): PaymentProof {
    return {
      id: entity.id,
      orderId: entity.order_id,
      fileName: entity.file_name,
      fileUrl: entity.file_url,
      uploadedAt: entity.uploaded_at,
      uploadedBy: entity.uploaded_by,
    };
  }
}
