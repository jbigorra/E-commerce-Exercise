type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Product = Prettify<
  {
    id: number;
    basePrice: number;
    availableOptions: ProductOption[];
  } & (StandardProduct | CustomizableProduct)
>;

export type StandardProduct = {
  type: "standard";
};

export type CustomizableProduct = {
  type: "customizable";
};

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
