import { ServiceFactory } from "../Core/Services/ServiceFactory";
import { SelectedOptions } from "../Core/ValueObjects";
import { IInventory } from "../Interfaces";
import { ActionResult, Application } from "./Action";
import { ProductDTO } from "./Dtos";

export class SelectProductOptionCommand {
  constructor(
    readonly productId: number,
    readonly optionIds: number[] = [],
    readonly optionChoicesIds: number[] = [],
  ) {}
}

export class SelectProductOption {
  private readonly customizationService = ServiceFactory.createProductCustomizationService();

  constructor(private readonly inventory: IInventory) {}

  public execute(command: SelectProductOptionCommand): ActionResult<ProductDTO> {
    try {
      const product = this.inventory.products.findById(command.productId);

      if (!product) return Application.error(new Error("Product not found"));

      if (product.isNotCustomizable()) {
        return Application.error(new Error("Product is not customizable"));
      }

      const selectedOptions = new SelectedOptions(command.optionIds, command.optionChoicesIds);

      const result = this.customizationService.customize(product, selectedOptions);

      if (result.isError()) {
        return Application.error(result.getError());
      }

      return Application.success(ProductDTO.from(product));
    } catch (error: any) {
      return Application.error(error);
    }
  }
}
