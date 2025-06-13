import { IInventory } from "../Interfaces";
import { IProductRepository } from "../Interfaces";
import { Inventory, Product } from "../Core/Entities";

export class InMemoryInventory implements IInventory {
  constructor(readonly products: IProductRepository) {}
}

export class ProductRepository implements IProductRepository {
  constructor(private readonly products: Product[] = []) {}

  findById(id: number): Product | undefined {
    return this.products.find(product => product.id === id)
  }
}
