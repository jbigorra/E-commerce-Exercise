import { PartChoiceStockUpdatedEvent } from "../../Inventory/Events/PartChoiceEvents";
import { BaseEventHandler, EventHandlerResult } from "../../Shared/EventBus";

export class PartChoiceStockUpdatedEventHandler extends BaseEventHandler<PartChoiceStockUpdatedEvent> {
  constructor() {
    super("part.choice.stock.updated", "PartChoiceStockUpdatedEventHandler");
  }

  handle(event: PartChoiceStockUpdatedEvent): EventHandlerResult {
    console.log(`PartChoiceStockUpdatedEventHandler: ${event.payload.stock}`);
    return this.success();
  }
}
