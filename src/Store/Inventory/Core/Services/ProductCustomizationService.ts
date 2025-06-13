import { ConstraintContext } from "../Constraints/ConstraintContext";
import { ConstraintEngine } from "../Constraints/ConstraintEngine";
import { Product } from "../Entities";
import { Result } from "../Result";
import { SelectedOptions } from "../ValueObjects";
import { ChoiceSelectionService } from "./ChoiceSelectionService";

export interface ProductCustomizationService {
  customize(product: Product, options: SelectedOptions): Result<Product>;
}

export class DefaultProductCustomizationService
  implements ProductCustomizationService
{
  constructor(
    private readonly choiceSelectionService: ChoiceSelectionService,
    private readonly constraintEngine: ConstraintEngine
  ) {}

  customize(product: Product, options: SelectedOptions): Result<Product> {
    this.disableIncompatibleChoices(product, options);
    this.choiceSelectionService.selectChoices(product, options);

    return Result.success(product);
  }

  private disableIncompatibleChoices(
    product: Product,
    selectedOptions: SelectedOptions
  ): void {
    product.optionChoices.all
      .flatMap((oc) => oc.constraints)
      .filter((constraint) => constraint.type === "incompatible")
      .forEach((constraint) => {
        if (
          selectedOptions.choiceIds.includes(constraint.constrainedByChoiceId)
        ) {
          const choice = product.optionChoices.findById(
            constraint.optionChoiceId
          );

          if (choice) {
            choice.disabled = true;
          }
        }
      });
  }

  private applyConstraintsForAllOptions(
    product: Product,
    optionIds: number[]
  ): Result<void> {
    for (const optionId of optionIds) {
      const constraints = product.optionChoices.all
        .flatMap((oc) => oc.constraints)
        .filter((constraint) => constraint.constrainedByChoiceId === optionId);

      if (constraints.length > 0) {
        const context = new ConstraintContext(
          product.optionChoices.all,
          optionId
        );
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
}
