
export enum OrderStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
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
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: CartItem[];
  total: number;
  paidAmount?: number;
  balanceUsed?: number;
  status: OrderStatus;
  createdAt: string;
  shippingAddress: string;
  paymentMethod: string;
  source?: 'direct' | 'mercadolivre' | 'pos';
  externalId?: string;
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
