import { Product } from "../Core/Entities";
import { IInventory } from "../Interfaces";
import { ActionResult } from "./ViewProduct";

export class SelectProductOptionCommand {
  constructor(readonly productId: number, readonly optionId: number) {}
}

export class SelectProductOption {
  constructor(private readonly inventory: IInventory) {}

  public execute(command: SelectProductOptionCommand): ActionResult<Product> {
    const product = this.inventory.products.findById(command.productId);

    if (!product) {
      return { result: undefined, error: new Error("Product not found") };
    }

    if (product.type === "standard") {
      return {
        result: undefined,
        error: new Error("Product is not customizable"),
      };
    }

    const optionIndex = product.availableOptions.findIndex(
      (o) => o.id === command.optionId
    );

    if (optionIndex === -1) {
      return {
        result: undefined,
        error: new Error("Product option not found"),
      };
    }

    const option = product.availableOptions.splice(optionIndex, 1)[0];

    product.selectedOptions.push(option);

    return { result: product, error: undefined };
  }
}
