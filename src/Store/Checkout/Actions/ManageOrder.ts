import { OrderStatus } from "../Core/Entities";
import { Result } from "../Core/Result";
import { OrderService } from "../Core/Services/OrderService";
import { OrderId } from "../Core/ValueObjects";

export interface ConfirmOrderRequest {
  readonly orderId: number;
  readonly adminNotes?: string;
}

export interface RejectOrderRequest {
  readonly orderId: number;
  readonly adminNotes: string;
}

export interface MarkOrderReadyRequest {
  readonly orderId: number;
  readonly adminNotes?: string;
}

export interface CompleteOrderRequest {
  readonly orderId: number;
}

export interface OrderManagementResponse {
  readonly orderId: number;
  readonly status: OrderStatus;
  readonly updatedAt: Date;
  readonly adminNotes?: string;
}

export class ManageOrderAction {
  constructor(private readonly orderService: OrderService) {}

  async confirmOrder(request: ConfirmOrderRequest): Promise<Result<OrderManagementResponse>> {
    try {
      // Validate request
      if (!request.orderId || request.orderId <= 0) {
        return Result.error("Valid order ID is required");
      }

      // Create value objects
      const orderId = new OrderId(request.orderId);

      // Confirm order through domain service
      const orderResult = await this.orderService.confirmOrder(orderId, request.adminNotes);
      if (orderResult.isError()) {
        return Result.error(orderResult.getError());
      }

      const order = orderResult.getValue();

      // Map to response
      const response: OrderManagementResponse = {
        orderId: order.id,
        status: order.status,
        updatedAt: order.updatedAt,
        adminNotes: order.adminNotes,
      };

      return Result.success(response);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async rejectOrder(request: RejectOrderRequest): Promise<Result<OrderManagementResponse>> {
    try {
      // Validate request
      if (!request.orderId || request.orderId <= 0) {
        return Result.error("Valid order ID is required");
      }

      if (!request.adminNotes || request.adminNotes.trim().length === 0) {
        return Result.error("Admin notes are required when rejecting an order");
      }

      // Create value objects
      const orderId = new OrderId(request.orderId);

      // Reject order through domain service
      const orderResult = await this.orderService.rejectOrder(orderId, request.adminNotes);
      if (orderResult.isError()) {
        return Result.error(orderResult.getError());
      }

      const order = orderResult.getValue();

      // Map to response
      const response: OrderManagementResponse = {
        orderId: order.id,
        status: order.status,
        updatedAt: order.updatedAt,
        adminNotes: order.adminNotes,
      };

      return Result.success(response);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async markOrderAsReadyToPickup(request: MarkOrderReadyRequest): Promise<Result<OrderManagementResponse>> {
    try {
      // Validate request
      if (!request.orderId || request.orderId <= 0) {
        return Result.error("Valid order ID is required");
      }

      // Create value objects
      const orderId = new OrderId(request.orderId);

      // Mark order as ready through domain service
      const orderResult = await this.orderService.markOrderAsReadyToPickup(orderId, request.adminNotes);
      if (orderResult.isError()) {
        return Result.error(orderResult.getError());
      }

      const order = orderResult.getValue();

      // Map to response
      const response: OrderManagementResponse = {
        orderId: order.id,
        status: order.status,
        updatedAt: order.updatedAt,
        adminNotes: order.adminNotes,
      };

      return Result.success(response);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async completeOrder(request: CompleteOrderRequest): Promise<Result<OrderManagementResponse>> {
    try {
      // Validate request
      if (!request.orderId || request.orderId <= 0) {
        return Result.error("Valid order ID is required");
      }

      // Create value objects
      const orderId = new OrderId(request.orderId);

      // Complete order through domain service
      const orderResult = await this.orderService.completeOrder(orderId);
      if (orderResult.isError()) {
        return Result.error(orderResult.getError());
      }

      const order = orderResult.getValue();

      // Map to response
      const response: OrderManagementResponse = {
        orderId: order.id,
        status: order.status,
        updatedAt: order.updatedAt,
        adminNotes: order.adminNotes,
      };

      return Result.success(response);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
