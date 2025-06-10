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

export type Constraint = Prettify<
  {
    id: number;
    optionChoiceId: number;
    constrainedBy: number;
  } & (PriceConstraint | IncompatibleConstraint)
>;

export type PriceConstraint = {
  type: "price";
  priceAdjustment: number;
};

export type IncompatibleConstraint = {
  type: "incompatible";
};

export class ProductOptions {
  constructor(private readonly _list: ProductOption[]) {}

  public get length(): number {
    return this._list.length;
  }

  public get all(): ProductOption[] {
    return this._list;
  }

  public selectedTotalPrice(): number {
    return this._list
      .filter((o) => o.selected)
      .reduce((acc, o) => acc + o.price, 0);
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

  public selectedChoicesTotalPriceAdjustment(): number {
    return this._list
      .filter((oc) => oc.selected)
      .reduce((acc, oc) => acc + oc.priceAdjustment, 0);
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
      this._options.selectedTotalPrice() +
      this._optionChoices.selectedChoicesTotalPriceAdjustment()
    );
  }

  public get options(): ProductOptions {
    return this._options;
  }

  public get optionChoices(): ProductOptionChoices {
    return this._optionChoices;
  }

  private _isNotCustomizable(): boolean {
    return this.type === "standard";
  }

  public isCustomizable(): boolean {
    return !this._isNotCustomizable();
  }
}
