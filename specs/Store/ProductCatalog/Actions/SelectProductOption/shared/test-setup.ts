import { SelectProductOption } from "../../../../../../src/Store/ProductCatalog/Actions/SelectProductOption";
import { Product } from "../../../../../../src/Store/ProductCatalog/Core/Entities";
import {
  InMemoryInventory,
  ProductRepository,
} from "../../../../../../src/Store/ProductCatalog/Infrastructure/InMemoryInventory";
import { IInventory } from "../../../../../../src/Store/ProductCatalog/Interfaces";

/**
 * Creates a test inventory with the provided products
 */
export function createTestInventory(products: Product[]): IInventory {
  return new InMemoryInventory(new ProductRepository(products));
}

/**
 * Creates a SelectProductOption action with the provided inventory
 */
export function createSelectAction(inventory: IInventory): SelectProductOption {
  return new SelectProductOption(inventory);
}

/**
 * Standard test data IDs for consistent usage across tests
 */
export const TestIds = {
  STANDARD_PRODUCT: 1,
  CUSTOMIZABLE_PRODUCT: 2,
  NOT_FOUND_PRODUCT: 100,
  UNAVAILABLE_OPTION: 100,
  BASIC_PART_1: 1,
  BASIC_PART_2: 2,
  BASIC_PART_3: 3,
  BASIC_CHOICE_1: 1,
  BASIC_CHOICE_2: 2,
  BASIC_CHOICE_3: 3,
} as const;
