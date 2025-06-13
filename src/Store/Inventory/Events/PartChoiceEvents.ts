import { BaseDomainEvent } from "../../Shared/EventBus";

export class PartChoiceStockUpdatedEvent extends BaseDomainEvent {
  constructor(partChoiceId: string, payload: { stock: boolean }) {
    super("part.choice.stock.updated", partChoiceId, payload);
  }
}
