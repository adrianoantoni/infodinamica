
export enum OrderStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
  EM_VERIFICACAO = 'EM VERIFICAÇÃO',
  APROVADO = 'APROVADO'
}

export enum MovementType {
  ENTRY = 'Entry',
  EXIT = 'Exit',
  TRANSFER = 'Transfer',
  ADJUSTMENT = 'Adjustment'
}

export type Language = 'pt' | 'en' | 'es' | 'fr';
export type Currency = 'USD' | 'EUR' | 'AOA';

export interface ProductVariation {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  specificItem?: string;
  brand: string;
  sku?: string;
  images: string[];
  stock: number;
  minStock: number;
  variations: ProductVariation[];
  rating: number;
  reviewsCount: number;
  featured: boolean;
  createdAt: string;
  mercadolivreId?: string;
  syncStatus?: 'synced' | 'pending' | 'error' | 'not_linked';
  lastSync?: string;
}

export interface CartItem {
  productId: string;
  variationId?: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  nif: string;
  phone: string;
  type: 'singular' | 'empresa';
  balance: number;
  points?: number;
  address?: string;
  userId?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string, name: string, role: string };
  receiverId: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaymentProof {
  id: string;
  saleId: string;
  customerId: string;
  amount: number;
  receiptImage: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'gerente' | 'vendedor' | 'customer';
  token?: string;
  lastActive?: string;
  customer?: Customer;
}

export interface Order {
  id: string;
  invoiceNumber?: string;
  customerId: string;
  customerName: string;
  items: CartItem[];
  total: number;
  tax?: number;
  discount?: number;
  paidAmount?: number;
  balanceUsed?: number;
  status: OrderStatus;
  createdAt: string;
  shippingAddress: string;
  paymentMethod: string;
  source?: 'direct' | 'mercadolivre' | 'pos';
  externalId?: string;
  docType?: string | 'FATURA' | 'PROFORMA';
}

export interface StockMovement {
  id: string;
  productId: string;
  variationId?: string;
  type: MovementType;
  quantity: number;
  reason: string;
  user: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface MarketplaceLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  platform: 'mercadolivre';
}
