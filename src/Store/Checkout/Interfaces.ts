// Core Domain Exports
export {
  Customer,
  Order,
  OrderItem,
  OrderStatus,
  PaymentProof,
  PriceAdjustment,
  ProductConfiguration,
  SelectedPartChoice,
} from "./Core/Entities";
export { Result } from "./Core/Result";
export { CustomerId, Email, Money, OrderId, OrderReference, PaymentProofFile } from "./Core/ValueObjects";

// Service Interfaces
export {
  CartItem,
  FileStorageService,
  NotificationService,
  OrderRepository,
  OrderService,
  PaymentProofRepository,
} from "./Core/Services/OrderService";

// Action Interfaces
export { CreateOrderRequest, CreateOrderResponse } from "./Actions/CreateOrder";
export {
  GetOrderRequest,
  GetOrdersByCustomerRequest,
  OrderItemResponse,
  OrderResponse,
  PaymentProofResponse,
} from "./Actions/GetOrder";
export {
  CompleteOrderRequest,
  ConfirmOrderRequest,
  MarkOrderReadyRequest,
  OrderManagementResponse,
  RejectOrderRequest,
} from "./Actions/ManageOrder";
export { UploadPaymentProofRequest, UploadPaymentProofResponse } from "./Actions/UploadPaymentProof";

// Infrastructure Implementations
export { OrderRepository as OrderRepositoryImpl } from "./Infrastructure/Persistence/OrderRepository";
export { PaymentProofRepository as PaymentProofRepositoryImpl } from "./Infrastructure/Persistence/PaymentProofRepository";
export {
  DefaultFileValidator,
  FileStorageService as FileStorageServiceImpl,
} from "./Infrastructure/Services/FileStorageService";
export { NotificationService as NotificationServiceImpl } from "./Infrastructure/Services/NotificationService";

// Presentation Layer
export { OrderController } from "./Presenters/OrderController";

// Action Classes
export { CreateOrderAction } from "./Actions/CreateOrder";
export { GetOrderAction } from "./Actions/GetOrder";
export { ManageOrderAction } from "./Actions/ManageOrder";
export { UploadPaymentProofAction } from "./Actions/UploadPaymentProof";
