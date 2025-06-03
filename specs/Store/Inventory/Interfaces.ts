import { Product } from "../../../src/db"

export interface IProductRepository {
  findById(id: number): Product | undefined
}

export interface IInventory {
  products: IProductRepository
}