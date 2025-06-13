import { Result } from "../Core/Result";
import { CartItem, OrderService } from "../Core/Services/OrderService";
import { CustomerId } from "../Core/ValueObjects";

export interface CreateOrderRequest {
  readonly customerId: number;
  readonly cartItems: CartItem[];
}

export interface CreateOrderResponse {
  readonly orderId: number;
  readonly orderReference: string;
  readonly totalPrice: number;
  readonly status: string;
  readonly createdAt: Date;
  readonly itemsCount: number;
}

export class CreateOrderAction {
  constructor(private readonly orderService: OrderService) {}

  async execute(request: CreateOrderRequest): Promise<Result<CreateOrderResponse>> {
    try {
      // Validate request
      const validationResult = this.validateRequest(request);
      if (validationResult.isError()) {
        return Result.error(validationResult.getError());
      }

      // Create value objects
      const customerId = new CustomerId(request.customerId);

      // Create order through domain service
      const orderResult = await this.orderService.createOrder(customerId, request.cartItems);
      if (orderResult.isError()) {
        return Result.error(orderResult.getError());
      }

      const order = orderResult.getValue();

      // Map to response
      const response: CreateOrderResponse = {
        orderId: order.id,
        orderReference: `ORD-${order.id}`,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
        itemsCount: order.getTotalItemsCount(),
      };

      return Result.success(response);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private validateRequest(request: CreateOrderRequest): Result<void> {
    if (!request.customerId || request.customerId <= 0) {
      return Result.error("Valid customer ID is required");
    }

    if (!request.cartItems || request.cartItems.length === 0) {
      return Result.error("Cart items are required");
    }

    // Validate each cart item
    for (const item of request.cartItems) {
      if (!item.productId || item.productId <= 0) {
        return Result.error("Valid product ID is required for all cart items");
      }

      if (!item.productConfiguration) {
        return Result.error("Product configuration is required for all cart items");
      }

      if (item.unitPrice < 0) {
        return Result.error("Unit price cannot be negative");
      }

      if (item.totalPrice < 0) {
        return Result.error("Total price cannot be negative");
      }

      if (item.productConfiguration.selectedPartChoices.length === 0) {
        return Result.error("At least one part choice must be selected for each product");
      }
    }

    return Result.success(undefined);
  }
}
