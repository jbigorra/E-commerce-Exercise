import { ProductDTO } from "../../../src/Store/Inventory/Actions/Dtos";
import { ViewProduct, ViewProductCommand } from "../../../src/Store/Inventory/Actions/ViewProduct";
import { Parts, Product } from "../../../src/Store/Inventory/Core/Entities";
import { InMemoryInventory, ProductRepository } from "../../../src/Store/Inventory/Infrastructure/InMemoryInventory";
import { IInventory } from "../../../src/Store/Inventory/Interfaces";
import { ProductIds, TestScenarios } from "../../Fixtures/constants/ProductConstants";
import { BasicProductScenarios } from "../../Fixtures/scenarios/BasicProductScenarios";
import { expectError, expectSuccess } from "../../Helpers/forActions/Matchers";

describe("ViewProduct", () => {
  let products: Product[];
  let inventory: IInventory;

  beforeEach(() => {
    products = BasicProductScenarios.productsCollection();
    inventory = new InMemoryInventory(new ProductRepository(products));
  });

  describe("Errors", () => {
    it("should return an error if the product is not found", () => {
      const action = new ViewProduct(inventory);

      const actionResult = action.execute(new ViewProductCommand(TestScenarios.NOT_FOUND_PRODUCT));
      expectError(actionResult, "Product not found");
    });
  });

  describe("Success", () => {
    it("should return the standard product with empty available options", () => {
      const action = new ViewProduct(inventory);

      const actionResult = action.execute(new ViewProductCommand(ProductIds.STANDARD_PRODUCT));

      expectSuccess<ProductDTO>(actionResult, {
        id: ProductIds.STANDARD_PRODUCT,
        type: "standard",
        parts: (parts: Parts) => expect(parts.length).toEqual(0),
      });
    });

    it("should return the customizable product with available options", () => {
      const action = new ViewProduct(inventory);

      const actionResult = action.execute(new ViewProductCommand(ProductIds.CUSTOMIZABLE_PRODUCT));

      expectSuccess<ProductDTO>(actionResult, {
        id: ProductIds.CUSTOMIZABLE_PRODUCT,
        type: "customizable",
        parts: (parts: Parts) => expect(parts.length).toBeGreaterThanOrEqual(3),
      });
    });

    it.each([
      {
        id: ProductIds.STANDARD_PRODUCT,
        expectedType: "standard" as const,
        expectedBasePrice: 20,
      },
      {
        id: ProductIds.CUSTOMIZABLE_PRODUCT,
        expectedType: "customizable" as const,
        expectedBasePrice: 20,
      },
    ])("should return the product with the base price", ({ id, expectedType, expectedBasePrice }) => {
      const action = new ViewProduct(inventory);

      const actionResult = action.execute(new ViewProductCommand(id));

      expectSuccess<ProductDTO>(actionResult, {
        id,
        type: expectedType,
        basePrice: expectedBasePrice,
        currentTotalPrice: expectedBasePrice,
      });
    });
  });
});
