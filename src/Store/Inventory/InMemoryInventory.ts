import { IInventory } from "../../../specs/Store/Inventory/Interfaces";
import { IProductRepository } from "../../../specs/Store/Inventory/Interfaces";
import { Inventory, Product } from "../../db";

export class InMemoryInventory implements IInventory {
  constructor(readonly products: IProductRepository) {}
}

export class ProductRepository implements IProductRepository {
  constructor(private readonly products: Product[] = []) {}

  findById(id: number): Product | undefined {
    return this.products.find(product => product.id === id)
  }
}