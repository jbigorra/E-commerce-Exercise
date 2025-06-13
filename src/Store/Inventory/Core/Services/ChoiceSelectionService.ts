import { Product } from "../Entities";
import { Result } from "../Result";
import { SelectedOptions } from "../ValueObjects";

export class ChoiceSelectionService {
  selectChoices(product: Product, selectedOptions: SelectedOptions): Result<void> {
    for (const optionId of selectedOptions.partIds) {
      const choicesToSelect = product.partChoices.findMatchingChoicesForOption(optionId, selectedOptions.choiceIds);

      if (choicesToSelect.length > 1) {
        return Result.error(new Error("Only one option choice can be selected"));
      }

      if (choicesToSelect.length === 1) {
        const choice = choicesToSelect[0];

        if (choice.disabled) {
          return Result.error(new Error(`Choice with Id = ${choice.id} is disabled and cannot be selected`));
        }

        choice.selected = true;
      }
    }

    return Result.success(undefined);
  }
}
