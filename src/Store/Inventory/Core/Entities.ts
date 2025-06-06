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
};

export class Product {
  private _availableOptions: ProductOption[];
  private _selectedOptions: ProductOption[];

  constructor(
    readonly id: number,
    readonly type: ProductType,
    readonly basePrice: number,
    availableOptions: ProductOption[],
    selectedOptions: ProductOption[]
  ) {
    this._availableOptions = availableOptions;
    this._selectedOptions = selectedOptions;
  }

  public get totalPrice(): number {
    return (
      this.basePrice +
      this._selectedOptions.reduce((acc, option) => acc + option.price, 0)
    );
  }

  public get availableOptions(): ProductOption[] {
    return this._availableOptions;
  }

  public get selectedOptions(): ProductOption[] {
    return this._selectedOptions;
  }

  private _isNotCustomizable(): boolean {
    return this.type === "standard";
  }

  public customizeWith(optionIds: number[]): { error: Error | undefined } {
    if (this._isNotCustomizable()) {
      return {
        error: new Error("Product is not customizable"),
      };
    }

    const validOptions: ProductOption[] = [];
    for (const optionId of optionIds) {
      const optionIdx = this._availableOptions.findIndex(
        (o) => o.id === optionId
      );

      if (optionIdx === -1) {
        return {
          error: new Error("Product option not found"),
        };
      }

      validOptions.push(this._availableOptions[optionIdx]);
    }

    validOptions.forEach((vo) => {
      this._availableOptions = this._availableOptions.filter(
        (op) => op.id !== vo.id
      );
      this._selectedOptions = [...this._selectedOptions, vo];
    });

    return { error: undefined };
  }
}
