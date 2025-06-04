import { Product } from "../../src/db";

export const productsFixture = (): Product[] => {
  const products: Product[] = [
    {
      id: 1,
      type: "standard",
      options: [],
    },
    {
      id: 2,
      type: "customizable",
      options: [
        {
          id: 1,
        },
        {
          id: 2,
        },
        {
          id: 3,
        },
      ],
    },
  ];

  return products;
};