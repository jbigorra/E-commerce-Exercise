import { BaseDomainEvent } from "../../Shared/EventBus";

export class CartCreatedEvent extends BaseDomainEvent {
  constructor(cartId: string, payload: { userId: string }) {
    super("cart.created", cartId, payload);
  }
}

export class CartConvertedToOrderEvent extends BaseDomainEvent {
  constructor(cartId: string, payload: { userId: string }) {
    super("cart.converted.to.order", cartId, payload);
  }
}

export class CartAbandonedEvent extends BaseDomainEvent {
  constructor(cartId: string, payload: { userId: string }) {
    super("cart.abandoned", cartId, payload);
  }
}
