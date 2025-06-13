import { IInventory } from "../Interfaces";
import { ActionResult, Application } from "./Action";
import { ProductDTO } from "./Dtos";

export class ViewProductCommand {
  constructor(readonly productId: number) {}
}

export class ViewProduct {
  constructor(private readonly inventory: IInventory) {}

  public execute(command: ViewProductCommand): ActionResult<ProductDTO> {
    const product = this.inventory.products.findById(command.productId);

    if (!product) return Application.error(new Error("Product not found"));

    return Application.success(ProductDTO.from(product));
  }
}
