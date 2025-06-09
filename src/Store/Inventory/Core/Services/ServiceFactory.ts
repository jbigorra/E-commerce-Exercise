import { ConstraintEngine } from "../Constraints/ConstraintEngine";
import { ChoiceSelectionService } from "./ChoiceSelectionService";
import { OptionSelectionService } from "./OptionSelectionService";
import {
  DefaultProductCustomizationService,
  ProductCustomizationService,
} from "./ProductCustomizationService";

export class ServiceFactory {
  private static optionSelectionService: OptionSelectionService | null = null;
  private static choiceSelectionService: ChoiceSelectionService | null = null;
  private static constraintEngine: ConstraintEngine | null = null;
  private static productCustomizationService: ProductCustomizationService | null =
    null;

  static createProductCustomizationService(): ProductCustomizationService {
    if (!this.productCustomizationService) {
      const optionSelectionService = this.createOptionSelectionService();
      const choiceSelectionService = this.createChoiceSelectionService();
      const constraintEngine = this.createConstraintEngine();

      this.productCustomizationService = new DefaultProductCustomizationService(
        optionSelectionService,
        choiceSelectionService,
        constraintEngine
      );
    }

    return this.productCustomizationService;
  }

  static createOptionSelectionService(): OptionSelectionService {
    if (!this.optionSelectionService) {
      this.optionSelectionService = new OptionSelectionService();
    }
    return this.optionSelectionService;
  }

  static createChoiceSelectionService(): ChoiceSelectionService {
    if (!this.choiceSelectionService) {
      this.choiceSelectionService = new ChoiceSelectionService();
    }
    return this.choiceSelectionService;
  }

  static createConstraintEngine(): ConstraintEngine {
    if (!this.constraintEngine) {
      this.constraintEngine = new ConstraintEngine();
    }
    return this.constraintEngine;
  }

  // For testing purposes
  static reset(): void {
    this.optionSelectionService = null;
    this.choiceSelectionService = null;
    this.constraintEngine = null;
    this.productCustomizationService = null;
  }
}
