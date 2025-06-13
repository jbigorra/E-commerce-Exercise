import { BaseDomainEvent } from "../../Shared/EventBus";

export class CartItemAddedEvent extends BaseDomainEvent {
  constructor(cartId: string, payload: { userId: string }) {
    super("cart.item.added", cartId, payload);
  }
}

export class CartItemRemovedEvent extends BaseDomainEvent {
  constructor(cartId: string, payload: { userId: string }) {
    super("cart.item.removed", cartId, payload);
  }
}

export class CartItemQuantityChangedEvent extends BaseDomainEvent {
  constructor(cartId: string, payload: { userId: string }) {
    super("cart.item.quantity.changed", cartId, payload);
  }
}
