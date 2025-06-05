import {
  SelectProductOption,
  SelectProductOptionCommand,
} from "../../../src/Store/Inventory/Actions/SelectProductOption";
import {
  Product,
  ProductOption,
} from "../../../src/Store/Inventory/Core/Entities";
import {
  InMemoryInventory,
  ProductRepository,
} from "../../../src/Store/Inventory/Infrastructure/InMemoryInventory";
import { productsFixture } from "../../Fixtures/Inventory";
import { expectError, expectSuccess } from "../../Helpers/forActions/Matchers";

describe("SelectProductOption", () => {
  it("Should return error when product is not found", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new SelectProductOption(inventory);

    const actionResult = action.execute(new SelectProductOptionCommand(100, 1));

    expectError(actionResult, "Product not found");
  });

  it("Should return error when selecting an option on a standard product", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new SelectProductOption(inventory);

    const actionResult = action.execute(new SelectProductOptionCommand(1, 1));

    expectError(actionResult, "Product is not customizable");
  });

  it("Should return error when selecting unavailable options", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new SelectProductOption(inventory);

    const actionResult = action.execute(new SelectProductOptionCommand(2, 100));

    expectError(actionResult, "Product option not found");
  });

  it("should return the product with the selected option", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new SelectProductOption(inventory);

    const actionResult = action.execute(new SelectProductOptionCommand(2, 1));

    expectSuccess(actionResult, {
      id: 2,
      selectedOptions: (opts: ProductOption[]) => {
        expect(opts).toEqual(
          expect.arrayContaining([expect.objectContaining({ id: 1 })])
        );
        expect(opts).toHaveLength(1);
      },
    });
  });

  it("should return the product with available options reduced by 1 after selecting an option", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new SelectProductOption(inventory);

    const actionResult = action.execute(new SelectProductOptionCommand(2, 1));

    expectSuccess(actionResult, {
      id: 2,
      availableOptions: (opts: ProductOption[]) => {
        expect(opts).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: 2 }),
            expect.objectContaining({ id: 3 }),
          ])
        );
        expect(opts).toHaveLength(2);
      },
    });
  });

  it("should return the product with the current total price calculated", () => {});

  it("should return the product marked as out of stock", () => {});

  it("should return the product with allowed parts marked as out of stock", () => {});
});
