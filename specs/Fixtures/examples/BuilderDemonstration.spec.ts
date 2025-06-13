import {
  createSelectAction,
  createTestInventory,
} from "../../../specs/Store/Inventory/Actions/SelectProductOption/shared/test-setup";
import { SelectProductOptionCommand } from "../../../src/Store/Inventory/Actions/SelectProductOption";
import { expectError, expectSuccess } from "../../Helpers/forActions/Matchers";
import { ConstraintBuilder } from "../builders/ConstraintBuilder";
import { ProductBuilder } from "../builders/ProductBuilder";
import { ProductOptionBuilder } from "../builders/ProductOptionBuilder";
import { ProductOptionChoiceBuilder } from "../builders/ProductOptionChoiceBuilder";
import {
  ChoiceIds,
  OptionIds,
  Prices,
  ProductIds,
} from "../constants/ProductConstants";
import { BasicProductScenarios } from "../scenarios/BasicProductScenarios";

describe("Builder Pattern Demonstration", () => {
  /**
   * This file demonstrates the new builder pattern approach for test data creation.
   * It shows how builders provide better readability, maintainability, and flexibility
   * compared to the old god object fixture approach.
   */

  it("demonstrates basic product creation with builders", () => {
    // Arrange - Create products using builder pattern
    const standardProduct = new ProductBuilder()
      .withId(ProductIds.STANDARD_PRODUCT)
      .asStandard()
      .withBasePrice(Prices.BASE_PRODUCT)
      .build();

    const customizableProduct = new ProductBuilder()
      .withId(ProductIds.CUSTOMIZABLE_PRODUCT)
      .asCustomizable()
      .withBasePrice(Prices.BASE_PRODUCT)
      .withOption(
        new ProductOptionBuilder()
          .withId(OptionIds.FRAME_TYPE)
          .withPrice(Prices.BASIC_OPTION_PRICE)
          .build()
      )
      .build();

    const inventory = createTestInventory([
      standardProduct,
      customizableProduct,
    ]);
    const action = createSelectAction(inventory);

    // Act
    const result = action.execute(
      new SelectProductOptionCommand(
        ProductIds.CUSTOMIZABLE_PRODUCT,
        [OptionIds.FRAME_TYPE],
        []
      )
    );

    // Assert
    expectSuccess(result);
    expect(result.result!.totalPrice).toBe(
      Prices.BASE_PRODUCT + Prices.BASIC_OPTION_PRICE
    );
  });

  it("demonstrates complex constraint scenario with builders", () => {
    // Arrange - Create incompatible constraint scenario
    const incompatibleConstraint = new ConstraintBuilder()
      .withId(1)
      .forChoice(ChoiceIds.RED_RIM)
      .constrainedByChoice(OptionIds.WHEELS)
      .asIncompatible()
      .build();

    const product = new ProductBuilder()
      .withId(ProductIds.CUSTOMIZABLE_PRODUCT)
      .asCustomizable()
      .withBasePrice(Prices.BASE_PRODUCT)
      .withOption(
        new ProductOptionBuilder()
          .withId(OptionIds.WHEELS)
          .withPrice(Prices.WHEELS)
          .build()
      )
      .withOption(
        new ProductOptionBuilder()
          .withId(OptionIds.RIM_COLOR)
          .withPrice(Prices.RIM_COLOR)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(ChoiceIds.FAT_BIKE_WHEELS)
          .forOption(OptionIds.WHEELS)
          .withPriceAdjustment(20)
          .build()
      )
      .withOptionChoice(
        new ProductOptionChoiceBuilder()
          .withId(ChoiceIds.RED_RIM)
          .forOption(OptionIds.RIM_COLOR)
          .withPriceAdjustment(0)
          .withConstraint(incompatibleConstraint)
          .build()
      )
      .build();

    const inventory = createTestInventory([product]);
    const action = createSelectAction(inventory);

    // Act - Select wheels that should disable red rim
    const result = action.execute(
      new SelectProductOptionCommand(
        ProductIds.CUSTOMIZABLE_PRODUCT,
        [OptionIds.WHEELS],
        [ChoiceIds.FAT_BIKE_WHEELS]
      )
    );

    // Assert
    expectSuccess(result);
    const redRimChoice = result.result!.optionChoices.findById(
      ChoiceIds.RED_RIM
    );
    expect(redRimChoice?.disabled).toBe(true);
  });

  it("demonstrates scenario factory usage", () => {
    // Arrange - Use pre-built scenarios for common cases
    const products = BasicProductScenarios.productsCollection();
    const inventory = createTestInventory(products);
    const action = createSelectAction(inventory);

    // Act
    const result = action.execute(
      new SelectProductOptionCommand(
        ProductIds.STANDARD_PRODUCT,
        [OptionIds.FRAME_TYPE],
        []
      )
    );

    // Assert
    expectError(result, "Product is not customizable");
  });

  it("demonstrates test data locality - each test defines its own data", () => {
    // Arrange - Local test data, no external dependencies
    const LocalTestData = {
      PRODUCT_ID: 99,
      OPTION_ID: 88,
      BASE_PRICE: 100,
      OPTION_PRICE: 50,
    };

    const product = new ProductBuilder()
      .withId(LocalTestData.PRODUCT_ID)
      .asCustomizable()
      .withBasePrice(LocalTestData.BASE_PRICE)
      .withOption(
        new ProductOptionBuilder()
          .withId(LocalTestData.OPTION_ID)
          .withPrice(LocalTestData.OPTION_PRICE)
          .build()
      )
      .build();

    const inventory = createTestInventory([product]);
    const action = createSelectAction(inventory);

    // Act
    const result = action.execute(
      new SelectProductOptionCommand(
        LocalTestData.PRODUCT_ID,
        [LocalTestData.OPTION_ID],
        []
      )
    );

    // Assert
    expectSuccess(result);
    expect(result.result!.totalPrice).toBe(
      LocalTestData.BASE_PRICE + LocalTestData.OPTION_PRICE
    );
  });
});
