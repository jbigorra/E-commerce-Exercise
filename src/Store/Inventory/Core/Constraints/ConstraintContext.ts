import { ProductOptionChoice } from "../Entities";
import { OptionId } from "../ValueObjects";

export class ConstraintContext {
  constructor(
    public readonly optionChoices: ProductOptionChoice[],
    public readonly selectedOptionId: OptionId
  ) {}

  findChoiceById(choiceId: number): ProductOptionChoice | undefined {
    return this.optionChoices.find((oc) => oc.id === choiceId);
  }

  getChoicesForOption(optionId: number): ProductOptionChoice[] {
    return this.optionChoices.filter((oc) => oc.optionId === optionId);
  }
}
