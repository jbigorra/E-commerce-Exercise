import {
  ViewProduct,
  ViewProductCommand,
} from "../../../src/Store/Inventory/Actions/ViewProduct";
import { InMemoryInventory } from "../../../src/Store/Inventory/Infrastructure/InMemoryInventory";
import { ProductRepository } from "../../../src/Store/Inventory/Infrastructure/InMemoryInventory";
import { Product } from "../../../src/Store/Inventory/Core/Entities";
import { productsFixture } from "../../Fixtures/Inventory";
import { expectError, expectSuccess } from "../../Helpers/forActions/Matchers";

describe("ViewProduct", () => {
  it("should return the standard product with empty available options", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new ViewProduct(inventory);

    const actionResult = action.execute(new ViewProductCommand(1));

    expectSuccess<Product>(actionResult, {
      id: 1,
      type: "standard",
      availableOptions: (opts: Product["availableOptions"]) => expect(opts).toEqual([])
    });
  });

  it("should return the customizable product with available options", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new ViewProduct(inventory);

    const actionResult = action.execute(new ViewProductCommand(2));

    expectSuccess<Product>(actionResult, {
      id: 2,
      type: "customizable",
      availableOptions: (opts: Product["availableOptions"]) => expect(opts.length).toBeGreaterThan(0),
    });
  });

  it("should return an error if the product is not found", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new ViewProduct(inventory);
    const actionResult = action.execute(new ViewProductCommand(3));
    expectError(actionResult, "Product not found");
  });

  it.each([
    { id: 1, expectedType: "standard" as const, expectedBasePrice: 20 },
    { id: 2, expectedType: "customizable" as const, expectedBasePrice: 20 },
  ])("should return the product with the base price", ({ id, expectedType, expectedBasePrice }) => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new ViewProduct(inventory);

    const actionResult = action.execute(new ViewProductCommand(id));

    expectSuccess<Product>(actionResult, {
      id,
      type: expectedType,
      basePrice: expectedBasePrice,
    });
  });
});
