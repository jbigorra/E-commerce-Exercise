export class OrderId {
  constructor(public readonly value: number) {
    if (value <= 0) {
      throw new Error("Order ID must be a positive number");
    }
  }

  equals(other: OrderId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }
}

export class CustomerId {
  constructor(public readonly value: number) {
    if (value <= 0) {
      throw new Error("Customer ID must be a positive number");
    }
  }

  equals(other: CustomerId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }
}

export class Money {
  constructor(public readonly amount: number, public readonly currency: string = "EUR") {
    if (amount < 0) {
      throw new Error("Money amount cannot be negative");
    }
    if (!currency || currency.length !== 3) {
      throw new Error("Currency must be a valid 3-letter code");
    }
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot add money with different currencies");
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot subtract money with different currencies");
    }
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new Error("Cannot subtract more money than available");
    }
    return new Money(result, this.currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error("Cannot multiply money by negative factor");
    }
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error("Cannot compare money with different currencies");
    }
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error("Cannot compare money with different currencies");
    }
    return this.amount < other.amount;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }

  toJSON(): { amount: number; currency: string } {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }
}

export class Email {
  constructor(public readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error("Invalid email format");
    }
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  equals(other: Email): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  toString(): string {
    return this.value;
  }
}

export class OrderReference {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Order reference cannot be empty");
    }
    if (value.length > 50) {
      throw new Error("Order reference cannot exceed 50 characters");
    }
  }

  static generate(orderId: number): OrderReference {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return new OrderReference(`ORD-${orderId}-${timestamp}-${random}`.toUpperCase());
  }

  equals(other: OrderReference): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

export class PaymentProofFile {
  constructor(
    public readonly fileName: string,
    public readonly fileUrl: string,
    public readonly fileSize: number,
    public readonly mimeType: string,
  ) {
    if (!fileName || fileName.trim().length === 0) {
      throw new Error("File name cannot be empty");
    }
    if (!fileUrl || fileUrl.trim().length === 0) {
      throw new Error("File URL cannot be empty");
    }
    if (fileSize <= 0) {
      throw new Error("File size must be positive");
    }
    if (!this.isValidMimeType(mimeType)) {
      throw new Error("Invalid file type for payment proof");
    }
  }

  private isValidMimeType(mimeType: string): boolean {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf", "image/webp"];
    return allowedTypes.includes(mimeType);
  }

  isImage(): boolean {
    return this.mimeType.startsWith("image/");
  }

  isPdf(): boolean {
    return this.mimeType === "application/pdf";
  }

  getFileExtension(): string {
    return this.fileName.split(".").pop()?.toLowerCase() || "";
  }

  toString(): string {
    return `${this.fileName} (${this.fileSize} bytes)`;
  }
}
