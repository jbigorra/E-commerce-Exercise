import { BaseDomainEvent } from "../../Shared/EventBus";

export class ProductCreatedEvent extends BaseDomainEvent {
  constructor(
    productId: string,
    payload: {
      name: string;
      basePrice: number;
      type: string;
    },
  ) {
    super("product.created", productId, payload);
  }
}

export class ProductPriceChangedEvent extends BaseDomainEvent {
  constructor(
    productId: string,
    payload: {
      oldPrice: number;
      newPrice: number;
      changedBy: string;
    },
  ) {
    super("product.price.changed", productId, payload);
  }
}

export class ProductStockUpdatedEvent extends BaseDomainEvent {
  constructor(
    productId: string,
    payload: {
      choiceId: string;
      previousStock: boolean;
      currentStock: boolean;
      updatedBy: string;
    },
  ) {
    super("product.stock.updated", productId, payload);
  }
}
