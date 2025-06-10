import {
  Product,
  ProductOption,
  ProductOptionChoice,
  ProductOptionChoices,
  ProductOptions,
} from "../../src/Store/Inventory/Core/Entities";

export const NOT_FOUND_PRODUCT_ID = 100;
export const UNAVAILABLE_OPTION_ID = 100;
export const STANDARD_PRODUCT_ID = 1;
export const CUSTOMIZABLE_PRODUCT_ID = 2;
export const OPTION_1_ID = 1;
export const OPTION_2_ID = 2;
export const OPTION_3_ID = 3;
export const OPTION_4_ID = 4;
export const OPTION_5_ID = 5;
export const OPTION_WITHOUT_CHOICES_ID = 6;
export const EXPECTED_TOTAL_CUSTOMIZABLE_PRODUCT_PRICE = 80;
export const EXPECTED_TOTAL_STANDARD_PRODUCT_PRICE = 20;
export const CONSTRAINED_OPTION_CHOICE_ID = 5;
export const CONSTRAINING_OPTION_CHOICE_ID = 1;

// New constants for missing tests
export const PRICE_CONSTRAINED_CHOICE_ID = 201;
export const PRICE_CONSTRAINT_ADJUSTMENT = 15;
export const MIXED_CONSTRAINT_CHOICE_1 = 301;
export const MIXED_CONSTRAINT_CHOICE_2 = 302;
export const INCOMPATIBLE_CONSTRAINED_CHOICE = 303;
export const CASCADING_OPTION_1_ID = 7;
export const CASCADING_CHOICE_1_ID = 401;
export const CASCADING_DISABLED_CHOICE_2_ID = 402;
export const CASCADING_DISABLED_CHOICE_3_ID = 403;
export const CHOICE_1_ID = 501;
export const CHOICE_2_ID = 502;
export const CHOICE_3_ID = 503;
export const CHOICE_4_ID = 504;
export const CHOICE_5_ID = 505;

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

export const productsWithIncompatibleConstraintsFixture = (): Product[] => {
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

export const productsWithPriceConstraintsFixture = (): Product[] => {
  const options: ProductOption[] = [
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
  ];

  const optionChoices: ProductOptionChoice[] = [
    {
      id: PRICE_CONSTRAINED_CHOICE_ID,
      optionId: OPTION_1_ID,
      priceAdjustment: 5,
      selected: false,
      disabled: false,
      constraints: [
        {
          id: 1,
          optionChoiceId: PRICE_CONSTRAINED_CHOICE_ID,
          type: "price" as const,
          constrainedBy: OPTION_1_ID,
          priceAdjustment: PRICE_CONSTRAINT_ADJUSTMENT,
        },
      ],
    },
  ];

  const products: Product[] = [
    createStandardProduct(),
    createCustomizableProduct({}, options, optionChoices),
  ];

  return products;
};

export const productsWithMixedConstraintsFixture = (): Product[] => {
  const options: ProductOption[] = [
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
  ];

  const optionChoices: ProductOptionChoice[] = [
    {
      id: MIXED_CONSTRAINT_CHOICE_1,
      optionId: OPTION_1_ID,
      priceAdjustment: 5,
      selected: false,
      disabled: false,
      constraints: [
        {
          id: 1,
          optionChoiceId: MIXED_CONSTRAINT_CHOICE_1,
          type: "price" as const,
          constrainedBy: OPTION_1_ID,
          priceAdjustment: 10,
        },
      ],
    },
    {
      id: MIXED_CONSTRAINT_CHOICE_2,
      optionId: OPTION_2_ID,
      priceAdjustment: 8,
      selected: false,
      disabled: false,
      constraints: [],
    },
    {
      id: INCOMPATIBLE_CONSTRAINED_CHOICE,
      optionId: OPTION_2_ID,
      priceAdjustment: 12,
      selected: false,
      disabled: false,
      constraints: [
        {
          id: 2,
          optionChoiceId: INCOMPATIBLE_CONSTRAINED_CHOICE,
          type: "incompatible" as const,
          constrainedBy: OPTION_1_ID,
        },
      ],
    },
  ];

  const products: Product[] = [
    createStandardProduct(),
    createCustomizableProduct({}, options, optionChoices),
  ];

  return products;
};

export const productsWithOptionsOnlyFixture = (): Product[] => {
  const options: ProductOption[] = [
    {
      id: OPTION_WITHOUT_CHOICES_ID,
      price: 15,
      selected: false,
    },
    {
      id: OPTION_1_ID,
      price: 10,
      selected: false,
    },
  ];

  const products: Product[] = [
    createStandardProduct(),
    createCustomizableProduct({}, options, []), // No choices for these options
  ];

  return products;
};

export const productsWithCascadingConstraintsFixture = (): Product[] => {
  const options: ProductOption[] = [
    {
      id: CASCADING_OPTION_1_ID,
      price: 10,
      selected: false,
    },
  ];

  const optionChoices: ProductOptionChoice[] = [
    {
      id: CASCADING_CHOICE_1_ID,
      optionId: CASCADING_OPTION_1_ID,
      priceAdjustment: 5,
      selected: false,
      disabled: false,
      constraints: [],
    },
    {
      id: CASCADING_DISABLED_CHOICE_2_ID,
      optionId: CASCADING_OPTION_1_ID,
      priceAdjustment: 8,
      selected: false,
      disabled: false,
      constraints: [
        {
          id: 1,
          optionChoiceId: CASCADING_DISABLED_CHOICE_2_ID,
          type: "incompatible" as const,
          constrainedBy: CASCADING_OPTION_1_ID,
        },
      ],
    },
    {
      id: CASCADING_DISABLED_CHOICE_3_ID,
      optionId: CASCADING_OPTION_1_ID,
      priceAdjustment: 12,
      selected: false,
      disabled: false,
      constraints: [
        {
          id: 2,
          optionChoiceId: CASCADING_DISABLED_CHOICE_3_ID,
          type: "incompatible" as const,
          constrainedBy: CASCADING_OPTION_1_ID,
        },
      ],
    },
  ];

  const products: Product[] = [
    createStandardProduct(),
    createCustomizableProduct({}, options, optionChoices),
  ];

  return products;
};

export const productsWithManyOptionsFixture = (): Product[] => {
  const options: ProductOption[] = [
    { id: OPTION_1_ID, price: 10, selected: false },
    { id: OPTION_2_ID, price: 15, selected: false },
    { id: OPTION_3_ID, price: 20, selected: false },
    { id: OPTION_4_ID, price: 25, selected: false },
    { id: OPTION_5_ID, price: 30, selected: false },
  ];

  const optionChoices: ProductOptionChoice[] = [
    {
      id: CHOICE_1_ID,
      optionId: OPTION_1_ID,
      priceAdjustment: 5,
      selected: false,
      disabled: false,
      constraints: [],
    },
    {
      id: CHOICE_2_ID,
      optionId: OPTION_2_ID,
      priceAdjustment: 8,
      selected: false,
      disabled: false,
      constraints: [],
    },
    {
      id: CHOICE_3_ID,
      optionId: OPTION_3_ID,
      priceAdjustment: 12,
      selected: false,
      disabled: false,
      constraints: [],
    },
    {
      id: CHOICE_4_ID,
      optionId: OPTION_4_ID,
      priceAdjustment: 15,
      selected: false,
      disabled: false,
      constraints: [],
    },
    {
      id: CHOICE_5_ID,
      optionId: OPTION_5_ID,
      priceAdjustment: 18,
      selected: false,
      disabled: false,
      constraints: [],
    },
  ];

  const products: Product[] = [
    createStandardProduct(),
    createCustomizableProduct({}, options, optionChoices),
  ];

  return products;
};

export const createStandardProduct = (obj: Partial<Product> = {}): Product => {
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
    new ProductOptions(defaults.options),
    new ProductOptionChoices(defaults.optionChoices)
  );
};

export const createCustomizableProduct = (
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
    new ProductOptions(options),
    new ProductOptionChoices(optionChoices)
  );
};

export const createProductOptions = (): ProductOption[] => {
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

export const createProductOptionChoices = (): ProductOptionChoice[] => {
  const choices = [
    {
      id: 1,
      optionId: OPTION_1_ID,
      priceAdjustment: 10,
      selected: false,
      disabled: false,
      constraints: [],
    },
    {
      id: 2,
      optionId: OPTION_1_ID,
      priceAdjustment: 30,
      selected: false,
      disabled: false,
      constraints: [],
    },
    {
      id: 3,
      optionId: OPTION_2_ID,
      priceAdjustment: 20,
      selected: false,
      disabled: false,
      constraints: [],
    },
    {
      id: 4,
      optionId: OPTION_3_ID,
      priceAdjustment: 5,
      selected: false,
      disabled: false,
      constraints: [
        {
          id: 1,
          optionChoiceId: 4,
          type: "price" as const,
          constrainedBy: OPTION_3_ID,
          priceAdjustment: 10,
        },
      ],
    },
    {
      id: 5,
      optionId: OPTION_3_ID,
      priceAdjustment: 15,
      selected: false,
      disabled: false,
      constraints: [
        {
          id: 2,
          optionChoiceId: 5,
          type: "incompatible" as const,
          constrainedBy: OPTION_1_ID,
        },
        {
          id: 3,
          optionChoiceId: 5,
          type: "incompatible" as const,
          constrainedBy: OPTION_2_ID,
        },
      ],
    },
  ];

  return choices;
};
