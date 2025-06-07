import {
  Product,
  ProductOption,
  ProductOptionChoice,
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
    createCustomizableProduct({}, createProductOptions()),
  ];

  return products;
};

export const productsWithOptionChoicesFixture = (): Product[] => {
  const products: Product[] = [
    createStandardProduct(),
    createCustomizableProduct(
      {},
      createProductOptions(),
      createProductOptionChoices()
    ),
  ];

  return products;
};

const createStandardProduct = (obj: Partial<Product> = {}): Product => {
  const defaults = {
    id: STANDARD_PRODUCT_ID,
    type: "standard" as const,
    basePrice: 20,
    options: [],
    optionChoices: [],
  };

  return new Product(
    obj.id ?? defaults.id,
    obj.type ?? defaults.type,
    obj.basePrice ?? defaults.basePrice,
    defaults.options,
    defaults.optionChoices
  );
};

const createCustomizableProduct = (
  obj: Partial<Product> = {},
  options: ProductOption[] = [],
  optionChoices: ProductOptionChoice[] = []
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
    options,
    optionChoices
  );
};

const createProductOptions = (): ProductOption[] => {
  const options = [
    {
      id: OPTION_1_ID,
      price: 10,
      selected: false,
    },
    {
      id: OPTION_2_ID,
      price: 20,
      selected: false,
    },
    {
      id: OPTION_3_ID,
      price: 30,
      selected: false,
    },
  ];

  return options;
};

const createProductOptionChoices = (): ProductOptionChoice[] => {
  const choices = [
    {
      id: 1,
      optionId: OPTION_1_ID,
      priceAdjustment: 10,
      selected: false,
    },
    {
      id: 2,
      optionId: OPTION_1_ID,
      priceAdjustment: 30,
      selected: false,
    },
    {
      id: 3,
      optionId: OPTION_2_ID,
      priceAdjustment: 20,
      selected: false,
    },
    {
      id: 4,
      optionId: OPTION_3_ID,
      priceAdjustment: 5,
      selected: false,
    },
    {
      id: 5,
      optionId: OPTION_3_ID,
      priceAdjustment: 15,
      selected: false,
    },
  ];

  return choices;
};
