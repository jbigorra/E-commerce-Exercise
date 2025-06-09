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

export class Product {
  private _options: ProductOption[];
  private _optionChoices: ProductOptionChoice[];

  constructor(
    readonly id: number,
    readonly type: ProductType,
    readonly basePrice: number,
    options: ProductOption[],
    optionChoices: ProductOptionChoice[]
  ) {
    this._options = options;
    this._optionChoices = optionChoices;
  }

  public get totalPrice(): number {
    const selectedOptionsTotalPrice = this._options
      .filter((o) => o.selected)
      .reduce((acc, o) => acc + o.price, 0);

    const selectedOptionChoicesTotalPrice = this._optionChoices
      .filter((oc) => oc.selected)
      .reduce((acc, oc) => acc + oc.priceAdjustment, 0);

    return (
      this.basePrice +
      selectedOptionsTotalPrice +
      selectedOptionChoicesTotalPrice
    );
  }

  public get options(): ProductOption[] {
    return this._options;
  }

  public get optionChoices(): ProductOptionChoice[] {
    return this._optionChoices;
  }

  private _isNotCustomizable(): boolean {
    return this.type === "standard";
  }

  public isCustomizable(): boolean {
    return !this._isNotCustomizable();
  }
}
