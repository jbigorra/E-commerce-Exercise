import {
  Product,
  ProductOption,
} from "../../src/Store/Inventory/Core/Entities";

export const NOT_FOUND_PRODUCT_ID = 100;
export const UNAVAILABLE_OPTION_ID = 100;
export const STANDARD_PRODUCT_ID = 1;
export const CUSTOMIZABLE_PRODUCT_ID = 2;
export const OPTION_1_ID = 1;
export const OPTION_2_ID = 2;
export const OPTION_3_ID = 3;
export const EXPECTED_TOTAL_CUSTOMIZABLE_PRODUCT_PRICE = 80;
export const EXPECTED_TOTAL_STANDARD_PRODUCT_PRICE = 20;

export const productsFixture = (): Product[] => {
  const products: Product[] = [
    createStandardProduct(),
    createCustomizableProduct(
      {},
      [
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
      []
    ),
  ];

  return products;
};

const createStandardProduct = (obj: Partial<Product> = {}): Product => {
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

const createCustomizableProduct = (
  obj: Partial<Product> = {},
  availableOptions: ProductOption[] = [],
  selectedOptions: ProductOption[] = []
): Product => {
  const defaults = {
    id: CUSTOMIZABLE_PRODUCT_ID,
    type: "customizable" as const,
    basePrice: 20,
  };

  return new Product(
    obj.id ?? defaults.id,
    obj.type ?? defaults.type,
    obj.basePrice ?? defaults.basePrice,
    availableOptions,
    selectedOptions
  );
};
