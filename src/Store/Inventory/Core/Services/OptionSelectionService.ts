import { Product } from "../Entities";
import { Result } from "../Result";
import { OptionId } from "../ValueObjects";

export class OptionSelectionService {
  selectOptions(product: Product, optionIds: OptionId[]): Result<void> {
    for (const optionId of optionIds) {
      const option = product.options.find((o) => o.id === optionId.value);

      if (!option) {
        return Result.error(
          new Error(`Product option with Id = ${optionId.value} not found`)
        );
      }

      option.selected = true;
    }

    return Result.success(undefined);
  }

  deselectAllOptions(product: Product): Result<void> {
    product.options.forEach((option) => {
      option.selected = false;
    });

    return Result.success(undefined);
  }

  getSelectedOptions(product: Product): OptionId[] {
    return product.options
      .filter((option) => option.selected)
      .map((option) => new OptionId(option.id));
  }
}
