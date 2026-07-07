export interface OrderProduct {
  id: string;
  name: string;
  imageUrl: string;
}

export interface OrderItemDto {
  id: string;
  quantity: number;
  price: number;
  product: OrderProduct;
}

export interface PaymentDto {
  id: string;
  method: "COD" | "ONLINE";
  status: "PENDING" | "PAID" | "FAILED";
  amount: number;
  transactionRef: string | null;
  paidAt: string | null;
}

export interface ShipmentDto {
  id: string;
  shipperName: string;
  trackingCode: string;
  status: "BOOKED" | "PICKED_UP" | "DELIVERING" | "DELIVERED";
  bookedAt: string;
  deliveredAt: string | null;
}

export interface StoreDto {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface VoucherDto {
  id: string;
  code: string;
  description: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
}

export interface OrderDto {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  storeId: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPING" | "COMPLETED" | "CANCELLED";
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDto[];
  payment: PaymentDto | null;
  shipment: ShipmentDto | null;
  store: StoreDto;
  voucher: VoucherDto | null;
}
