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

  public customizeWith(optionId: number): { error: Error | undefined } {
    const idx = this.availableOptions.findIndex((o) => o.id === optionId);

    if (idx === -1) {
      return {
        error: new Error("Product option not found"),
      };
    }

    const option = this.availableOptions.splice(idx, 1)[0];

    this.selectedOptions.push(option);

    return { error: undefined };
  }
}
