import {
  SelectProductOption,
  SelectProductOptionCommand,
} from "../../../../src/Store/Inventory/Actions/SelectProductOption";
import {
  Constraint,
  Product,
  ProductOption,
  ProductOptionChoice,
} from "../../../../src/Store/Inventory/Core/Entities";
import { IInventory } from "../../../../src/Store/Inventory/Interfaces";
import {
  expectError,
  expectSuccess,
} from "../../../Helpers/forActions/Matchers";

// Mock inventory interface for testing
class MockInventory implements IInventory {
  products: { findById: (id: number) => Product | undefined } = {
    findById: (id: number) => this.testProducts.find((p) => p.id === id),
  };

  private testProducts: Product[] = [];

  addProduct(product: Product): void {
    this.testProducts.push(product);
  }

  clear(): void {
    this.testProducts = [];
  }
}

describe("SelectProductOption Integration Tests", () => {
  let inventory: MockInventory;
  let selectProductOption: SelectProductOption;

  beforeEach(() => {
    inventory = new MockInventory();
    selectProductOption = new SelectProductOption(inventory);
  });

  afterEach(() => {
    inventory.clear();
  });

  it("should reject customization of standard products", () => {
    // Arrange
    const standardProduct = new Product(1, "standard", 100, [], []);
    inventory.addProduct(standardProduct);
    const command = new SelectProductOptionCommand(1, [1], []);

    // Act
    const result = selectProductOption.execute(command);

    // Assert
    expectError(result, "Product is not customizable");
  });

  it("should require at least one option to be selected", () => {
    // Arrange
    const customizableProduct = new Product(1, "customizable", 100, [], []);
    inventory.addProduct(customizableProduct);
    const command = new SelectProductOptionCommand(1, [], []);

    // Act
    const result = selectProductOption.execute(command);

    // Assert
    expectError(
      result,
      "At least one product option must be selected to customize the product"
    );
  });

  it("should handle invalid option IDs", () => {
    // Arrange
    const options: ProductOption[] = [{ id: 1, price: 10, selected: false }];
    const customizableProduct = new Product(
      1,
      "customizable",
      100,
      options,
      []
    );
    inventory.addProduct(customizableProduct);
    const command = new SelectProductOptionCommand(1, [999], []);

    // Act
    const result = selectProductOption.execute(command);

    // Assert
    expectError(result, "Product option with Id = 999 not found");
  });

  it("should successfully select valid options", () => {
    // Arrange
    const options: ProductOption[] = [
      { id: 1, price: 10, selected: false },
      { id: 2, price: 20, selected: false },
    ];
    const customizableProduct = new Product(
      1,
      "customizable",
      100,
      options,
      []
    );
    inventory.addProduct(customizableProduct);
    const command = new SelectProductOptionCommand(1, [1, 2], []);

    // Act
    const result = selectProductOption.execute(command);

    // Assert
    expectSuccess(result);
    expect(result.result).toBe(customizableProduct);
    expect(customizableProduct.options[0].selected).toBe(true);
    expect(customizableProduct.options[1].selected).toBe(true);
  });

  it("should handle option choices correctly", () => {
    // Arrange
    const options: ProductOption[] = [{ id: 1, price: 10, selected: false }];
    const optionChoices: ProductOptionChoice[] = [
      {
        id: 101,
        optionId: 1,
        priceAdjustment: 5,
        selected: false,
        disabled: false,
        constraints: [],
      },
    ];
    const customizableProduct = new Product(
      1,
      "customizable",
      100,
      options,
      optionChoices
    );
    inventory.addProduct(customizableProduct);
    const command = new SelectProductOptionCommand(1, [1], [101]);

    // Act
    const result = selectProductOption.execute(command);

    // Assert
    expectSuccess(result);
    expect(customizableProduct.options[0].selected).toBe(true);
    expect(customizableProduct.optionChoices[0].selected).toBe(true);
  });

  it("should reject multiple choices for same option", () => {
    // Arrange
    const options: ProductOption[] = [{ id: 1, price: 10, selected: false }];
    const optionChoices: ProductOptionChoice[] = [
      {
        id: 101,
        optionId: 1,
        priceAdjustment: 5,
        selected: false,
        disabled: false,
        constraints: [],
      },
      {
        id: 102,
        optionId: 1,
        priceAdjustment: 10,
        selected: false,
        disabled: false,
        constraints: [],
      },
    ];
    const customizableProduct = new Product(
      1,
      "customizable",
      100,
      options,
      optionChoices
    );
    inventory.addProduct(customizableProduct);
    const command = new SelectProductOptionCommand(1, [1], [101, 102]);

    // Act
    const result = selectProductOption.execute(command);

    // Assert
    expectError(result, "Only one option choice can be selected");
  });

  it("should apply incompatible constraints correctly", () => {
    // Arrange
    const options: ProductOption[] = [{ id: 1, price: 10, selected: false }];
    const constraints: Constraint[] = [
      {
        id: 1,
        optionChoiceId: 102,
        constrainedBy: 1,
        type: "incompatible",
      },
    ];
    const optionChoices: ProductOptionChoice[] = [
      {
        id: 101,
        optionId: 1,
        priceAdjustment: 5,
        selected: false,
        disabled: false,
        constraints: [],
      },
      {
        id: 102,
        optionId: 2,
        priceAdjustment: 10,
        selected: false,
        disabled: false,
        constraints: constraints,
      },
    ];
    const customizableProduct = new Product(
      1,
      "customizable",
      100,
      options,
      optionChoices
    );
    inventory.addProduct(customizableProduct);
    const command = new SelectProductOptionCommand(1, [1], []);

    // Act
    const result = selectProductOption.execute(command);

    // Assert
    expectSuccess(result);
    expect(customizableProduct.optionChoices[1].disabled).toBe(true);
  });

  it("should calculate total price correctly", () => {
    // Arrange
    const options: ProductOption[] = [
      { id: 1, price: 10, selected: false },
      { id: 2, price: 20, selected: false },
    ];
    const optionChoices: ProductOptionChoice[] = [
      {
        id: 101,
        optionId: 1,
        priceAdjustment: 5,
        selected: false,
        disabled: false,
        constraints: [],
      },
    ];
    const customizableProduct = new Product(
      1,
      "customizable",
      100,
      options,
      optionChoices
    );
    inventory.addProduct(customizableProduct);
    const command = new SelectProductOptionCommand(1, [1, 2], [101]);

    // Act
    const result = selectProductOption.execute(command);

    // Assert
    expectSuccess(result);
    expect(customizableProduct.totalPrice).toBe(135); // 100 + 10 + 20 + 5
  });

  it("should handle product not found", () => {
    // Arrange
    const command = new SelectProductOptionCommand(999, [1], []);

    // Act
    const result = selectProductOption.execute(command);

    // Assert
    expectError(result, "Product not found");
  });
});
