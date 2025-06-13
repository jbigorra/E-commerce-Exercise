import { Part, PartChoice, Product, ProductType } from "../Core/Entities";

export class ProductDTO {
  constructor(
    readonly id: number,
    readonly type: ProductType,
    readonly basePrice: number,
    readonly currentTotalPrice: number,
    readonly parts: PartDTO[],
    readonly partChoices: PartChoiceDTO[],
  ) {}

  static from(product: Product): ProductDTO {
    const parts = product.parts.all.map(PartDTO.from);
    const partChoices = product.partChoices.all.map(PartChoiceDTO.from);

    return new ProductDTO(product.id, product.type, product.basePrice, product.currentTotalPrice, parts, partChoices);
  }
}

export class PartDTO {
  constructor(readonly id: number, readonly name: string, readonly description: string, readonly basePrice: number) {}

  static from(part: Part): PartDTO {
    return new PartDTO(part.id, part.name, part.description, part.price);
  }
}

export class PartChoiceDTO {
  constructor(
    readonly id: number,
    readonly partId: number,
    readonly priceAdjustment: number,
    readonly outOfStock: boolean,
    readonly selected: boolean,
    readonly disabled: boolean,
  ) {}

  static from(partChoice: PartChoice): PartChoiceDTO {
    return new PartChoiceDTO(
      partChoice.id,
      partChoice.partId,
      partChoice.priceAdjustment,
      partChoice.outOfStock,
      partChoice.selected,
      partChoice.disabled,
    );
  }
}
