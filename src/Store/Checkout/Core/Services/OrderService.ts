import { Order, OrderItem, PaymentProof, ProductConfiguration } from "../Entities";
import { Result } from "../Result";
import { CustomerId, OrderId, PaymentProofFile } from "../ValueObjects";

export interface CartItem {
  readonly productId: number;
  readonly productConfiguration: ProductConfiguration;
  readonly unitPrice: number;
  readonly totalPrice: number;
}

export interface OrderRepository {
  save(order: Order): Promise<Result<Order>>;
  findById(id: OrderId): Promise<Result<Order>>;
  findByCustomerId(customerId: CustomerId): Promise<Result<Order[]>>;
  findPendingOrders(): Promise<Result<Order[]>>;
  findOrdersWithPaymentProof(): Promise<Result<Order[]>>;
}

export interface PaymentProofRepository {
  save(paymentProof: PaymentProof): Promise<Result<PaymentProof>>;
  findByOrderId(orderId: OrderId): Promise<Result<PaymentProof | null>>;
}

export interface NotificationService {
  notifyAdminOfNewOrder(order: Order): Promise<Result<void>>;
  notifyAdminOfPaymentProofUploaded(order: Order): Promise<Result<void>>;
  notifyCustomerOfOrderConfirmation(order: Order): Promise<Result<void>>;
  notifyCustomerOfOrderRejection(order: Order): Promise<Result<void>>;
  notifyCustomerOfOrderReadyToPickup(order: Order): Promise<Result<void>>;
}

export interface FileStorageService {
  uploadPaymentProof(file: PaymentProofFile, orderId: OrderId): Promise<Result<string>>;
  deletePaymentProof(fileUrl: string): Promise<Result<void>>;
}

export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentProofRepository: PaymentProofRepository,
    private readonly notificationService: NotificationService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async createOrder(customerId: CustomerId, cartItems: CartItem[]): Promise<Result<Order>> {
    try {
      if (cartItems.length === 0) {
        return Result.error("Cannot create order with empty cart");
      }

      // Calculate total price
      const totalPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

      if (totalPrice <= 0) {
        return Result.error("Order total must be greater than zero");
      }

      // Create order items
      const orderItems: OrderItem[] = cartItems.map((cartItem, index) => ({
        id: 0, // Will be set by persistence layer
        orderId: 0, // Will be set by persistence layer
        productId: cartItem.productId,
        productConfiguration: cartItem.productConfiguration,
        unitPrice: cartItem.unitPrice,
        totalPrice: cartItem.totalPrice,
      }));

      // Create order
      const order = Order.create(customerId.value, orderItems, totalPrice);

      // Save order
      const saveResult = await this.orderRepository.save(order);
      if (saveResult.isError()) {
        return saveResult;
      }

      const savedOrder = saveResult.getValue();

      // Notify admin of new order
      await this.notificationService.notifyAdminOfNewOrder(savedOrder);

      return Result.success(savedOrder);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async uploadPaymentProof(
    orderId: OrderId,
    customerId: CustomerId,
    paymentProofFile: PaymentProofFile,
  ): Promise<Result<Order>> {
    try {
      // Find order
      const orderResult = await this.orderRepository.findById(orderId);
      if (orderResult.isError()) {
        return Result.error("Order not found");
      }

      const order = orderResult.getValue();

      // Verify order belongs to customer
      if (order.customerId !== customerId.value) {
        return Result.error("Unauthorized to upload payment proof for this order");
      }

      // Check if order can accept payment proof
      if (!order.canUploadPaymentProof()) {
        return Result.error(`Cannot upload payment proof for order in status: ${order.status}`);
      }

      // Upload file
      const uploadResult = await this.fileStorageService.uploadPaymentProof(paymentProofFile, orderId);
      if (uploadResult.isError()) {
        return Result.error("Failed to upload payment proof file");
      }

      const fileUrl = uploadResult.getValue();

      // Create payment proof record
      const paymentProof: PaymentProof = {
        id: 0, // Will be set by persistence layer
        orderId: orderId.value,
        fileName: paymentProofFile.fileName,
        fileUrl: fileUrl,
        uploadedAt: new Date(),
        uploadedBy: customerId.value,
      };

      // Save payment proof
      const saveProofResult = await this.paymentProofRepository.save(paymentProof);
      if (saveProofResult.isError()) {
        // Clean up uploaded file
        await this.fileStorageService.deletePaymentProof(fileUrl);
        return Result.error("Failed to save payment proof");
      }

      const savedPaymentProof = saveProofResult.getValue();

      // Update order with payment proof
      const updatedOrder = order.withPaymentProof(savedPaymentProof);

      // Save updated order
      const saveOrderResult = await this.orderRepository.save(updatedOrder);
      if (saveOrderResult.isError()) {
        return saveOrderResult;
      }

      const savedOrder = saveOrderResult.getValue();

      // Notify admin of payment proof upload
      await this.notificationService.notifyAdminOfPaymentProofUploaded(savedOrder);

      return Result.success(savedOrder);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async confirmOrder(orderId: OrderId, adminNotes?: string): Promise<Result<Order>> {
    try {
      // Find order
      const orderResult = await this.orderRepository.findById(orderId);
      if (orderResult.isError()) {
        return Result.error("Order not found");
      }

      const order = orderResult.getValue();

      // Check if order can be confirmed
      if (!order.canBeConfirmed()) {
        return Result.error(`Cannot confirm order in status: ${order.status}`);
      }

      // Confirm order
      const confirmedOrder = order.confirm(adminNotes);

      // Save updated order
      const saveResult = await this.orderRepository.save(confirmedOrder);
      if (saveResult.isError()) {
        return saveResult;
      }

      const savedOrder = saveResult.getValue();

      // Notify customer of confirmation
      await this.notificationService.notifyCustomerOfOrderConfirmation(savedOrder);

      return Result.success(savedOrder);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async rejectOrder(orderId: OrderId, adminNotes: string): Promise<Result<Order>> {
    try {
      if (!adminNotes || adminNotes.trim().length === 0) {
        return Result.error("Admin notes are required when rejecting an order");
      }

      // Find order
      const orderResult = await this.orderRepository.findById(orderId);
      if (orderResult.isError()) {
        return Result.error("Order not found");
      }

      const order = orderResult.getValue();

      // Check if order can be rejected
      if (!order.canBeRejected()) {
        return Result.error(`Cannot reject order in status: ${order.status}`);
      }

      // Reject order
      const rejectedOrder = order.reject(adminNotes);

      // Save updated order
      const saveResult = await this.orderRepository.save(rejectedOrder);
      if (saveResult.isError()) {
        return saveResult;
      }

      const savedOrder = saveResult.getValue();

      // Notify customer of rejection
      await this.notificationService.notifyCustomerOfOrderRejection(savedOrder);

      return Result.success(savedOrder);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async markOrderAsReadyToPickup(orderId: OrderId, adminNotes?: string): Promise<Result<Order>> {
    try {
      // Find order
      const orderResult = await this.orderRepository.findById(orderId);
      if (orderResult.isError()) {
        return Result.error("Order not found");
      }

      const order = orderResult.getValue();

      // Check if order can be marked as ready to pickup
      if (!order.canBeMarkedAsReadyToPickup()) {
        return Result.error(`Cannot mark order as ready to pickup in status: ${order.status}`);
      }

      // Mark as ready to pickup
      const readyOrder = order.markAsReadyToPickup(adminNotes);

      // Save updated order
      const saveResult = await this.orderRepository.save(readyOrder);
      if (saveResult.isError()) {
        return saveResult;
      }

      const savedOrder = saveResult.getValue();

      // Notify customer that order is ready
      await this.notificationService.notifyCustomerOfOrderReadyToPickup(savedOrder);

      return Result.success(savedOrder);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async completeOrder(orderId: OrderId): Promise<Result<Order>> {
    try {
      // Find order
      const orderResult = await this.orderRepository.findById(orderId);
      if (orderResult.isError()) {
        return Result.error("Order not found");
      }

      const order = orderResult.getValue();

      // Check if order can be completed
      if (!order.canBeCompleted()) {
        return Result.error(`Cannot complete order in status: ${order.status}`);
      }

      // Complete order
      const completedOrder = order.complete();

      // Save updated order
      const saveResult = await this.orderRepository.save(completedOrder);
      if (saveResult.isError()) {
        return saveResult;
      }

      return Result.success(saveResult.getValue());
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async getOrderById(orderId: OrderId): Promise<Result<Order>> {
    return await this.orderRepository.findById(orderId);
  }

  async getOrdersByCustomer(customerId: CustomerId): Promise<Result<Order[]>> {
    return await this.orderRepository.findByCustomerId(customerId);
  }

  async getPendingOrders(): Promise<Result<Order[]>> {
    return await this.orderRepository.findPendingOrders();
  }

  async getOrdersWithPaymentProof(): Promise<Result<Order[]>> {
    return await this.orderRepository.findOrdersWithPaymentProof();
  }
}
