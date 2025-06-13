type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type ProductType = "standard" | "customizable";

export type Inventory = {
  products: Product[];
  parts: Part[];
};

export type Part = {
  id: number;
  name: string;
  description: string;
  price: number;
};

export type PartChoice = {
  id: number;
  partId: number;
  priceAdjustment: number;
  outOfStock: boolean;
  selected: boolean;
  disabled: boolean;
  constraints: Constraint[];
};

export type Constraint = {
  id: number;
  type: "price" | "incompatible";
  optionChoiceId: number;
  constrainedByChoiceId: number;
};

export type PriceConstraint = Prettify<
  {
    type: "price";
    priceAdjustment: number;
  } & Constraint
>;

export type IncompatibleConstraint = Prettify<
  {
    type: "incompatible";
  } & Constraint
>;

export class Parts {
  constructor(private readonly _list: Part[]) {}

  public get length(): number {
    return this._list.length;
  }

  public get all(): Part[] {
    return this._list;
  }

  public findById(id: number): Part | undefined {
    return this._list.find((o) => o.id === id);
  }
}

export class PartChoices {
  constructor(private readonly _list: PartChoice[]) {}

  public get all(): PartChoice[] {
    return this._list;
  }

  public findById(choiceId: number): PartChoice | undefined {
    return this._list.find((c) => c.id === choiceId);
  }

  public findMatchingChoicesForOption(optionId: number, choiceIds: number[]): PartChoice[] {
    return this._list.filter((oc) => oc.partId === optionId).filter((oc) => choiceIds.some((id) => id === oc.id));
  }

  public findByOptionId(optionId: number): PartChoice[] {
    return this._list.filter((oc) => oc.partId === optionId);
  }

  public calculateTotalPriceAdjustment(): number {
    return this._list.filter((oc) => oc.selected).reduce((acc, oc) => acc + oc.priceAdjustment, 0);
  }

  public get selected(): PartChoice[] {
    return this._list.filter((oc) => oc.selected && !oc.disabled);
  }
}

export class Product {
  constructor(
    readonly id: number,
    readonly type: ProductType,
    readonly basePrice: number,
    readonly parts: Parts,
    readonly partChoices: PartChoices,
  ) {}

  public get currentTotalPrice(): number {
    return this.basePrice + this.partChoices.calculateTotalPriceAdjustment() + this.calculatePriceConstraints();
  }

  private calculatePriceConstraints(): number {
    const selected = this.partChoices.selected;
    const constraints = selected.flatMap((oc) => oc.constraints).filter((constraint) => constraint.type === "price");

    const sumByPriceConstraint = (sum: number, selectedChoice: PartChoice) => {
      const priceConstraints = constraints.filter(
        (constraint) => constraint.constrainedByChoiceId === selectedChoice.id,
      ) as PriceConstraint[];

      if (priceConstraints.length > 0) {
        priceConstraints.forEach((constraint) => {
          sum += constraint.priceAdjustment;
        });
      }

      return sum;
    };

    return selected.reduce(sumByPriceConstraint, 0);
  }

  public isNotCustomizable(): boolean {
    return this.type === "standard";
  }
}
