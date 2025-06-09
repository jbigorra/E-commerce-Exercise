import { Product } from "../Entities";
import { Result } from "../Result";
import { OptionId } from "../ValueObjects";

export class OptionSelectionService {
  selectOptions(product: Product, optionIds: OptionId[]): Result<void> {
    for (const optionId of optionIds) {
      const option = product.options.findById(optionId.value);

      if (!option) {
        return Result.error(
          new Error(`Product option with Id = ${optionId.value} not found`)
        );
      }

      option.selected = true;
    }

    return Result.success(undefined);
  }
}
