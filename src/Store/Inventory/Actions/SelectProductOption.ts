import { Product } from "../Core/Entities";
import { IInventory } from "../Interfaces";
import { ActionResult, Application } from "./Action";

export class SelectProductOptionCommand {
  constructor(readonly productId: number, readonly optionIds: number[]) {}
}

export class SelectProductOption {
  constructor(private readonly inventory: IInventory) {}

  public execute(command: SelectProductOptionCommand): ActionResult<Product> {
    const product = this.inventory.products.findById(command.productId);

    if (!product) return Application.error(new Error("Product not found"));
    if (product.isNotCustomizable())
      return Application.error(new Error("Product is not customizable"));

    const { error } = product.customizeWith(command.optionIds);

    if (error) return Application.error(error);

    return Application.success(product);
  }
}
