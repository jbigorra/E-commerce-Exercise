import { expect } from "@jest/globals";
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
  if (assertions?.totalPrice)
    assertions.totalPrice(result.result!.currentTotalPrice);
}

/**
 * Verify specific options are selected with clear business context
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
 * Verify specific choices are disabled due to constraints
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
 * Verify specific choices are selected
 */
export function expectSelectedChoices(
  product: Product,
  expectedChoiceIds: number[]
) {
  const selectedChoices = product.optionChoices.all.filter((c) => c.selected);
  const selectedIds = selectedChoices.map((c) => c.id);
  expect(selectedIds).toEqual(expect.arrayContaining(expectedChoiceIds));
  expect(selectedIds).toHaveLength(expectedChoiceIds.length);
}

/**
 * Verify exact total price with business context
 */
export function expectTotalPrice(product: Product, expectedPrice: number) {
  expect(product.currentTotalPrice).toBe(expectedPrice);
}

/**
 * Verify constraint behavior - that selecting certain options disables specific choices
 */
export function expectConstraintEffect(
  product: Product,
  expectedSelectedChoices: number[],
  expectedDisabledChoices: number[]
) {
  expectSelectedChoices(product, expectedSelectedChoices);
  expectDisabledChoices(product, expectedDisabledChoices);
}

/**
 * Comprehensive product state verification
 */
export interface ProductStateExpectation {
  selectedOptions?: number[];
  selectedChoices?: number[];
  disabledChoices?: number[];
  totalPrice?: number;
}

export function expectProductState(
  product: Product,
  expectation: ProductStateExpectation
) {
  if (expectation.selectedOptions) {
    expectSelectedOptions(product, expectation.selectedOptions);
  }

  if (expectation.selectedChoices) {
    expectSelectedChoices(product, expectation.selectedChoices);
  }

  if (expectation.disabledChoices) {
    expectDisabledChoices(product, expectation.disabledChoices);
  }

  if (expectation.totalPrice !== undefined) {
    expectTotalPrice(product, expectation.totalPrice);
  }
}
