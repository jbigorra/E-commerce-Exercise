export interface Customer {
  readonly id: number;
  readonly email: string;
  readonly name: string;
  readonly createdAt: Date;
}

export interface OrderItem {
  readonly id: number;
  readonly orderId: number;
  readonly productId: number;
  readonly productConfiguration: ProductConfiguration;
  readonly unitPrice: number;
  readonly totalPrice: number;
}

export interface ProductConfiguration {
  readonly productId: number;
  readonly productName: string;
  readonly basePrice: number;
  readonly selectedPartChoices: SelectedPartChoice[];
}

export interface SelectedPartChoice {
  readonly partId: number;
  readonly partName: string;
  readonly partChoiceId: number;
  readonly partChoiceName: string;
  readonly price: number;
  readonly priceAdjustments: PriceAdjustment[];
}

export interface PriceAdjustment {
  readonly constraintId: number;
  readonly adjustment: number;
  readonly reason: string;
}

export type OrderStatus =
  | "pending_payment"
  | "payment_uploaded"
  | "confirmed"
  | "rejected"
  | "ready_to_pickup"
  | "completed"
  | "cancelled";

export interface PaymentProof {
  readonly id: number;
  readonly orderId: number;
  readonly fileName: string;
  readonly fileUrl: string;
  readonly uploadedAt: Date;
  readonly uploadedBy: number;
}

export class Order {
  constructor(
    public readonly id: number,
    public readonly customerId: number,
    public readonly status: OrderStatus,
    public readonly totalPrice: number,
    public readonly items: OrderItem[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly paymentProof?: PaymentProof,
    public readonly adminNotes?: string,
  ) {}

  static create(customerId: number, items: OrderItem[], totalPrice: number): Order {
    return new Order(
      0, // Will be set by persistence layer
      customerId,
      "pending_payment",
      totalPrice,
      items,
      new Date(),
      new Date(),
    );
  }

  canUploadPaymentProof(): boolean {
    return this.status === "pending_payment";
  }

  canBeConfirmed(): boolean {
    return this.status === "payment_uploaded";
  }

  canBeRejected(): boolean {
    return this.status === "payment_uploaded";
  }

  canBeMarkedAsReadyToPickup(): boolean {
    return this.status === "confirmed";
  }

  canBeCompleted(): boolean {
    return this.status === "ready_to_pickup";
  }

  canBeCancelled(): boolean {
    return ["pending_payment", "payment_uploaded"].includes(this.status);
  }

  withPaymentProof(paymentProof: PaymentProof): Order {
    if (!this.canUploadPaymentProof()) {
      throw new Error(`Cannot upload payment proof for order in status: ${this.status}`);
    }

    return new Order(
      this.id,
      this.customerId,
      "payment_uploaded",
      this.totalPrice,
      this.items,
      this.createdAt,
      new Date(),
      paymentProof,
      this.adminNotes,
    );
  }

  confirm(adminNotes?: string): Order {
    if (!this.canBeConfirmed()) {
      throw new Error(`Cannot confirm order in status: ${this.status}`);
    }

    return new Order(
      this.id,
      this.customerId,
      "confirmed",
      this.totalPrice,
      this.items,
      this.createdAt,
      new Date(),
      this.paymentProof,
      adminNotes,
    );
  }

  reject(adminNotes: string): Order {
    if (!this.canBeRejected()) {
      throw new Error(`Cannot reject order in status: ${this.status}`);
    }

    return new Order(
      this.id,
      this.customerId,
      "rejected",
      this.totalPrice,
      this.items,
      this.createdAt,
      new Date(),
      this.paymentProof,
      adminNotes,
    );
  }

  markAsReadyToPickup(adminNotes?: string): Order {
    if (!this.canBeMarkedAsReadyToPickup()) {
      throw new Error(`Cannot mark order as ready to pickup in status: ${this.status}`);
    }

    return new Order(
      this.id,
      this.customerId,
      "ready_to_pickup",
      this.totalPrice,
      this.items,
      this.createdAt,
      new Date(),
      this.paymentProof,
      adminNotes,
    );
  }

  complete(): Order {
    if (!this.canBeCompleted()) {
      throw new Error(`Cannot complete order in status: ${this.status}`);
    }

    return new Order(
      this.id,
      this.customerId,
      "completed",
      this.totalPrice,
      this.items,
      this.createdAt,
      new Date(),
      this.paymentProof,
      this.adminNotes,
    );
  }

  cancel(adminNotes?: string): Order {
    if (!this.canBeCancelled()) {
      throw new Error(`Cannot cancel order in status: ${this.status}`);
    }

    return new Order(
      this.id,
      this.customerId,
      "cancelled",
      this.totalPrice,
      this.items,
      this.createdAt,
      new Date(),
      this.paymentProof,
      adminNotes,
    );
  }

  getTotalItemsCount(): number {
    return this.items.length;
  }

  hasPaymentProof(): boolean {
    return this.paymentProof !== undefined;
  }

  isInFinalState(): boolean {
    return ["completed", "cancelled", "rejected"].includes(this.status);
  }
}
