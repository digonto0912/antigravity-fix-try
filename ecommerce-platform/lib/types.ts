// ============================================
// ALL TypeScript Interfaces for the Platform
// ============================================

export interface Client {
  id: string;
  email: string;
  password: string;
  businessName: string;
  subdomain: string;
  plan: 'free' | 'basic' | 'pro';
  status: 'active' | 'inactive' | 'suspended';
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };
  storefrontSettings?: {
    storeName: string;
    tagline: string;
    primaryColor: string;
    secondaryColor: string;
    currency: string;
  };
  shippingSettings?: {
    flatRate: number;
    freeShippingThreshold: number;
    deliveryAreas: string[];
    estimatedDeliveryTime: string;
  };
  paymentSettings?: {
    cod: boolean;
    bkash: { enabled: boolean; merchantNumber: string };
    nagad: { enabled: boolean; merchantNumber: string };
    bankTransfer: { enabled: boolean; accountDetails: string };
  };
  emailTemplates?: {
    orderConfirmation: { subject: string; body: string };
    orderShipped: { subject: string; body: string };
    orderDelivered: { subject: string; body: string };
  };
  notifications?: {
    emailNewOrder: boolean;
    emailLowStock: boolean;
    emailNewCustomer: boolean;
    emailNewMessage: boolean;
    smsNewOrder: boolean;
    smsLowStock: boolean;
    smsNewCustomer: boolean;
    smsNewMessage: boolean;
    notificationEmail: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  clientId: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  basePrice: number;
  salePrice?: number;
  images: string[];
  variants: ProductVariant[];
  inventory: number;
  lowStockThreshold: number;
  supplierId?: string;
  purchasePrice?: number;
  location?: string;
  slug: string;
  metaDescription?: string;
  status: 'active' | 'hidden' | 'archived';
  views: number;
  addToCartCount: number;
  purchaseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  type: string; // e.g., "Size", "Color"
  options: string[]; // e.g., ["S", "M", "L"]
}

export interface VariantCombination {
  id: string;
  productId: string;
  combination: Record<string, string>; // e.g., { Size: "M", Color: "Red" }
  price?: number;
  inventory?: number;
}

export interface Category {
  id: string;
  clientId: string;
  name: string;
  displayOrder: number;
  createdAt: string;
}

export interface Order {
  id: string;
  clientId: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  city: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  shippingCost: number;
  total: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'bank';
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned';
  statusHistory: StatusHistoryEntry[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  variant?: Record<string, string>;
  quantity: number;
  price: number;
  total: number;
}

export interface StatusHistoryEntry {
  status: string;
  timestamp: string;
  note?: string;
}

export interface Customer {
  id: string;
  clientId: string;
  name: string;
  phone: string;
  email?: string;
  addresses: CustomerAddress[];
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  loyaltyHistory: LoyaltyEntry[];
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAddress {
  id: string;
  address: string;
  city: string;
  isDefault: boolean;
}

export interface LoyaltyEntry {
  id: string;
  points: number;
  reason: string;
  date: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  image?: string;
  variant?: Record<string, string>;
  price: number;
  quantity: number;
}

export interface Lead {
  id: string;
  clientId: string;
  sessionId: string;
  name?: string;
  phone?: string;
  email?: string;
  location?: string;
  firstVisit: string;
  lastVisit: string;
  totalVisits: number;
  pagesViewed: string[];
  productsViewed: string[];
  timeOnSite: number;
  cartAbandoned: boolean;
  abandonedCartValue: number;
  abandonedCartItems: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  leadStatus: 'hot' | 'warm' | 'cold' | 'converted';
  tags: string[];
  sessionRecordings: SessionRecording[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecording {
  recordingId: string;
  timestamp: string;
  duration: number;
  events: SessionEvent[];
}

export interface SessionEvent {
  type: 'pageview' | 'click' | 'scroll' | 'cart_add' | 'cart_remove';
  timestamp: string;
  data: Record<string, string | number>;
}

export interface Message {
  id: string;
  clientId: string;
  customerId?: string;
  customerName: string;
  leadId?: string;
  channel: 'website' | 'facebook' | 'whatsapp' | 'email';
  direction: 'incoming' | 'outgoing';
  content: string;
  attachments?: string[];
  status: 'unread' | 'read' | 'replied' | 'archived';
  assignedTo?: string;
  tags: string[];
  relatedProductId?: string;
  relatedOrderId?: string;
  conversationId: string;
  createdAt: string;
  readAt?: string;
  repliedAt?: string;
}

export interface AutoResponse {
  id: string;
  clientId: string;
  trigger: string;
  response: string;
  isActive: boolean;
  timesUsed: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  clientId: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  paymentTerms?: string;
  totalPurchases: number;
  totalPaid: number;
  outstandingDebt: number;
  suppliedProducts: string[];
  payments: SupplierPayment[];
  purchaseHistory: PurchaseRecord[];
  notes: string;
  createdAt: string;
}

export interface SupplierPayment {
  id: string;
  amount: number;
  date: string;
  method: 'cash' | 'bank_transfer' | 'bkash' | 'nagad';
  note?: string;
}

export interface PurchaseRecord {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface InventoryItem {
  id: string;
  clientId: string;
  productId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  supplierId?: string;
  supplierName?: string;
  purchasePrice: number;
  location?: string;
  stockHistory: StockHistoryEntry[];
  lowStockAlert: boolean;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockHistoryEntry {
  id: string;
  type: 'purchase' | 'sale' | 'damage' | 'theft' | 'return' | 'manual_correction';
  quantity: number;
  runningBalance: number;
  date: string;
  note?: string;
  relatedOrderId?: string;
}

export interface AccountingEntry {
  id: string;
  clientId: string;
  type: 'income' | 'expense' | 'refund';
  category: string;
  amount: number;
  description: string;
  relatedOrderId?: string;
  relatedSupplierId?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  paymentMethod: 'cash' | 'cod' | 'bkash' | 'nagad' | 'bank';
  paidBy?: string;
  date: string;
  createdAt: string;
}

export interface DeliveryTracking {
  id: string;
  clientId: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  courierService: 'pathao' | 'steadfast' | 'redex' | 'sundarban' | 'other';
  trackingNumber: string;
  deliveryBoyName?: string;
  deliveryBoyPhone?: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned';
  statusHistory: Array<{
    status: string;
    timestamp: string;
    location?: string;
    note?: string;
  }>;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  codAmount: number;
  codCollected: boolean;
  codCollectedDate?: string;
  codRemittedToClient: boolean;
  codRemittanceDate?: string;
  deliveryCharge: number;
  courierPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReview {
  id: string;
  clientId: string;
  productId: string;
  customerId: string;
  customerName: string;
  orderId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string;
  approvedAt?: string;
}

export interface SpinWheelDiscount {
  discount: number;
  type: 'percentage' | 'free_shipping';
  expiresAt: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
