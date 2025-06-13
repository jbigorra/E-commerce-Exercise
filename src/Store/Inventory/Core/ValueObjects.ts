export class SelectedOptions {
  constructor(
    public readonly partIds: number[],
    public readonly choiceIds: number[]
  ) {
    if (this.hasParts() === false) {
      throw new Error(
        "At least one product part must be selected to customize the product"
      );
    }

    if (this.hasChoices() === false) {
      throw new Error(
        "At least one product part choice must be selected to customize the product"
      );
    }

    if (this.hasIncompatibleChoices()) {
      throw new Error("Only one part choice can be selected per part");
    }
  }

  hasParts(): boolean {
    return this.partIds.length > 0;
  }

  hasChoices(): boolean {
    return this.choiceIds.length > 0;
  }

  hasIncompatibleChoices(): boolean {
    let countRepeatedChoices = this.choiceIds.reduce((acc, choiceId) => {
      if (this.choiceIds.filter((id) => id === choiceId).length > 1) {
        acc++;
      }
      return acc;
    }, 0);

    return countRepeatedChoices > 0;
  }
}
