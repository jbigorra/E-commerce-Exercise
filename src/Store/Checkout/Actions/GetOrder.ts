import { Order, OrderItem, PaymentProof } from "../Core/Entities";
import { Result } from "../Core/Result";
import { OrderService } from "../Core/Services/OrderService";
import { CustomerId, OrderId } from "../Core/ValueObjects";

export interface GetOrderRequest {
  readonly orderId: number;
  readonly customerId?: number; // Optional for admin access
}

export interface GetOrdersByCustomerRequest {
  readonly customerId: number;
}

export interface OrderItemResponse {
  readonly id: number;
  readonly productId: number;
  readonly productName: string;
  readonly productConfiguration: {
    readonly basePrice: number;
    readonly selectedPartChoices: Array<{
      readonly partName: string;
      readonly partChoiceName: string;
      readonly price: number;
    }>;
  };
  readonly unitPrice: number;
  readonly totalPrice: number;
}

export interface PaymentProofResponse {
  readonly fileName: string;
  readonly fileUrl: string;
  readonly uploadedAt: Date;
}

export interface OrderResponse {
  readonly id: number;
  readonly customerId: number;
  readonly status: string;
  readonly totalPrice: number;
  readonly items: OrderItemResponse[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly paymentProof?: PaymentProofResponse;
  readonly adminNotes?: string;
  readonly canUploadPaymentProof: boolean;
  readonly canBeConfirmed: boolean;
  readonly canBeRejected: boolean;
  readonly canBeMarkedAsReadyToPickup: boolean;
  readonly canBeCompleted: boolean;
  readonly canBeCancelled: boolean;
}

export class GetOrderAction {
  constructor(private readonly orderService: OrderService) {}

  async getOrderById(request: GetOrderRequest): Promise<Result<OrderResponse>> {
    try {
      // Validate request
      if (!request.orderId || request.orderId <= 0) {
        return Result.error("Valid order ID is required");
      }

      // Create value objects
      const orderId = new OrderId(request.orderId);

      // Get order through domain service
      const orderResult = await this.orderService.getOrderById(orderId);
      if (orderResult.isError()) {
        return Result.error(orderResult.getError());
      }

      const order = orderResult.getValue();

      // If customerId is provided, verify access
      if (request.customerId !== undefined) {
        if (order.customerId !== request.customerId) {
          return Result.error("Unauthorized to access this order");
        }
      }

      // Map to response
      const response = this.mapOrderToResponse(order);
      return Result.success(response);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async getOrdersByCustomer(request: GetOrdersByCustomerRequest): Promise<Result<OrderResponse[]>> {
    try {
      // Validate request
      if (!request.customerId || request.customerId <= 0) {
        return Result.error("Valid customer ID is required");
      }

      // Create value objects
      const customerId = new CustomerId(request.customerId);

      // Get orders through domain service
      const ordersResult = await this.orderService.getOrdersByCustomer(customerId);
      if (ordersResult.isError()) {
        return Result.error(ordersResult.getError());
      }

      const orders = ordersResult.getValue();

      // Map to response
      const response = orders.map((order) => this.mapOrderToResponse(order));
      return Result.success(response);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async getPendingOrders(): Promise<Result<OrderResponse[]>> {
    try {
      // Get pending orders through domain service
      const ordersResult = await this.orderService.getPendingOrders();
      if (ordersResult.isError()) {
        return Result.error(ordersResult.getError());
      }

      const orders = ordersResult.getValue();

      // Map to response
      const response = orders.map((order) => this.mapOrderToResponse(order));
      return Result.success(response);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async getOrdersWithPaymentProof(): Promise<Result<OrderResponse[]>> {
    try {
      // Get orders with payment proof through domain service
      const ordersResult = await this.orderService.getOrdersWithPaymentProof();
      if (ordersResult.isError()) {
        return Result.error(ordersResult.getError());
      }

      const orders = ordersResult.getValue();

      // Map to response
      const response = orders.map((order) => this.mapOrderToResponse(order));
      return Result.success(response);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private mapOrderToResponse(order: Order): OrderResponse {
    return {
      id: order.id,
      customerId: order.customerId,
      status: order.status,
      totalPrice: order.totalPrice,
      items: order.items.map((item) => this.mapOrderItemToResponse(item)),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paymentProof: order.paymentProof ? this.mapPaymentProofToResponse(order.paymentProof) : undefined,
      adminNotes: order.adminNotes,
      canUploadPaymentProof: order.canUploadPaymentProof(),
      canBeConfirmed: order.canBeConfirmed(),
      canBeRejected: order.canBeRejected(),
      canBeMarkedAsReadyToPickup: order.canBeMarkedAsReadyToPickup(),
      canBeCompleted: order.canBeCompleted(),
      canBeCancelled: order.canBeCancelled(),
    };
  }

  private mapOrderItemToResponse(item: OrderItem): OrderItemResponse {
    return {
      id: item.id,
      productId: item.productId,
      productName: item.productConfiguration.productName,
      productConfiguration: {
        basePrice: item.productConfiguration.basePrice,
        selectedPartChoices: item.productConfiguration.selectedPartChoices.map((choice) => ({
          partName: choice.partName,
          partChoiceName: choice.partChoiceName,
          price: choice.price,
        })),
      },
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    };
  }

  private mapPaymentProofToResponse(paymentProof: PaymentProof): PaymentProofResponse {
    return {
      fileName: paymentProof.fileName,
      fileUrl: paymentProof.fileUrl,
      uploadedAt: paymentProof.uploadedAt,
    };
  }
}
