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
  constructor(
    readonly id: number,
    readonly type: ProductType,
    readonly basePrice: number,
    readonly availableOptions: ProductOption[],
    readonly selectedOptions: ProductOption[]
  ) {}

  public get totalPrice(): number {
    return (
      this.basePrice +
      this.selectedOptions.reduce((acc, option) => acc + option.price, 0)
    );
  }

  public isNotCustomizable(): boolean {
    return this.type === "standard";
  }

  public customizeWith(optionIds: number[]): { error: Error | undefined } {
    // if (this._selectedOptionsNotValid(optionIds)) {
    //   return {
    //     error: new Error("Selected options are not valid"),
    //   };
    // }

    for (const optionId of optionIds) {
      const optionIdx = this.availableOptions.findIndex(
        (o) => o.id === optionId
      );

      if (optionIdx === -1) {
        return {
          error: new Error("Product option not found"),
        };
      }

      this.selectedOptions.push(this.availableOptions[optionIdx]);
      this.availableOptions.splice(optionIdx, 1);
    }

    return { error: undefined };
  }

  private _selectedOptionsNotValid(optionIds: number[]): boolean {
    return optionIds.some(
      (id) => !this.availableOptions.some((o) => o.id === id)
    );
  }
}
