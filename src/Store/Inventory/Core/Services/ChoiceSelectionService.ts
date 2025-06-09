import { Product } from "../Entities";
import { Result } from "../Result";
import { ChoiceId, OptionId } from "../ValueObjects";

export class ChoiceSelectionService {
  selectChoices(
    product: Product,
    optionIds: OptionId[],
    choiceIds: ChoiceId[]
  ): Result<void> {
    for (const optionId of optionIds) {
      const choicesToSelect =
        product.optionChoices.findMatchingChoicesForOption(optionId, choiceIds);

      if (choicesToSelect.length > 1) {
        return Result.error(
          new Error("Only one option choice can be selected")
        );
      }

      if (choicesToSelect.length === 1) {
        const choice = choicesToSelect[0];

        if (choice.disabled) {
          return Result.error(
            new Error(
              `Choice with Id = ${choice.id} is disabled and cannot be selected`
            )
          );
        }

        choice.selected = true;
      }
    }

    return Result.success(undefined);
  }
}
