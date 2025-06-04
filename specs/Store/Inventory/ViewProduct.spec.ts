import {
  ViewProduct,
  ViewProductCommand,
  ActionResult,
} from "../../../src/Store/Inventory/ViewProduct";
import { InMemoryInventory } from "../../../src/Store/Inventory/InMemoryInventory";
import { ProductRepository } from "../../../src/Store/Inventory/InMemoryInventory";
import { CustomizableProduct, Product, StandardProduct } from "../../../src/db";
import { productsFixture } from "../../Fixtures/Inventory";

type Matcher<T = unknown> = T | ((actual: T) => void);

export function expectSuccess<TResult>(
  obj: ActionResult<TResult>,
  expectedProps?: Record<string, Matcher>
): asserts obj is { result: TResult; error: undefined } {
  expect(obj.error).toBeUndefined();
  expect(obj.result).toBeDefined();

  if (expectedProps) {
    for (const [key, matcher] of Object.entries(expectedProps)) {
      const actual = (obj.result as TResult)[key as keyof TResult];
      expect(actual).toBeDefined();
      if (typeof matcher === "function") {
        matcher(actual);
      } else {
        expect(actual).toEqual(matcher);
      }
    }
  }
}

function expectError<TResult>(
  obj: ActionResult<TResult>,
  expectedMessage?: string
): asserts obj is { result: undefined; error: Error } {
  expect(obj.error).toBeDefined();
  expect(obj.error).toBeInstanceOf(Error);
  expect(obj.result).toBeUndefined();

  if (expectedMessage) {
    expect(obj.error!.message).toBe(expectedMessage);
  }
}

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

  it("should return the product marked as out of stock", () => {});
});
