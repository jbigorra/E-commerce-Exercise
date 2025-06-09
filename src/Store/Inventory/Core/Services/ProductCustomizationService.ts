import { ConstraintContext } from "../Constraints/ConstraintContext";
import { ConstraintEngine } from "../Constraints/ConstraintEngine";
import { Product } from "../Entities";
import { Result } from "../Result";
import { OptionId, SelectedOptions } from "../ValueObjects";
import { ChoiceSelectionService } from "./ChoiceSelectionService";
import { OptionSelectionService } from "./OptionSelectionService";

export interface ProductCustomizationService {
  customize(product: Product, options: SelectedOptions): Result<Product>;
}

export class DefaultProductCustomizationService
  implements ProductCustomizationService
{
  constructor(
    private readonly optionSelectionService: OptionSelectionService,
    private readonly choiceSelectionService: ChoiceSelectionService,
    private readonly constraintEngine: ConstraintEngine
  ) {}

  customize(product: Product, options: SelectedOptions): Result<Product> {
    if (product.type === "standard") {
      return Result.error(new Error("Product is not customizable"));
    }

    if (options.optionIds.length === 0) {
      return Result.error(
        new Error(
          "At least one product option must be selected to customize the product"
        )
      );
    }

    return this.optionSelectionService
      .selectOptions(product, options.optionIds)
      .flatMap(() =>
        this.applyConstraintsForAllOptions(product, options.optionIds)
      )
      .flatMap(() =>
        this.choiceSelectionService.selectChoices(
          product,
          options.optionIds,
          options.choiceIds
        )
      )
      .map(() => product);
  }

  private applyConstraintsForAllOptions(
    product: Product,
    optionIds: OptionId[]
  ): Result<void> {
    for (const optionId of optionIds) {
      const constraints = product.optionChoices
        .flatMap((oc) => oc.constraints)
        .filter((constraint) => constraint.constrainedBy === optionId.value);

      if (constraints.length > 0) {
        const context = new ConstraintContext(product.optionChoices, optionId);
        const result = this.constraintEngine.applyConstraints(
          constraints,
          context
        );

        if (result.isError()) {
          return result;
        }
      }
    }

    return Result.success(undefined);
  }

  reset(product: Product): Result<Product> {
    return this.optionSelectionService
      .deselectAllOptions(product)
      .flatMap(() => this.choiceSelectionService.deselectAllChoices(product))
      .flatMap(() => this.resetConstraints(product))
      .map(() => product);
  }

  private resetConstraints(product: Product): Result<void> {
    product.optionChoices.forEach((choice) => {
      choice.disabled = false;
    });

    return Result.success(undefined);
  }
}
