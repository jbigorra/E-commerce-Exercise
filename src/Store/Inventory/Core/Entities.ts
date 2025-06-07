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

  public customizeWith(
    optionIds: number[],
    optionChoicesIds: number[]
  ): { error: Error | undefined } {
    if (this._isNotCustomizable()) {
      return {
        error: new Error("Product is not customizable"),
      };
    }

    if (optionIds.length === 0) {
      return {
        error: new Error(
          "At least one product option must be selected to customize the product"
        ),
      };
    }

    for (const optionId of optionIds) {
      const option = this._options.find((o) => o.id === optionId);

      if (!option) {
        return {
          error: new Error(`Product option with Id = ${optionId} not found`),
        };
      }

      option.selected = true;

      if (optionChoicesIds.length > 0) {
        for (const optionChoiceId of optionChoicesIds) {
          const optionChoice = this._optionChoices.find(
            (oc) => oc.id === optionChoiceId && oc.optionId === optionId
          );

          if (!optionChoice) {
            return {
              error: new Error(
                `Product option choice with Id = ${optionChoiceId} not found`
              ),
            };
          }

          optionChoice.selected = true;
        }
      }
    }

    return { error: undefined };
  }
}
