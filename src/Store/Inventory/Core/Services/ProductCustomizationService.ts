import { ConstraintEngine } from "../Constraints/ConstraintEngine";
import { Product } from "../Entities";
import { Result } from "../Result";
import { SelectedOptions } from "../ValueObjects";
import { ChoiceSelectionService } from "./ChoiceSelectionService";

export interface ProductCustomizationService {
  customize(product: Product, options: SelectedOptions): Result<Product>;
}

export class DefaultProductCustomizationService implements ProductCustomizationService {
  constructor(
    private readonly choiceSelectionService: ChoiceSelectionService,
    private readonly productStrategy: ConstraintEngine
  ) {}

  customize(product: Product, options: SelectedOptions): Result<Product> {
    this.disableIncompatibleChoices(product, options);
    this.choiceSelectionService.selectChoices(product, options);

    return Result.success(product);
  }

  private disableIncompatibleChoices(product: Product, selectedOptions: SelectedOptions): void {
    product.partChoices.all
      .flatMap((oc) => oc.constraints)
      .filter((constraint) => constraint.type === "incompatible")
      .forEach((constraint) => {
        if (selectedOptions.choiceIds.includes(constraint.constrainedByChoiceId)) {
          const choice = product.partChoices.findById(constraint.optionChoiceId);

          if (choice) {
            choice.disabled = true;
          }
        }
      });
  }
}
