import { PartChoice } from "../Entities";

export class ConstraintContext {
  constructor(public readonly optionChoices: PartChoice[], public readonly selectedOptionId: number) {}

  findChoiceById(choiceId: number): PartChoice | undefined {
    return this.optionChoices.find((oc) => oc.id === choiceId);
  }

  getChoicesForOption(optionId: number): PartChoice[] {
    return this.optionChoices.filter((oc) => oc.partId === optionId);
  }
}
