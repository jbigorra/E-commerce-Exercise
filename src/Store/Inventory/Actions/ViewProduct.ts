import { IInventory } from "../Interfaces"
import { Product } from "../Core/Entities"

export class ViewProductCommand {
    constructor(
        readonly productId: number
    ) {}
}

export type ActionResult<TResult> =
  | { result: TResult, error: undefined }
  | { result: undefined, error: Error }

export class ViewProduct {
    constructor(private readonly inventory: IInventory) {}

    public execute(command: ViewProductCommand): ActionResult<Product> {
      const product = this.inventory.products.findById(command.productId)

      if (!product) return { result: undefined, error: new Error("Product not found") }

      return {
        result: product,
        error: undefined
      }
    }
}
