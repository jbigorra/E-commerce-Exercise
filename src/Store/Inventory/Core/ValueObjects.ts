export class SelectedOptions {
  constructor(
    public readonly optionIds: number[],
    public readonly choiceIds: number[]
  ) {}

  hasOptions(): boolean {
    return this.optionIds.length > 0;
  }

  hasChoices(): boolean {
    return this.choiceIds.length > 0;
  }
}
