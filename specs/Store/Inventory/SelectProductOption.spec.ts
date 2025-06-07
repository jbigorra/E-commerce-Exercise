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
  NOT_FOUND_PRODUCT_ID,
  OPTION_1_ID,
  OPTION_2_ID,
  OPTION_3_ID,
  productsFixture,
  productsWithOptionChoicesFixture,
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
        new SelectProductOptionCommand(NOT_FOUND_PRODUCT_ID, [OPTION_1_ID], [])
      );

      expectError(actionResult, "Product not found");
    });

    it("Should return error when selecting an option on a standard product", () => {
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(STANDARD_PRODUCT_ID, [OPTION_1_ID], [])
      );

      expectError(actionResult, "Product is not customizable");
    });

    it("Should return error when selecting unavailable options", () => {
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(
          CUSTOMIZABLE_PRODUCT_ID,
          [UNAVAILABLE_OPTION_ID],
          []
        )
      );

      expectError(
        actionResult,
        `Product option with Id = ${UNAVAILABLE_OPTION_ID} not found`
      );
    });

    it("Should return error when no options are selected", () => {
      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(CUSTOMIZABLE_PRODUCT_ID, [], [])
      );

      expectError(
        actionResult,
        "At least one product option must be selected to customize the product"
      );
    });

    it("Should return error when selecting more than one option choice for the same option", () => {
      const products = productsWithOptionChoicesFixture();
      const inventory = new InMemoryInventory(new ProductRepository(products));

      const action = new SelectProductOption(inventory);

      const actionResult = action.execute(
        new SelectProductOptionCommand(
          CUSTOMIZABLE_PRODUCT_ID,
          [OPTION_1_ID],
          [1, 2]
        )
      );

      expectError(actionResult, "Only one option choice can be selected");
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
        new SelectProductOptionCommand(
          CUSTOMIZABLE_PRODUCT_ID,
          [OPTION_1_ID],
          []
        )
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
        new SelectProductOptionCommand(
          CUSTOMIZABLE_PRODUCT_ID,
          [OPTION_1_ID, OPTION_2_ID],
          []
        )
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
        new SelectProductOptionCommand(
          CUSTOMIZABLE_PRODUCT_ID,
          [OPTION_1_ID, OPTION_2_ID, OPTION_3_ID],
          []
        )
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
          new SelectProductOptionCommand(
            CUSTOMIZABLE_PRODUCT_ID,
            [OPTION_1_ID, OPTION_2_ID, OPTION_3_ID],
            []
          )
        );

        expectSuccess(actionResult, {
          id: CUSTOMIZABLE_PRODUCT_ID,
          totalPrice: (price: number) => {
            expect(price).toBe(EXPECTED_TOTAL_CUSTOMIZABLE_PRODUCT_PRICE);
          },
        });
      });
    });

    describe("Price adjustments based on option choices", () => {
      beforeEach(() => {
        products = productsWithOptionChoicesFixture();
        inventory = new InMemoryInventory(new ProductRepository(products));
      });

      it("should return the product total price considering the option choices selected", () => {
        const action = new SelectProductOption(inventory);

        const actionResult = action.execute(
          new SelectProductOptionCommand(
            CUSTOMIZABLE_PRODUCT_ID,
            [OPTION_1_ID],
            [1]
          )
        );

        const productBasePrice = 20;
        const option1Price = 10;
        const option1Choice1PriceAdjustment = 10;
        const expectedPrice =
          productBasePrice + option1Price + option1Choice1PriceAdjustment;
        expectSuccess(actionResult, {
          id: CUSTOMIZABLE_PRODUCT_ID,
          totalPrice: (price: number) => {
            expect(price).toBe(expectedPrice);
          },
        });
      });
    });
  });
});
