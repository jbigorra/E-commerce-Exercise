import { Order } from "../../Core/Entities";
import { Result } from "../../Core/Result";
import { NotificationService as INotificationService } from "../../Core/Services/OrderService";

// Email service interface (would be implemented with actual email provider)
interface EmailService {
  sendEmail(to: string, subject: string, body: string, isHtml?: boolean): Promise<void>;
}

// Customer service interface for getting customer details
interface CustomerService {
  getCustomerById(customerId: number): Promise<{ email: string; name: string } | null>;
}

// Admin service interface for getting admin details
interface AdminService {
  getAdminEmails(): Promise<string[]>;
}

export class NotificationService implements INotificationService {
  constructor(
    private readonly emailService: EmailService,
    private readonly customerService: CustomerService,
    private readonly adminService: AdminService,
    private readonly baseUrl: string = "https://marcus-bikes.com",
  ) {}

  async notifyAdminOfNewOrder(order: Order): Promise<Result<void>> {
    try {
      const adminEmails = await this.adminService.getAdminEmails();
      const customer = await this.customerService.getCustomerById(order.customerId);

      if (!customer) {
        return Result.error("Customer not found for notification");
      }

      const subject = `New Order #${order.id} - ${customer.name}`;
      const body = this.generateNewOrderEmailBody(order, customer);

      // Send email to all admins
      await Promise.all(adminEmails.map((email) => this.emailService.sendEmail(email, subject, body, true)));

      return Result.success(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async notifyAdminOfPaymentProofUploaded(order: Order): Promise<Result<void>> {
    try {
      const adminEmails = await this.adminService.getAdminEmails();
      const customer = await this.customerService.getCustomerById(order.customerId);

      if (!customer) {
        return Result.error("Customer not found for notification");
      }

      const subject = `Payment Proof Uploaded - Order #${order.id}`;
      const body = this.generatePaymentProofUploadedEmailBody(order, customer);

      // Send email to all admins
      await Promise.all(adminEmails.map((email) => this.emailService.sendEmail(email, subject, body, true)));

      return Result.success(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async notifyCustomerOfOrderConfirmation(order: Order): Promise<Result<void>> {
    try {
      const customer = await this.customerService.getCustomerById(order.customerId);

      if (!customer) {
        return Result.error("Customer not found for notification");
      }

      const subject = `Order Confirmed - Order #${order.id}`;
      const body = this.generateOrderConfirmationEmailBody(order, customer);

      await this.emailService.sendEmail(customer.email, subject, body, true);

      return Result.success(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async notifyCustomerOfOrderRejection(order: Order): Promise<Result<void>> {
    try {
      const customer = await this.customerService.getCustomerById(order.customerId);

      if (!customer) {
        return Result.error("Customer not found for notification");
      }

      const subject = `Order Update - Order #${order.id}`;
      const body = this.generateOrderRejectionEmailBody(order, customer);

      await this.emailService.sendEmail(customer.email, subject, body, true);

      return Result.success(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async notifyCustomerOfOrderReadyToPickup(order: Order): Promise<Result<void>> {
    try {
      const customer = await this.customerService.getCustomerById(order.customerId);

      if (!customer) {
        return Result.error("Customer not found for notification");
      }

      const subject = `Your Order is Ready for Pickup - Order #${order.id}`;
      const body = this.generateOrderReadyEmailBody(order, customer);

      await this.emailService.sendEmail(customer.email, subject, body, true);

      return Result.success(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private generateNewOrderEmailBody(order: Order, customer: { email: string; name: string }): string {
    return `
      <h2>New Order Received</h2>
      <p><strong>Order ID:</strong> #${order.id}</p>
      <p><strong>Customer:</strong> ${customer.name} (${customer.email})</p>
      <p><strong>Total Amount:</strong> €${order.totalPrice.toFixed(2)}</p>
      <p><strong>Items:</strong> ${order.getTotalItemsCount()}</p>
      <p><strong>Order Date:</strong> ${order.createdAt.toLocaleDateString()}</p>

      <h3>Order Items:</h3>
      <ul>
        ${order.items
          .map(
            (item) => `
          <li>${item.productConfiguration.productName} - €${item.totalPrice.toFixed(2)}</li>
        `,
          )
          .join("")}
      </ul>

      <p><a href="${this.baseUrl}/admin/orders/${order.id}">View Order Details</a></p>

      <p>The customer will upload payment proof soon.</p>
    `;
  }

  private generatePaymentProofUploadedEmailBody(order: Order, customer: { email: string; name: string }): string {
    return `
      <h2>Payment Proof Uploaded</h2>
      <p><strong>Order ID:</strong> #${order.id}</p>
      <p><strong>Customer:</strong> ${customer.name} (${customer.email})</p>
      <p><strong>Total Amount:</strong> €${order.totalPrice.toFixed(2)}</p>
      <p><strong>Upload Date:</strong> ${order.paymentProof?.uploadedAt.toLocaleDateString()}</p>

      <p>The customer has uploaded payment proof for their order. Please review and confirm or reject the payment.</p>

      <p><a href="${this.baseUrl}/admin/orders/${order.id}">Review Payment Proof</a></p>
    `;
  }

  private generateOrderConfirmationEmailBody(order: Order, customer: { email: string; name: string }): string {
    return `
      <h2>Order Confirmed!</h2>
      <p>Dear ${customer.name},</p>

      <p>Great news! Your order has been confirmed and we're now preparing your custom bicycle.</p>

      <p><strong>Order ID:</strong> #${order.id}</p>
      <p><strong>Total Amount:</strong> €${order.totalPrice.toFixed(2)}</p>
      <p><strong>Confirmation Date:</strong> ${order.updatedAt.toLocaleDateString()}</p>

      <h3>Your Order:</h3>
      <ul>
        ${order.items
          .map(
            (item) => `
          <li>${item.productConfiguration.productName} - €${item.totalPrice.toFixed(2)}</li>
        `,
          )
          .join("")}
      </ul>

      ${order.adminNotes ? `<p><strong>Notes:</strong> ${order.adminNotes}</p>` : ""}

      <p>We'll notify you when your order is ready for pickup.</p>

      <p><a href="${this.baseUrl}/orders/${order.id}">View Order Details</a></p>

      <p>Thank you for choosing Marcus Bikes!</p>
    `;
  }

  private generateOrderRejectionEmailBody(order: Order, customer: { email: string; name: string }): string {
    return `
      <h2>Order Update</h2>
      <p>Dear ${customer.name},</p>

      <p>We regret to inform you that we cannot process your order at this time.</p>

      <p><strong>Order ID:</strong> #${order.id}</p>
      <p><strong>Total Amount:</strong> €${order.totalPrice.toFixed(2)}</p>

      ${order.adminNotes ? `<p><strong>Reason:</strong> ${order.adminNotes}</p>` : ""}

      <p>If you have any questions or would like to place a new order, please don't hesitate to contact us.</p>

      <p><a href="${this.baseUrl}/contact">Contact Us</a></p>

      <p>We apologize for any inconvenience.</p>

      <p>Best regards,<br>Marcus Bikes Team</p>
    `;
  }

  private generateOrderReadyEmailBody(order: Order, customer: { email: string; name: string }): string {
    return `
      <h2>Your Order is Ready for Pickup!</h2>
      <p>Dear ${customer.name},</p>

      <p>Excellent news! Your custom bicycle is ready for pickup.</p>

      <p><strong>Order ID:</strong> #${order.id}</p>
      <p><strong>Total Amount:</strong> €${order.totalPrice.toFixed(2)}</p>

      <h3>Pickup Information:</h3>
      <p><strong>Location:</strong> Marcus Bikes Workshop<br>
      123 Bike Street, Amsterdam, Netherlands</p>

      <p><strong>Hours:</strong><br>
      Monday - Friday: 9:00 AM - 6:00 PM<br>
      Saturday: 10:00 AM - 4:00 PM<br>
      Sunday: Closed</p>

      <p>Please bring a valid ID and this email when picking up your order.</p>

      ${order.adminNotes ? `<p><strong>Special Instructions:</strong> ${order.adminNotes}</p>` : ""}

      <p><a href="${this.baseUrl}/orders/${order.id}">View Order Details</a></p>

      <p>We can't wait for you to see your new bike!</p>

      <p>Best regards,<br>Marcus Bikes Team</p>
    `;
  }
}
