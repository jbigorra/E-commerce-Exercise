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

      expectError(
        actionResult,
        `Product option with Id = ${UNAVAILABLE_OPTION_ID} not found`
      );
    });
  });

  describe("Success", () => {
    let products: Product[];
    let inventory: IInventory;

    beforeEach(() => {
      products = productsFixture();
      inventory = new InMemoryInventory(new ProductRepository(products));
    });

    it("should return the product with 1 selected option", () => {
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(CUSTOMIZABLE_PRODUCT_ID, [OPTION_1_ID])
      );

      expectSuccess(actionResult, {
        id: CUSTOMIZABLE_PRODUCT_ID,
        options: (opts: ProductOption[]) => {
          expect(opts).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ id: OPTION_1_ID, selected: true }),
              expect.objectContaining({ id: OPTION_2_ID, selected: false }),
              expect.objectContaining({ id: OPTION_3_ID, selected: false }),
            ])
          );
        },
      });
    });

    it("should return the product with 2 selected options", () => {
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(CUSTOMIZABLE_PRODUCT_ID, [
          OPTION_1_ID,
          OPTION_2_ID,
        ])
      );

      expectSuccess(actionResult, {
        id: CUSTOMIZABLE_PRODUCT_ID,
        options: (opts: ProductOption[]) => {
          expect(opts).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ id: OPTION_1_ID, selected: true }),
              expect.objectContaining({ id: OPTION_2_ID, selected: true }),
              expect.objectContaining({ id: OPTION_3_ID, selected: false }),
            ])
          );
        },
      });
    });

    it("should return the product with 3 selected options", () => {
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
        options: (opts: ProductOption[]) => {
          expect(opts).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ id: OPTION_1_ID, selected: true }),
              expect.objectContaining({ id: OPTION_2_ID, selected: true }),
              expect.objectContaining({ id: OPTION_3_ID, selected: true }),
            ])
          );
        },
      });
    });

    describe("Total price calculations", () => {
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
    });
  });
});
