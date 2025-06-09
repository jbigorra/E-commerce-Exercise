export class OptionId {
  constructor(public readonly value: number) {
    if (value <= 0) throw new Error("OptionId must be positive");
  }

  equals(other: OptionId): boolean {
    return this.value === other.value;
  }
}

export class ChoiceId {
  constructor(public readonly value: number) {
    if (value <= 0) throw new Error("ChoiceId must be positive");
  }

  equals(other: ChoiceId): boolean {
    return this.value === other.value;
  }
}

export class ProductId {
  constructor(public readonly value: number) {
    if (value <= 0) throw new Error("ProductId must be positive");
  }

  equals(other: ProductId): boolean {
    return this.value === other.value;
  }
}

export class SelectedOptions {
  constructor(
    public readonly optionIds: OptionId[],
    public readonly choiceIds: ChoiceId[]
  ) {}

  hasOptions(): boolean {
    return this.optionIds.length > 0;
  }

  hasChoices(): boolean {
    return this.choiceIds.length > 0;
  }
}
