import { ActionResult } from "../../../../../../src/Store/Inventory/Actions/Action";
import {
  Product,
  ProductOptionChoices,
  ProductOptions,
} from "../../../../../../src/Store/Inventory/Core/Entities";
import { expectSuccess } from "../../../../../Helpers/forActions/Matchers";

/**
 * Enhanced expectation for successful product operations with optional detailed assertions
 */
export function expectProductSuccess(
  result: ActionResult<Product>,
  productId: number,
  assertions?: {
    options?: (opts: ProductOptions) => void;
    optionChoices?: (choices: ProductOptionChoices) => void;
    totalPrice?: (price: number) => void;
  }
) {
  expectSuccess(result);
  expect(result.result!.id).toBe(productId);

  if (assertions?.options) assertions.options(result.result!.options);
  if (assertions?.optionChoices)
    assertions.optionChoices(result.result!.optionChoices);
  if (assertions?.totalPrice) assertions.totalPrice(result.result!.totalPrice);
}

/**
 * Verify specific options are selected
 */
export function expectSelectedOptions(
  product: Product,
  expectedOptionIds: number[]
) {
  const selectedOptions = product.options.all.filter((o) => o.selected);
  const selectedIds = selectedOptions.map((o) => o.id);
  expect(selectedIds).toEqual(expect.arrayContaining(expectedOptionIds));
  expect(selectedIds).toHaveLength(expectedOptionIds.length);
}

/**
 * Verify specific choices are disabled
 */
export function expectDisabledChoices(
  product: Product,
  expectedChoiceIds: number[]
) {
  const disabledChoices = product.optionChoices.all.filter((c) => c.disabled);
  const disabledIds = disabledChoices.map((c) => c.id);
  expect(disabledIds).toEqual(expect.arrayContaining(expectedChoiceIds));
}

/**
 * Verify exact total price
 */
export function expectTotalPrice(product: Product, expectedPrice: number) {
  expect(product.totalPrice).toBe(expectedPrice);
}
