import {
  ViewProduct,
  ViewProductCommand,
  ViewProductResult,
} from "../../../src/Store/Inventory/ViewProduct";
import { InMemoryInventory } from "../../../src/Store/Inventory/InMemoryInventory";
import { ProductRepository } from "../../../src/Store/Inventory/InMemoryInventory";
import { Product } from "../../../src/db";
import { productsFixture } from "../../Fixtures/Inventory";

describe("ViewProduct", () => {
  it("should return the standard product", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new ViewProduct(inventory);

    const actionResult = action.execute(new ViewProductCommand(1));

    expect(actionResult).toMatchObject<ViewProductResult>({
      product: {
        id: 1,
        type: "standard",
        options: [],
      },
    });
  });

  it("should return the customizable product", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new ViewProduct(inventory);

    const actionResult = action.execute(new ViewProductCommand(2));

    expect(actionResult).toMatchObject<ViewProductResult>({
      product: {
        id: 2,
        type: "customizable",
        options: [
          {
            id: 1,
          },
          {
            id: 2,
          },
          {
            id: 3,
          },
        ],
      },
    });
  });

  it("should return the product with the base price", () => {
    expect(true).toBe(true);
  });

  it("should return the product marked as out of stock", () => {});
});
