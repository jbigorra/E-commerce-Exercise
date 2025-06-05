import {
  ViewProduct,
  ViewProductCommand,
} from "../../../src/Store/Inventory/Actions/ViewProduct";
import { Product } from "../../../src/Store/Inventory/Core/Entities";
import {
  InMemoryInventory,
  ProductRepository,
} from "../../../src/Store/Inventory/Infrastructure/InMemoryInventory";
import {
  CUSTOMIZABLE_PRODUCT_ID,
  NOT_FOUND_PRODUCT_ID,
  productsFixture,
  STANDARD_PRODUCT_ID,
} from "../../Fixtures/Inventory";
import { expectError, expectSuccess } from "../../Helpers/forActions/Matchers";

describe("ViewProduct", () => {
  it("should return the standard product with empty available options", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new ViewProduct(inventory);

    const actionResult = action.execute(
      new ViewProductCommand(STANDARD_PRODUCT_ID)
    );

    expectSuccess<Product>(actionResult, {
      id: STANDARD_PRODUCT_ID,
      type: "standard",
      availableOptions: (opts: Product["availableOptions"]) =>
        expect(opts).toEqual([]),
    });
  });

  it("should return the customizable product with available options", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new ViewProduct(inventory);

    const actionResult = action.execute(
      new ViewProductCommand(CUSTOMIZABLE_PRODUCT_ID)
    );

    expectSuccess<Product>(actionResult, {
      id: CUSTOMIZABLE_PRODUCT_ID,
      type: "customizable",
      availableOptions: (opts: Product["availableOptions"]) =>
        expect(opts.length).toBeGreaterThan(0),
    });
  });

  it("should return an error if the product is not found", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new ViewProduct(inventory);
    const actionResult = action.execute(
      new ViewProductCommand(NOT_FOUND_PRODUCT_ID)
    );
    expectError(actionResult, "Product not found");
  });

  it.each([
    {
      id: STANDARD_PRODUCT_ID,
      expectedType: "standard" as const,
      expectedBasePrice: 20,
    },
    {
      id: CUSTOMIZABLE_PRODUCT_ID,
      expectedType: "customizable" as const,
      expectedBasePrice: 20,
    },
  ])(
    "should return the product with the base price",
    ({ id, expectedType, expectedBasePrice }) => {
      const products: Product[] = productsFixture();
      const inventory = new InMemoryInventory(new ProductRepository(products));
      const action = new ViewProduct(inventory);

      const actionResult = action.execute(new ViewProductCommand(id));

      expectSuccess<Product>(actionResult, {
        id,
        type: expectedType,
        basePrice: expectedBasePrice,
      });
    }
  );
});
