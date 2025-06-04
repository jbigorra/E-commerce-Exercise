import { Product } from "../../src/Store/Inventory/Core/Entities";

export const productsFixture = (): Product[] => {
  const products: Product[] = [
    {
      id: 1,
      type: "standard",
      availableOptions: [],
      basePrice: 20,
    },
    {
      id: 2,
      type: "customizable",
      availableOptions: [
        {
          id: 1,
          price: 10,
        },
        {
          id: 2,
          price: 20,
        },
        {
          id: 3,
          price: 30,
        },
      ],
      basePrice: 20,
      selectedOptions: [],
    },
  ];

  return products;
};
