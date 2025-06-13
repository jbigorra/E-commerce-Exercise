import { Product } from "./Core/Entities"

export interface IProductRepository {
  findById(id: number): Product | undefined
}

export interface IInventory {
  products: IProductRepository
}
