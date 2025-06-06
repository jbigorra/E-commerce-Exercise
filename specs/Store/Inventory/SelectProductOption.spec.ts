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
import { IInventory } from "../../../src/Store/Inventory/Interfaces";
import {
  CUSTOMIZABLE_PRODUCT_ID,
  EXPECTED_TOTAL_CUSTOMIZABLE_PRODUCT_PRICE,
  EXPECTED_TOTAL_STANDARD_PRODUCT_PRICE,
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
  describe("Errors", () => {
    let products: Product[];
    let inventory: IInventory;

    beforeEach(() => {
      products = productsFixture();
      inventory = new InMemoryInventory(new ProductRepository(products));
    });

    it("Should return error when product is not found", () => {
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(NOT_FOUND_PRODUCT_ID, [OPTION_1_ID])
      );

      expectError(actionResult, "Product not found");
    });

    it("Should return error when selecting an option on a standard product", () => {
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(STANDARD_PRODUCT_ID, [OPTION_1_ID])
      );

      expectError(actionResult, "Product is not customizable");
    });

    it("Should return error when selecting unavailable options", () => {
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(CUSTOMIZABLE_PRODUCT_ID, [
          UNAVAILABLE_OPTION_ID,
        ])
      );

      expectError(actionResult, "Product option not found");
    });
  });

  describe("Success", () => {
    let products: Product[];
    let inventory: IInventory;

    beforeEach(() => {
      products = productsFixture();
      inventory = new InMemoryInventory(new ProductRepository(products));
    });

    it("should return the product with the selected option", () => {
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(CUSTOMIZABLE_PRODUCT_ID, [OPTION_1_ID])
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

    it("should return the product with 2 available options after selecting 1", () => {
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(CUSTOMIZABLE_PRODUCT_ID, [OPTION_1_ID])
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

    it("should return the product with 0 available options after selecting 3", () => {
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(CUSTOMIZABLE_PRODUCT_ID, [
          OPTION_1_ID,
          OPTION_2_ID,
          OPTION_3_ID,
        ])
      );

      expectSuccess(actionResult, {
        id: CUSTOMIZABLE_PRODUCT_ID,
        availableOptions: (opts: ProductOption[]) => {
          expect(opts).toEqual([]);
          expect(opts).toHaveLength(0);
        },
      });
    });

    it("should return the product with the total price calculated", () => {
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(CUSTOMIZABLE_PRODUCT_ID, [
          OPTION_1_ID,
          OPTION_2_ID,
          OPTION_3_ID,
        ])
      );

      expectSuccess(actionResult, {
        id: CUSTOMIZABLE_PRODUCT_ID,
        totalPrice: (price: number) => {
          expect(price).toBe(EXPECTED_TOTAL_CUSTOMIZABLE_PRODUCT_PRICE);
        },
      });
    });

    it("should return the product with the total price equal to the base price when no options are selected", () => {
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(CUSTOMIZABLE_PRODUCT_ID, [])
      );

      expectSuccess(actionResult, {
        id: CUSTOMIZABLE_PRODUCT_ID,
        totalPrice: (price: number) => {
          expect(price).toBe(EXPECTED_TOTAL_STANDARD_PRODUCT_PRICE);
        },
      });
    });

    it("should return the product marked as out of stock", () => {});

    it("should return the product with allowed parts marked as out of stock", () => {});
  });
});
