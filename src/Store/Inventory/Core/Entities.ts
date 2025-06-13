type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type ProductType = "standard" | "customizable";

export type Part = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
};

export type Inventory = {
  products: Product[];
  parts: Part[];
};

export type ProductOption = {
  id: number;
  price: number;
  selected: boolean;
};

export type ProductOptionChoice = {
  id: number;
  optionId: number;
  priceAdjustment: number;
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

export class ProductOptions {
  constructor(private readonly _list: ProductOption[]) {}

  public get length(): number {
    return this._list.length;
  }

  public get all(): ProductOption[] {
    return this._list;
  }

  public calculateTotalBasePrice(): number {
    return this._list.reduce((acc, o) => acc + o.price, 0);
  }

  public findById(id: number): ProductOption | undefined {
    return this._list.find((o) => o.id === id);
  }
}

export class ProductOptionChoices {
  constructor(private readonly _list: ProductOptionChoice[]) {}

  public get all(): ProductOptionChoice[] {
    return this._list;
  }

  public findById(choiceId: number): ProductOptionChoice | undefined {
    return this._list.find((c) => c.id === choiceId);
  }

  public findMatchingChoicesForOption(
    optionId: number,
    choiceIds: number[]
  ): ProductOptionChoice[] {
    return this._list
      .filter((oc) => oc.optionId === optionId)
      .filter((oc) => choiceIds.some((id) => id === oc.id));
  }

  public findByOptionId(optionId: number): ProductOptionChoice[] {
    return this._list.filter((oc) => oc.optionId === optionId);
  }

  public calculateTotalPriceAdjustment(): number {
    return this._list
      .filter((oc) => oc.selected)
      .reduce((acc, oc) => acc + oc.priceAdjustment, 0);
  }

  public get selected(): ProductOptionChoice[] {
    return this._list.filter((oc) => oc.selected && !oc.disabled);
  }
}

export class Product {
  private _options: ProductOptions;
  private _optionChoices: ProductOptionChoices;

  constructor(
    readonly id: number,
    readonly type: ProductType,
    readonly basePrice: number,
    options: ProductOptions,
    optionChoices: ProductOptionChoices
  ) {
    this._options = options;
    this._optionChoices = optionChoices;
  }

  public get totalPrice(): number {
    return (
      this.basePrice +
      this._options.calculateTotalBasePrice() +
      this._optionChoices.calculateTotalPriceAdjustment() +
      this.calculatePriceConstraints()
    );
  }

  public get options(): ProductOptions {
    return this._options;
  }

  public get optionChoices(): ProductOptionChoices {
    return this._optionChoices;
  }

  private calculatePriceConstraints(): number {
    const selected = this._optionChoices.selected;
    const constraints = selected
      .flatMap((oc) => oc.constraints)
      .filter((constraint) => constraint.type === "price");

    const sumByPriceConstraint = (
      sum: number,
      selectedChoice: ProductOptionChoice
    ) => {
      const priceConstraints = constraints.filter(
        (constraint) => constraint.constrainedByChoiceId === selectedChoice.id
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
