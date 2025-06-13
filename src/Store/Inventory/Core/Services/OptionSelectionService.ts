import { Product } from "../Entities";
import { Result } from "../Result";

export class OptionSelectionService {
  selectOptions(product: Product, optionIds: number[]): Result<void> {
    for (const optionId of optionIds) {
      const option = product.options.findById(optionId);

      if (!option) {
        return Result.error(
          new Error(`Product option with Id = ${optionId} not found`)
        );
      }

      option.selected = true;
    }

    return Result.success(undefined);
  }
}
