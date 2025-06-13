import { CreateOrderAction, CreateOrderRequest } from "../Actions/CreateOrder";
import { GetOrderAction, GetOrderRequest, GetOrdersByCustomerRequest } from "../Actions/GetOrder";
import {
  CompleteOrderRequest,
  ConfirmOrderRequest,
  ManageOrderAction,
  MarkOrderReadyRequest,
  RejectOrderRequest,
} from "../Actions/ManageOrder";
import { UploadPaymentProofAction, UploadPaymentProofRequest } from "../Actions/UploadPaymentProof";

// HTTP request/response interfaces (would be from your web framework)
interface HttpRequest {
  params: Record<string, string>;
  body: any;
  query: Record<string, string>;
  user?: { id: number; role: string };
}

interface HttpResponse {
  status(code: number): HttpResponse;
  json(data: any): HttpResponse;
  send(data: any): HttpResponse;
}

export class OrderController {
  constructor(
    private readonly createOrderAction: CreateOrderAction,
    private readonly uploadPaymentProofAction: UploadPaymentProofAction,
    private readonly manageOrderAction: ManageOrderAction,
    private readonly getOrderAction: GetOrderAction,
  ) {}

  // Customer endpoints
  async createOrder(req: HttpRequest, res: HttpResponse): Promise<HttpResponse> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const request: CreateOrderRequest = {
        customerId: req.user.id,
        cartItems: req.body.cartItems,
      };

      const result = await this.createOrderAction.execute(request);

      if (result.isError()) {
        return res.status(400).json({ error: result.getError().message });
      }

      const response = result.getValue();
      return res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async uploadPaymentProof(req: HttpRequest, res: HttpResponse): Promise<HttpResponse> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }

      const request: UploadPaymentProofRequest = {
        orderId: orderId,
        customerId: req.user.id,
        fileName: req.body.fileName,
        fileUrl: req.body.fileUrl,
        fileSize: req.body.fileSize,
        mimeType: req.body.mimeType,
      };

      const result = await this.uploadPaymentProofAction.execute(request);

      if (result.isError()) {
        return res.status(400).json({ error: result.getError().message });
      }

      const response = result.getValue();
      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async getOrderById(req: HttpRequest, res: HttpResponse): Promise<HttpResponse> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }

      const request: GetOrderRequest = {
        orderId: orderId,
        customerId: req.user.role === "admin" ? undefined : req.user.id,
      };

      const result = await this.getOrderAction.getOrderById(request);

      if (result.isError()) {
        const error = result.getError();
        if (error.message.includes("not found")) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("Unauthorized")) {
          return res.status(403).json({ error: error.message });
        }
        return res.status(400).json({ error: error.message });
      }

      const response = result.getValue();
      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async getOrdersByCustomer(req: HttpRequest, res: HttpResponse): Promise<HttpResponse> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Customers can only see their own orders, admins can see any customer's orders
      let customerId: number;
      if (req.user.role === "admin" && req.params.customerId) {
        customerId = parseInt(req.params.customerId);
        if (isNaN(customerId)) {
          return res.status(400).json({ error: "Invalid customer ID" });
        }
      } else {
        customerId = req.user.id;
      }

      const request: GetOrdersByCustomerRequest = {
        customerId: customerId,
      };

      const result = await this.getOrderAction.getOrdersByCustomer(request);

      if (result.isError()) {
        return res.status(400).json({ error: result.getError().message });
      }

      const response = result.getValue();
      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // Admin endpoints
  async confirmOrder(req: HttpRequest, res: HttpResponse): Promise<HttpResponse> {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }

      const request: ConfirmOrderRequest = {
        orderId: orderId,
        adminNotes: req.body.adminNotes,
      };

      const result = await this.manageOrderAction.confirmOrder(request);

      if (result.isError()) {
        return res.status(400).json({ error: result.getError().message });
      }

      const response = result.getValue();
      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async rejectOrder(req: HttpRequest, res: HttpResponse): Promise<HttpResponse> {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }

      const request: RejectOrderRequest = {
        orderId: orderId,
        adminNotes: req.body.adminNotes,
      };

      const result = await this.manageOrderAction.rejectOrder(request);

      if (result.isError()) {
        return res.status(400).json({ error: result.getError().message });
      }

      const response = result.getValue();
      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async markOrderAsReadyToPickup(req: HttpRequest, res: HttpResponse): Promise<HttpResponse> {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }

      const request: MarkOrderReadyRequest = {
        orderId: orderId,
        adminNotes: req.body.adminNotes,
      };

      const result = await this.manageOrderAction.markOrderAsReadyToPickup(request);

      if (result.isError()) {
        return res.status(400).json({ error: result.getError().message });
      }

      const response = result.getValue();
      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async completeOrder(req: HttpRequest, res: HttpResponse): Promise<HttpResponse> {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }

      const request: CompleteOrderRequest = {
        orderId: orderId,
      };

      const result = await this.manageOrderAction.completeOrder(request);

      if (result.isError()) {
        return res.status(400).json({ error: result.getError().message });
      }

      const response = result.getValue();
      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async getPendingOrders(req: HttpRequest, res: HttpResponse): Promise<HttpResponse> {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const result = await this.getOrderAction.getPendingOrders();

      if (result.isError()) {
        return res.status(400).json({ error: result.getError().message });
      }

      const response = result.getValue();
      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async getOrdersWithPaymentProof(req: HttpRequest, res: HttpResponse): Promise<HttpResponse> {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const result = await this.getOrderAction.getOrdersWithPaymentProof();

      if (result.isError()) {
        return res.status(400).json({ error: result.getError().message });
      }

      const response = result.getValue();
      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
