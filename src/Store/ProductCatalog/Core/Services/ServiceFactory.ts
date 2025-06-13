import { ChoiceSelectionService } from "./ChoiceSelectionService";
import { DefaultProductCustomizationService, ProductCustomizationService } from "./ProductCustomizationService";

export class ServiceFactory {
  private static choiceSelectionService: ChoiceSelectionService | null = null;
  private static productCustomizationService: ProductCustomizationService | null = null;

  static createProductCustomizationService(): ProductCustomizationService {
    if (!this.productCustomizationService) {
      const choiceSelectionService = this.createChoiceSelectionService();
      this.productCustomizationService = new DefaultProductCustomizationService(choiceSelectionService);
    }

    return this.productCustomizationService;
  }

  static createChoiceSelectionService(): ChoiceSelectionService {
    if (!this.choiceSelectionService) {
      this.choiceSelectionService = new ChoiceSelectionService();
    }
    return this.choiceSelectionService;
  }

  // For testing purposes
  static reset(): void {
    this.choiceSelectionService = null;
    this.productCustomizationService = null;
  }
}
