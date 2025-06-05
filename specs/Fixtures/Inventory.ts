import { Product } from "../../src/Store/Inventory/Core/Entities";

export const NOT_FOUND_PRODUCT_ID = 100;
export const UNAVAILABLE_OPTION_ID = 100;
export const STANDARD_PRODUCT_ID = 1;
export const CUSTOMIZABLE_PRODUCT_ID = 2;
export const OPTION_1_ID = 1;
export const OPTION_2_ID = 2;
export const OPTION_3_ID = 3;

export const productsFixture = (): Product[] => {
  const products: Product[] = [
    createStandardProduct(),
    createCustomizableProduct({
      availableOptions: [
        {
          id: OPTION_1_ID,
          price: 10,
        },
        {
          id: OPTION_2_ID,
          price: 20,
        },
        {
          id: OPTION_3_ID,
          price: 30,
        },
      ],
      basePrice: 20,
      selectedOptions: [],
    }),
  ];

  return products;
};

const createStandardProduct = (
  obj: Partial<Omit<Product, "availableOptions" | "selectedOptions">> = {}
): Product => {
  const defaults = {
    id: STANDARD_PRODUCT_ID,
    type: "standard" as const,
    basePrice: 20,
    availableOptions: [],
    selectedOptions: [],
  };

  return new Product(
    obj.id ?? defaults.id,
    obj.type ?? defaults.type,
    obj.basePrice ?? defaults.basePrice,
    defaults.availableOptions,
    defaults.selectedOptions
  );
};

const createCustomizableProduct = (obj: Partial<Product> = {}): Product => {
  const defaults = {
    id: CUSTOMIZABLE_PRODUCT_ID,
    type: "customizable" as const,
    basePrice: 20,
    availableOptions: [],
    selectedOptions: [],
  };

  return new Product(
    obj.id ?? defaults.id,
    obj.type ?? defaults.type,
    obj.basePrice ?? defaults.basePrice,
    obj.availableOptions ?? defaults.availableOptions,
    obj.selectedOptions ?? defaults.selectedOptions
  );
};
