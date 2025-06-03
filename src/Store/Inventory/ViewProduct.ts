import { IInventory } from "../../../specs/Store/Inventory/Interfaces"
import { Product } from "../../db"

export class ViewProductCommand {
    constructor(
        readonly productId: number
    ) {}
}

export type ViewProductResult = {
    product?: Product,
    error?: Error
}

export class ViewProduct {
    constructor(private readonly inventory: IInventory) {}

    public execute(command: ViewProductCommand): ViewProductResult {
      const product = this.inventory.products.findById(command.productId)

      if (!product) return { product, error: new Error("Product not found") }

      return {
        product
      }
    }
}