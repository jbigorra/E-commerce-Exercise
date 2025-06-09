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
      const choicesToSelect = product.optionChoices
        .filter((oc) => oc.optionId === optionId.value)
        .filter((oc) => choiceIds.some((id) => id.value === oc.id));

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

  deselectAllChoices(product: Product): Result<void> {
    product.optionChoices.forEach((choice) => {
      choice.selected = false;
    });

    return Result.success(undefined);
  }

  getSelectedChoices(product: Product): ChoiceId[] {
    return product.optionChoices
      .filter((choice) => choice.selected)
      .map((choice) => new ChoiceId(choice.id));
  }

  getChoicesForOption(product: Product, optionId: OptionId): ChoiceId[] {
    return product.optionChoices
      .filter((choice) => choice.optionId === optionId.value)
      .map((choice) => new ChoiceId(choice.id));
  }
}
