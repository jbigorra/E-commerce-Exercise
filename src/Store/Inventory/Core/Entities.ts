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
  choices: ProductOptionChoice[];
  selected: boolean;
};

export type ProductOptionChoice = {
  id: number;
  optionId: number;
  priceAdjustment: number;
};

export class Product {
  private _options: ProductOption[];

  constructor(
    readonly id: number,
    readonly type: ProductType,
    readonly basePrice: number,
    options: ProductOption[]
  ) {
    this._options = options;
  }

  public get totalPrice(): number {
    return (
      this.basePrice +
      this._options.reduce((acc, option) => acc + option.price, 0)
    );
  }

  public get options(): ProductOption[] {
    return this._options;
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

    for (const optionId of optionIds) {
      const option = this._options.find((o) => o.id === optionId);

      if (!option) {
        return {
          error: new Error(`Product option with Id = ${optionId} not found`),
        };
      }

      option.selected = true;
    }

    return { error: undefined };
  }
}
