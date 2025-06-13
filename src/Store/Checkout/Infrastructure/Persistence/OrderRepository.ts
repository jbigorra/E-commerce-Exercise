import { Order, OrderItem, PaymentProof } from "../../Core/Entities";
import { Result } from "../../Core/Result";
import { OrderRepository as IOrderRepository } from "../../Core/Services/OrderService";
import { CustomerId, OrderId } from "../../Core/ValueObjects";

// Database entity interfaces (would typically be from an ORM)
interface OrderEntity {
  id: number;
  customer_id: number;
  status: string;
  total_price: number;
  created_at: Date;
  updated_at: Date;
  admin_notes?: string;
}

interface OrderItemEntity {
  id: number;
  order_id: number;
  product_id: number;
  product_configuration: any; // JSON
  unit_price: number;
  total_price: number;
}

interface PaymentProofEntity {
  id: number;
  order_id: number;
  file_name: string;
  file_url: string;
  uploaded_at: Date;
  uploaded_by: number;
}

// Mock database interface (would be replaced with actual database client)
interface Database {
  orders: {
    findById(id: number): Promise<OrderEntity | null>;
    findByCustomerId(customerId: number): Promise<OrderEntity[]>;
    findByStatus(status: string): Promise<OrderEntity[]>;
    findWithPaymentProof(): Promise<OrderEntity[]>;
    insert(order: Omit<OrderEntity, "id">): Promise<OrderEntity>;
    update(id: number, order: Partial<OrderEntity>): Promise<OrderEntity>;
  };
  orderItems: {
    findByOrderId(orderId: number): Promise<OrderItemEntity[]>;
    insertMany(items: Omit<OrderItemEntity, "id">[]): Promise<OrderItemEntity[]>;
  };
  paymentProofs: {
    findByOrderId(orderId: number): Promise<PaymentProofEntity | null>;
  };
}

export class OrderRepository implements IOrderRepository {
  constructor(private readonly database: Database) {}

  async save(order: Order): Promise<Result<Order>> {
    try {
      if (order.id === 0) {
        // Create new order
        return await this.createOrder(order);
      } else {
        // Update existing order
        return await this.updateOrder(order);
      }
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findById(id: OrderId): Promise<Result<Order>> {
    try {
      const orderEntity = await this.database.orders.findById(id.value);
      if (!orderEntity) {
        return Result.error("Order not found");
      }

      const order = await this.mapEntityToOrder(orderEntity);
      return Result.success(order);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findByCustomerId(customerId: CustomerId): Promise<Result<Order[]>> {
    try {
      const orderEntities = await this.database.orders.findByCustomerId(customerId.value);
      const orders = await Promise.all(orderEntities.map((entity) => this.mapEntityToOrder(entity)));
      return Result.success(orders);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findPendingOrders(): Promise<Result<Order[]>> {
    try {
      const orderEntities = await this.database.orders.findByStatus("pending_payment");
      const orders = await Promise.all(orderEntities.map((entity) => this.mapEntityToOrder(entity)));
      return Result.success(orders);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async findOrdersWithPaymentProof(): Promise<Result<Order[]>> {
    try {
      const orderEntities = await this.database.orders.findWithPaymentProof();
      const orders = await Promise.all(orderEntities.map((entity) => this.mapEntityToOrder(entity)));
      return Result.success(orders);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async createOrder(order: Order): Promise<Result<Order>> {
    try {
      // Insert order
      const orderEntity = await this.database.orders.insert({
        customer_id: order.customerId,
        status: order.status,
        total_price: order.totalPrice,
        created_at: order.createdAt,
        updated_at: order.updatedAt,
        admin_notes: order.adminNotes,
      });

      // Insert order items
      const orderItemEntities = await this.database.orderItems.insertMany(
        order.items.map((item) => ({
          order_id: orderEntity.id,
          product_id: item.productId,
          product_configuration: item.productConfiguration,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
        })),
      );

      // Map back to domain object
      const savedOrder = await this.mapEntityToOrder(orderEntity);
      return Result.success(savedOrder);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async updateOrder(order: Order): Promise<Result<Order>> {
    try {
      const orderEntity = await this.database.orders.update(order.id, {
        status: order.status,
        updated_at: order.updatedAt,
        admin_notes: order.adminNotes,
      });

      const savedOrder = await this.mapEntityToOrder(orderEntity);
      return Result.success(savedOrder);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async mapEntityToOrder(orderEntity: OrderEntity): Promise<Order> {
    // Get order items
    const orderItemEntities = await this.database.orderItems.findByOrderId(orderEntity.id);
    const orderItems: OrderItem[] = orderItemEntities.map((item) => ({
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      productConfiguration: item.product_configuration,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
    }));

    // Get payment proof if exists
    let paymentProof: PaymentProof | undefined;
    const paymentProofEntity = await this.database.paymentProofs.findByOrderId(orderEntity.id);
    if (paymentProofEntity) {
      paymentProof = {
        id: paymentProofEntity.id,
        orderId: paymentProofEntity.order_id,
        fileName: paymentProofEntity.file_name,
        fileUrl: paymentProofEntity.file_url,
        uploadedAt: paymentProofEntity.uploaded_at,
        uploadedBy: paymentProofEntity.uploaded_by,
      };
    }

    return new Order(
      orderEntity.id,
      orderEntity.customer_id,
      orderEntity.status as any, // Type assertion for OrderStatus
      orderEntity.total_price,
      orderItems,
      orderEntity.created_at,
      orderEntity.updated_at,
      paymentProof,
      orderEntity.admin_notes,
    );
  }
}
