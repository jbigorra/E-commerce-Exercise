import { ProductOptionChoice } from "../Entities";

export class ConstraintContext {
  constructor(
    public readonly optionChoices: ProductOptionChoice[],
    public readonly selectedOptionId: number
  ) {}

  findChoiceById(choiceId: number): ProductOptionChoice | undefined {
    return this.optionChoices.find((oc) => oc.id === choiceId);
  }

  getChoicesForOption(optionId: number): ProductOptionChoice[] {
    return this.optionChoices.filter((oc) => oc.optionId === optionId);
  }
}
