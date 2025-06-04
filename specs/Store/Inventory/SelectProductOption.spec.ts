import {
  SelectProductOption,
  SelectProductOptionCommand,
} from "../../../src/Store/Inventory/Actions/SelectProductOption";
import { Product } from "../../../src/Store/Inventory/Core/Entities";
import {
  InMemoryInventory,
  ProductRepository,
} from "../../../src/Store/Inventory/Infrastructure/InMemoryInventory";
import { productsFixture } from "../../Fixtures/Inventory";

describe("SelectProductOption", () => {
  it("Should return error when product is not found", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new SelectProductOption(inventory);

    const { result, error } = action.execute(
      new SelectProductOptionCommand(100, 1)
    );

    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    expect(error).toMatchObject({ message: "Product not found" });
  });

  it("Should return error when selecting an option on a standard product", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new SelectProductOption(inventory);

    const { result, error } = action.execute(
      new SelectProductOptionCommand(1, 1)
    );

    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    expect(error).toMatchObject({ message: "Product is not customizable" });
  });

  it("Should return error when selecting unavailable options", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new SelectProductOption(inventory);

    const { result, error } = action.execute(
      new SelectProductOptionCommand(2, 100)
    );

    expect(result).toBeUndefined();
    expect(error).toBeDefined();
    expect(error).toMatchObject({ message: "Product option not found" });
  });

  it("should return the product with the selected option", () => {
    const products: Product[] = productsFixture();
    const inventory = new InMemoryInventory(new ProductRepository(products));
    const action = new SelectProductOption(inventory);

    const { result } = action.execute(new SelectProductOptionCommand(2, 1));

    expect(result).toMatchObject({
      id: 2,
      selectedOptions: expect.arrayContaining([
        expect.objectContaining({ id: 1 }),
      ]),
    });
  });

  it("should return the product with allowed parts", () => {});

  it("should return the product with the current total price calculated", () => {});

  it("should return the product marked as out of stock", () => {});

  it("should return the product with allowed parts marked as out of stock", () => {});
});
