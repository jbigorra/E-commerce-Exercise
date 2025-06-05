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
import {
  CUSTOMIZABLE_PRODUCT_ID,
  NOT_FOUND_PRODUCT_ID,
  OPTION_1_ID,
  OPTION_2_ID,
  OPTION_3_ID,
  productsFixture,
  STANDARD_PRODUCT_ID,
  UNAVAILABLE_OPTION_ID,
} from "../../Fixtures/Inventory";
import { expectError, expectSuccess } from "../../Helpers/forActions/Matchers";

describe("SelectProductOption", () => {
  it("Should return error when product is not found", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new SelectProductOption(inventory);

    const actionResult = action.execute(
      new SelectProductOptionCommand(NOT_FOUND_PRODUCT_ID, 1)
    );

    expectError(actionResult, "Product not found");
  });

  it("Should return error when selecting an option on a standard product", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new SelectProductOption(inventory);

    const actionResult = action.execute(
      new SelectProductOptionCommand(STANDARD_PRODUCT_ID, 1)
    );

    expectError(actionResult, "Product is not customizable");
  });

  it("Should return error when selecting unavailable options", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new SelectProductOption(inventory);

    const actionResult = action.execute(
      new SelectProductOptionCommand(
        CUSTOMIZABLE_PRODUCT_ID,
        UNAVAILABLE_OPTION_ID
      )
    );

    expectError(actionResult, "Product option not found");
  });

  it("should return the product with the selected option", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new SelectProductOption(inventory);

    const actionResult = action.execute(
      new SelectProductOptionCommand(CUSTOMIZABLE_PRODUCT_ID, OPTION_1_ID)
    );

    expectSuccess(actionResult, {
      id: CUSTOMIZABLE_PRODUCT_ID,
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

    const actionResult = action.execute(
      new SelectProductOptionCommand(CUSTOMIZABLE_PRODUCT_ID, OPTION_1_ID)
    );

    expectSuccess(actionResult, {
      id: CUSTOMIZABLE_PRODUCT_ID,
      availableOptions: (opts: ProductOption[]) => {
        expect(opts).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: OPTION_2_ID }),
            expect.objectContaining({ id: OPTION_3_ID }),
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
