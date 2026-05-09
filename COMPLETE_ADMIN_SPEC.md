# COMPLETE FULL-STACK BUILD SPECIFICATION
## White-Label E-Commerce Platform with Comprehensive Admin Panel

---

## 🎯 COMPLETE ADMIN PANEL STRUCTURE

### 7 Main Sidebar Sections (Each with Sub-Pages)

```
ADMIN SIDEBAR NAVIGATION:

1. 📊 DASHBOARD
   └─ Overview (main metrics)

2. 🛍️ PRODUCTS & CATALOG
   ├─ All Products
   ├─ Add New Product
   └─ Categories

3. 📦 ORDERS & FULFILLMENT
   ├─ All Orders
   ├─ Pending Orders
   └─ Delivery Tracking

4. 👥 CUSTOMERS & LEADS
   ├─ All Customers
   ├─ Lead Tracker
   └─ Session Recordings

5. 💬 COMMUNICATION CENTER
   ├─ Message Inbox
   ├─ Auto-Responses
   └─ Customer Conversations

6. 📈 BUSINESS INTELLIGENCE
   ├─ Sales Analytics
   ├─ Revenue Reports
   └─ Product Performance

7. ⚙️ OPERATIONS & SETTINGS
   ├─ Inventory Management
   ├─ Supplier Management
   ├─ Accounting & Books
   └─ Business Settings
```

---

## 📊 EXPANDED DATA MODELS

```typescript
// Add these to the existing models

interface Lead {
  id: string;
  clientId: string;
  sessionId: string;
  name?: string;
  phone?: string;
  email?: string;
  location?: string;
  
  // Behavioral data
  firstVisit: string;
  lastVisit: string;
  totalVisits: number;
  pagesViewed: string[];
  productsViewed: string[];
  timeOnSite: number; // seconds
  
  // Engagement
  cartAbandoned: boolean;
  abandonedCartValue: number;
  abandonedCartItems: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  
  // Status
  leadStatus: 'hot' | 'warm' | 'cold' | 'converted';
  tags: string[]; // ["Price Negotiation", "Ready to Buy", etc.]
  
  // Session Recording
  sessionRecordings: Array<{
    recordingId: string;
    timestamp: string;
    duration: number;
    events: Array<{
      type: 'pageview' | 'click' | 'scroll' | 'cart_add' | 'cart_remove';
      timestamp: string;
      data: any;
    }>;
  }>;
  
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  clientId: string;
  customerId?: string;
  leadId?: string;
  
  // Message data
  channel: 'website' | 'facebook' | 'whatsapp' | 'email';
  direction: 'incoming' | 'outgoing';
  content: string;
  attachments?: string[];
  
  // Status
  status: 'unread' | 'read' | 'replied' | 'archived';
  assignedTo?: string;
  tags: string[];
  
  // Context
  relatedProductId?: string;
  relatedOrderId?: string;
  
  createdAt: string;
  readAt?: string;
  repliedAt?: string;
}

interface AutoResponse {
  id: string;
  clientId: string;
  trigger: string; // keyword or phrase
  response: string;
  isActive: boolean;
  timesUsed: number;
  createdAt: string;
}

interface Supplier {
  id: string;
  clientId: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  
  // Financial
  totalPurchases: number;
  totalPaid: number;
  outstandingDebt: number;
  
  // Products
  suppliedProducts: string[]; // product IDs
  
  // Payment history
  payments: Array<{
    id: string;
    amount: number;
    date: string;
    method: 'cash' | 'bank_transfer' | 'mobile_banking';
    note?: string;
  }>;
  
  notes: string;
  createdAt: string;
}

interface InventoryItem {
  id: string;
  clientId: string;
  productId: string;
  
  // Stock tracking
  currentStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  
  // Supplier info
  supplierId: string;
  supplierName: string;
  purchasePrice: number;
  
  // Locations (if multiple warehouses)
  location?: string;
  
  // History
  stockHistory: Array<{
    id: string;
    type: 'purchase' | 'sale' | 'adjustment' | 'return';
    quantity: number;
    date: string;
    note?: string;
    relatedOrderId?: string;
  }>;
  
  // Alerts
  lowStockAlert: boolean;
  lastRestocked?: string;
  
  createdAt: string;
  updatedAt: string;
}

interface AccountingEntry {
  id: string;
  clientId: string;
  
  // Entry details
  type: 'income' | 'expense' | 'refund';
  category: string; // "Sales", "Advertising", "Courier", "Supplies", etc.
  amount: number;
  description: string;
  
  // References
  relatedOrderId?: string;
  relatedSupplierId?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  
  // Payment
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank';
  paidBy?: string;
  
  date: string;
  createdAt: string;
}

interface DeliveryTracking {
  id: string;
  clientId: string;
  orderId: string;
  
  // Courier details
  courierService: 'pathao' | 'steadfast' | 'redex' | 'sundarban' | 'other';
  trackingNumber: string;
  deliveryBoyName?: string;
  deliveryBoyPhone?: string;
  
  // Status tracking
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned';
  statusHistory: Array<{
    status: string;
    timestamp: string;
    location?: string;
    note?: string;
  }>;
  
  // Delivery details
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  
  // COD reconciliation
  codAmount: number;
  codCollected: boolean;
  codCollectedDate?: string;
  codRemittedToClient: boolean;
  codRemittanceDate?: string;
  
  // Costs
  deliveryCharge: number;
  courierPaid: boolean;
  
  createdAt: string;
  updatedAt: string;
}

interface ProductReview {
  id: string;
  clientId: string;
  productId: string;
  customerId: string;
  orderId: string;
  
  rating: number; // 1-5
  title?: string;
  comment: string;
  images?: string[];
  
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  
  helpfulCount: number;
  
  createdAt: string;
  approvedAt?: string;
}

interface BusinessAnalytics {
  clientId: string;
  period: string; // "2024-01", "2024-Q1", "2024"
  
  // Revenue metrics
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  
  // Product metrics
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    unitsSold: number;
    revenue: number;
  }>;
  
  // Customer metrics
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  
  // Traffic metrics
  totalVisitors: number;
  conversionRate: number;
  cartAbandonmentRate: number;
  
  // Financial metrics
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  
  // Marketing
  adSpend: number;
  roas: number; // Return on Ad Spend
  
  generatedAt: string;
}
```

---

## 🗂️ COMPLETE ADMIN PANEL PAGES

### 1. 📊 DASHBOARD (Main Overview)

**File:** `/app/admin/page.tsx`

**Features:**
- **Top Metrics Cards:**
  - Total Revenue (this month)
  - Total Orders (pending, processing, shipped)
  - Total Products (active)
  - Total Customers
  - Hot Leads Count
  - Unread Messages Count

- **Quick Stats:**
  - Today's revenue vs yesterday
  - Conversion rate (this week)
  - Average order value
  - Cart abandonment rate

- **Recent Activity:**
  - Last 10 orders (with quick status update)
  - New leads (last 24 hours)
  - Unread messages
  - Low stock alerts

- **Charts:**
  - Revenue trend (last 30 days)
  - Orders by status (pie chart)
  - Top selling products (bar chart)

---

### 2. 🛍️ PRODUCTS & CATALOG

#### 2.1 All Products (`/app/admin/products/page.tsx`)

**Features:**
- **Product Table:**
  - Columns: Image, Name, SKU, Price, Sale Price, Stock, Status, Actions
  - Filter by: Status (active/hidden/archived), Category, Stock level
  - Search by name or SKU
  - Sort by: Name, Price, Stock, Date added

- **Bulk Actions:**
  - Activate selected
  - Hide selected
  - Delete selected

- **Quick Actions:**
  - Edit button → opens product form
  - Duplicate product
  - View on storefront (opens in new tab)
  - Delete with confirmation

- **Stock Indicators:**
  - Green: Stock > 20
  - Yellow: Stock 5-20
  - Red: Stock < 5
  - Gray: Out of stock

#### 2.2 Add/Edit Product (`/app/admin/products/new` or `/app/admin/products/[id]/edit`)

**Features:**
- **Basic Information:**
  - Product name
  - SKU (auto-generated or manual)
  - Description (rich text editor)
  - Category (dropdown + "Add new category" option)

- **Pricing:**
  - Base price
  - Sale price (optional)
  - Discount percentage (auto-calculated)

- **Images:**
  - Multiple image upload (drag & drop)
  - Set primary image
  - Reorder images
  - Image optimization preview

- **Variants:**
  - Add variant types (Size, Color, Material, etc.)
  - Add options for each variant
  - Set prices for specific variant combinations
  - Stock tracking per variant

- **Inventory:**
  - Current stock count
  - Low stock threshold (triggers alert)
  - Supplier (dropdown from supplier list)
  - Purchase price (for profit calculation)
  - Product location/shelf

- **SEO & Visibility:**
  - URL slug (auto-generated from name)
  - Meta description
  - Status: Active, Hidden, Archived

- **Supplier Info:**
  - Select supplier (from dropdown)
  - Purchase price
  - Last restock date

#### 2.3 Categories (`/app/admin/products/categories`)

**Features:**
- Add new category
- Edit category name
- Delete category (with warning if products exist)
- Reorder categories (drag & drop)

---

### 3. 📦 ORDERS & FULFILLMENT

#### 3.1 All Orders (`/app/admin/orders/page.tsx`)

**Features:**
- **Order Table:**
  - Columns: Order #, Customer, Date, Items, Total, Payment, Status, Actions
  - Filter by: Status, Payment status, Date range, Payment method
  - Search by: Order number, customer name, phone

- **Status Badges:**
  - Pending (gray)
  - Processing (blue)
  - Shipped (purple)
  - Delivered (green)
  - Returned (red)

- **Quick Actions:**
  - View details (modal or sidebar)
  - Print invoice
  - Update status (dropdown)
  - Mark as paid
  - Assign courier

- **Bulk Actions:**
  - Mark selected as processing
  - Print multiple invoices
  - Export to CSV

#### 3.2 Pending Orders (`/app/admin/orders/pending`)

**Features:**
- Filtered view of pending orders only
- Quick process button (moves to processing)
- Call customer button (opens phone dialer)
- Notes field for each order

#### 3.3 Delivery Tracking (`/app/admin/orders/tracking`)

**Features:**
- **Courier Integration Panel:**
  - Select courier (Pathao, Steadfast, Redex, etc.)
  - Generate tracking number
  - Assign delivery boy
  - Set estimated delivery date

- **Tracking Status Update:**
  - Update status (pending → picked up → in transit → out for delivery → delivered)
  - Add timestamp for each status
  - Add location/note for each update

- **COD Reconciliation:**
  - Orders awaiting COD collection
  - COD collected checkbox
  - COD amount verification
  - Mark as remitted to client

- **Delivery Boy Management:**
  - Add delivery boy details
  - Assign to order
  - Contact delivery boy button

---

### 4. 👥 CUSTOMERS & LEADS

#### 4.1 All Customers (`/app/admin/customers/page.tsx`)

**Features:**
- **Customer Table:**
  - Columns: Name, Phone, Email, Total Orders, Total Spent, Loyalty Points, Join Date
  - Search by name, phone, email
  - Filter by: Order count, Total spent, Join date

- **Customer Details (Click to expand):**
  - Full profile
  - Order history
  - Saved addresses
  - Loyalty points balance
  - Notes/tags

- **Quick Actions:**
  - Send message
  - View order history
  - Add loyalty points
  - Add note/tag

#### 4.2 Lead Tracker (`/app/admin/customers/leads`)

**Features:**
- **Lead Dashboard:**
  - Total leads count
  - Hot leads (viewed multiple products, added to cart)
  - Warm leads (viewed products)
  - Cold leads (single page visit)

- **Lead Table:**
  - Columns: Name/Phone, Last Visit, Pages Viewed, Products Viewed, Cart Value, Status, Actions
  - Filter by: Status (hot/warm/cold), Date range, Abandoned cart
  - Search by name, phone

- **Lead Details:**
  - Browsing history (pages visited)
  - Products viewed (with images)
  - Time spent on site
  - Abandoned cart items
  - Contact attempts log

- **Lead Actions:**
  - Mark as hot/warm/cold
  - Send follow-up message
  - Add to customer list (if converted)
  - Add tags
  - View session recording

#### 4.3 Session Recordings (`/app/admin/customers/sessions`)

**Features:**
- **Session List:**
  - Date, Visitor ID, Duration, Pages viewed, Converted
  - Filter by: Converted/Not converted, Date range

- **Session Playback:**
  - Timeline of events:
    - Page views
    - Clicks
    - Scroll depth
    - Cart adds/removes
    - Form inputs
  - Heatmap view (where users clicked)
  - Scroll map (how far users scrolled)

- **Session Insights:**
  - Drop-off points
  - Most viewed products in session
  - Cart abandonment reason (if detectable)

---

### 5. 💬 COMMUNICATION CENTER

#### 5.1 Message Inbox (`/app/admin/messages/page.tsx`)

**Features:**
- **Unified Inbox:**
  - All messages from: Website contact form, Facebook Messenger, WhatsApp, Email
  - Columns: Customer, Channel, Preview, Status, Date
  - Filter by: Channel, Status (unread/read/replied), Date

- **Message Thread View:**
  - Full conversation history
  - Customer info sidebar (name, phone, orders)
  - Quick reply box
  - Attach images/files
  - Mark as read/unread
  - Archive conversation

- **Tags & Status:**
  - Add tags: "Hot Lead", "Price Negotiation", "Ready to Buy", "Follow-up Needed"
  - Change status: Unread → Read → Replied → Archived
  - Assign to team member (if multi-user)

- **Quick Actions:**
  - Reply directly
  - Send product link
  - Send order status
  - Create order from conversation

#### 5.2 Auto-Responses (`/app/admin/messages/auto-responses`)

**Features:**
- **Auto-Response List:**
  - Trigger keyword/phrase
  - Response message
  - Active/Inactive toggle
  - Times used counter

- **Add/Edit Auto-Response:**
  - Trigger input (e.g., "price", "stock", "delivery")
  - Response template (with variables like {product_name}, {customer_name})
  - Preview
  - Save & activate

- **Common Auto-Responses (Pre-built):**
  - "Do you have COD?" → "Yes, we offer Cash on Delivery..."
  - "When will I get my order?" → "Orders are delivered within 3-5 days..."
  - "What sizes are available?" → "Please specify the product..."

#### 5.3 Customer Conversations (`/app/admin/messages/conversations`)

**Features:**
- List all unique customers with conversation count
- Click to view full conversation history
- Notes section for each customer
- Conversation analytics:
  - First contact date
  - Total messages sent/received
  - Response time average
  - Conversion status (lead → customer)

---

### 6. 📈 BUSINESS INTELLIGENCE

#### 6.1 Sales Analytics (`/app/admin/analytics/sales`)

**Features:**
- **Revenue Dashboard:**
  - Total revenue (today, this week, this month, all time)
  - Revenue chart (line graph, selectable period)
  - Revenue by product category (pie chart)
  - Revenue by payment method

- **Order Analytics:**
  - Total orders count
  - Average order value
  - Orders by status (pie chart)
  - Orders by city/region

- **Conversion Metrics:**
  - Conversion rate (orders / visitors)
  - Cart abandonment rate
  - Average time to purchase

#### 6.2 Revenue Reports (`/app/admin/analytics/revenue`)

**Features:**
- **Profit & Loss Statement:**
  - Total revenue
  - Cost of goods sold (from purchase prices)
  - Gross profit
  - Operating expenses (courier, ads, etc.)
  - Net profit
  - Profit margin %

- **Expense Breakdown:**
  - Advertising spend
  - Courier charges
  - Supplier payments
  - Other expenses

- **Revenue Trends:**
  - Daily revenue (last 30 days)
  - Monthly revenue (last 12 months)
  - Year-over-year comparison

- **Export Options:**
  - Download as PDF
  - Download as CSV
  - Email report

#### 6.3 Product Performance (`/app/admin/analytics/products`)

**Features:**
- **Top Selling Products:**
  - Product name, units sold, revenue
  - Sort by units sold or revenue

- **Product Metrics Table:**
  - Product, Views, Add to Cart, Purchases, Conversion Rate, Revenue

- **Slow Moving Products:**
  - Products with low sales
  - Days since last sale
  - Suggested actions (discount, promote, remove)

- **Stock Turnover:**
  - Inventory turnover ratio
  - Days to sell through current stock

---

### 7. ⚙️ OPERATIONS & SETTINGS

#### 7.1 Inventory Management (`/app/admin/operations/inventory`)

**Features:**
- **Inventory Dashboard:**
  - Total products tracked
  - Total stock value
  - Low stock alerts count
  - Out of stock count

- **Inventory Table:**
  - Columns: Product, Current Stock, Reorder Point, Supplier, Purchase Price, Location
  - Filter by: Low stock, Out of stock, Supplier
  - Search by product name

- **Stock Adjustments:**
  - Manual stock adjustment (add/remove)
  - Reason selection (purchase, sale, damage, theft, return)
  - Date & note

- **Reorder Alerts:**
  - Products below reorder point
  - Suggested reorder quantity
  - Quick reorder button (creates purchase order)

- **Stock History:**
  - All stock movements for a product
  - Date, type, quantity, note

#### 7.2 Supplier Management (`/app/admin/operations/suppliers`)

**Features:**
- **Supplier List:**
  - Name, Contact, Total Purchases, Outstanding Debt, Actions
  - Search by name
  - Filter by debt status

- **Add/Edit Supplier:**
  - Name, contact person, phone, email, address
  - Payment terms
  - Notes

- **Supplier Details:**
  - Contact information
  - Products supplied (list with purchase prices)
  - Purchase history
  - Payment history
  - Outstanding debt amount

- **Payment Tracking:**
  - Record payment
  - Payment amount
  - Payment method
  - Date
  - Note
  - Update outstanding debt

- **Supplier Performance:**
  - Total purchases
  - On-time delivery rate
  - Product quality notes

#### 7.3 Accounting & Books (`/app/admin/operations/accounting`)

**Features:**
- **Accounting Dashboard:**
  - Total income (this month)
  - Total expenses (this month)
  - Net profit (this month)
  - Bank balance (manual entry)

- **Transaction Log:**
  - All income & expense entries
  - Columns: Date, Type, Category, Description, Amount, Payment Method
  - Filter by: Type, Category, Date range, Payment method
  - Search by description

- **Add Transaction:**
  - Type: Income, Expense, Refund
  - Category dropdown:
    - Income: Sales, Other Income
    - Expense: Advertising, Courier, Supplies, Rent, Utilities, Salaries, Other
  - Amount
  - Description
  - Payment method
  - Date
  - Upload receipt (optional)

- **Invoices & Receipts:**
  - Auto-generate invoice for each order
  - Download invoice PDF
  - Send invoice via email
  - Receipt for supplier payments

- **Tax Reports:**
  - Income summary (for tax filing)
  - Expense summary
  - Export for accountant

- **Reconciliation:**
  - Match bank statements with transactions
  - Mark transactions as reconciled

#### 7.4 Business Settings (`/app/admin/operations/settings`)

**Features:**
- **Business Profile:**
  - Business name
  - Logo upload
  - Contact email
  - Contact phone
  - Business address
  - Social media links (Facebook, Instagram, WhatsApp)

- **Storefront Settings:**
  - Store name (displayed to customers)
  - Store tagline
  - Primary color
  - Secondary color
  - Currency (BDT)

- **Shipping Settings:**
  - Flat rate shipping cost
  - Free shipping threshold
  - Delivery areas (cities)
  - Estimated delivery time

- **Payment Settings:**
  - Enable/disable payment methods:
    - Cash on Delivery
    - bKash (with merchant number)
    - Nagad (with merchant number)
    - Bank transfer

- **Email Templates:**
  - Order confirmation email
  - Order shipped email
  - Order delivered email
  - Use variables: {customer_name}, {order_number}, etc.

- **Notifications:**
  - Email notifications (order placed, low stock, etc.)
  - SMS notifications (order updates)

- **Advanced:**
  - Delete all data (with confirmation)
  - Export all data (JSON download)
  - Import data (JSON upload)

---

## 🔧 UPDATED STORAGE HELPERS

Add these functions to `/lib/storage.ts`:

```typescript
// Lead operations
export const storage = {
  // ... existing functions ...
  
  // LEADS
  getLeads: (clientId: string): Lead[] => {
    return storage.get<Lead[]>(`leads_${clientId}`) || [];
  },
  
  saveLeads: (clientId: string, leads: Lead[]): void => {
    storage.set(`leads_${clientId}`, leads);
  },
  
  addLead: (clientId: string, lead: Lead): void => {
    const leads = storage.getLeads(clientId);
    leads.push(lead);
    storage.saveLeads(clientId, leads);
  },
  
  updateLead: (clientId: string, leadId: string, updates: Partial<Lead>): void => {
    const leads = storage.getLeads(clientId);
    const index = leads.findIndex(l => l.id === leadId);
    if (index !== -1) {
      leads[index] = { ...leads[index], ...updates };
      storage.saveLeads(clientId, leads);
    }
  },
  
  // MESSAGES
  getMessages: (clientId: string): Message[] => {
    return storage.get<Message[]>(`messages_${clientId}`) || [];
  },
  
  saveMessages: (clientId: string, messages: Message[]): void => {
    storage.set(`messages_${clientId}`, messages);
  },
  
  addMessage: (clientId: string, message: Message): void => {
    const messages = storage.getMessages(clientId);
    messages.unshift(message); // Add to beginning for latest first
    storage.saveMessages(clientId, messages);
  },
  
  markMessageAsRead: (clientId: string, messageId: string): void => {
    const messages = storage.getMessages(clientId);
    const message = messages.find(m => m.id === messageId);
    if (message) {
      message.status = 'read';
      message.readAt = new Date().toISOString();
      storage.saveMessages(clientId, messages);
    }
  },
  
  // AUTO RESPONSES
  getAutoResponses: (clientId: string): AutoResponse[] => {
    return storage.get<AutoResponse[]>(`auto_responses_${clientId}`) || [];
  },
  
  saveAutoResponses: (clientId: string, autoResponses: AutoResponse[]): void => {
    storage.set(`auto_responses_${clientId}`, autoResponses);
  },
  
  addAutoResponse: (clientId: string, autoResponse: AutoResponse): void => {
    const responses = storage.getAutoResponses(clientId);
    responses.push(autoResponse);
    storage.saveAutoResponses(clientId, responses);
  },
  
  // SUPPLIERS
  getSuppliers: (clientId: string): Supplier[] => {
    return storage.get<Supplier[]>(`suppliers_${clientId}`) || [];
  },
  
  saveSuppliers: (clientId: string, suppliers: Supplier[]): void => {
    storage.set(`suppliers_${clientId}`, suppliers);
  },
  
  addSupplier: (clientId: string, supplier: Supplier): void => {
    const suppliers = storage.getSuppliers(clientId);
    suppliers.push(supplier);
    storage.saveSuppliers(clientId, suppliers);
  },
  
  updateSupplier: (clientId: string, supplierId: string, updates: Partial<Supplier>): void => {
    const suppliers = storage.getSuppliers(clientId);
    const index = suppliers.findIndex(s => s.id === supplierId);
    if (index !== -1) {
      suppliers[index] = { ...suppliers[index], ...updates };
      storage.saveSuppliers(clientId, suppliers);
    }
  },
  
  // INVENTORY
  getInventory: (clientId: string): InventoryItem[] => {
    return storage.get<InventoryItem[]>(`inventory_${clientId}`) || [];
  },
  
  saveInventory: (clientId: string, inventory: InventoryItem[]): void => {
    storage.set(`inventory_${clientId}`, inventory);
  },
  
  addInventoryItem: (clientId: string, item: InventoryItem): void => {
    const inventory = storage.getInventory(clientId);
    inventory.push(item);
    storage.saveInventory(clientId, inventory);
  },
  
  updateInventoryItem: (clientId: string, itemId: string, updates: Partial<InventoryItem>): void => {
    const inventory = storage.getInventory(clientId);
    const index = inventory.findIndex(i => i.id === itemId);
    if (index !== -1) {
      inventory[index] = { ...inventory[index], ...updates };
      storage.saveInventory(clientId, inventory);
    }
  },
  
  // ACCOUNTING
  getAccountingEntries: (clientId: string): AccountingEntry[] => {
    return storage.get<AccountingEntry[]>(`accounting_${clientId}`) || [];
  },
  
  saveAccountingEntries: (clientId: string, entries: AccountingEntry[]): void => {
    storage.set(`accounting_${clientId}`, entries);
  },
  
  addAccountingEntry: (clientId: string, entry: AccountingEntry): void => {
    const entries = storage.getAccountingEntries(clientId);
    entries.unshift(entry); // Latest first
    storage.saveAccountingEntries(clientId, entries);
  },
  
  // DELIVERY TRACKING
  getDeliveryTrackings: (clientId: string): DeliveryTracking[] => {
    return storage.get<DeliveryTracking[]>(`delivery_tracking_${clientId}`) || [];
  },
  
  saveDeliveryTrackings: (clientId: string, trackings: DeliveryTracking[]): void => {
    storage.set(`delivery_tracking_${clientId}`, trackings);
  },
  
  addDeliveryTracking: (clientId: string, tracking: DeliveryTracking): void => {
    const trackings = storage.getDeliveryTrackings(clientId);
    trackings.push(tracking);
    storage.saveDeliveryTrackings(clientId, trackings);
  },
  
  updateDeliveryTracking: (clientId: string, trackingId: string, updates: Partial<DeliveryTracking>): void => {
    const trackings = storage.getDeliveryTrackings(clientId);
    const index = trackings.findIndex(t => t.id === trackingId);
    if (index !== -1) {
      trackings[index] = { ...trackings[index], ...updates };
      storage.saveDeliveryTrackings(clientId, trackings);
    }
  },
  
  // REVIEWS
  getReviews: (clientId: string): ProductReview[] => {
    return storage.get<ProductReview[]>(`reviews_${clientId}`) || [];
  },
  
  saveReviews: (clientId: string, reviews: ProductReview[]): void => {
    storage.set(`reviews_${clientId}`, reviews);
  },
  
  addReview: (clientId: string, review: ProductReview): void => {
    const reviews = storage.getReviews(clientId);
    reviews.unshift(review);
    storage.saveReviews(clientId, reviews);
  },
  
  approveReview: (clientId: string, reviewId: string): void => {
    const reviews = storage.getReviews(clientId);
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      review.isApproved = true;
      review.approvedAt = new Date().toISOString();
      storage.saveReviews(clientId, reviews);
    }
  },
};
```

---

## 📦 COMPLETE PROJECT STRUCTURE

```
/app
  /(storefront)
    /page.tsx                           # Homepage with spin wheel
    /products/page.tsx                  # Product listing
    /products/[id]/page.tsx             # Product detail
    /cart/page.tsx                      # Shopping cart
    /checkout/page.tsx                  # Checkout flow
    /account/page.tsx                   # Customer account
    /layout.tsx                         # Storefront layout

  /admin
    /page.tsx                           # 📊 Dashboard
    
    /products
      /page.tsx                         # All products list
      /new/page.tsx                     # Add new product
      /[id]/edit/page.tsx               # Edit product
      /categories/page.tsx              # Category management
    
    /orders
      /page.tsx                         # All orders
      /pending/page.tsx                 # Pending orders only
      /tracking/page.tsx                # Delivery tracking
      /[id]/page.tsx                    # Order details
    
    /customers
      /page.tsx                         # All customers
      /leads/page.tsx                   # Lead tracker
      /sessions/page.tsx                # Session recordings
      /[id]/page.tsx                    # Customer details
    
    /messages
      /page.tsx                         # Message inbox
      /auto-responses/page.tsx          # Auto-response settings
      /conversations/page.tsx           # Customer conversations
    
    /analytics
      /sales/page.tsx                   # Sales analytics
      /revenue/page.tsx                 # Revenue reports
      /products/page.tsx                # Product performance
    
    /operations
      /inventory/page.tsx               # Inventory management
      /suppliers/page.tsx               # Supplier management
      /accounting/page.tsx              # Accounting & books
      /settings/page.tsx                # Business settings
    
    /layout.tsx                         # Admin layout with sidebar

  /auth
    /login/page.tsx                     # Client login
    /signup/page.tsx                    # Client signup

/components
  /storefront
    /SpinWheel.tsx                      # Discount wheel
    /StockTicker.tsx                    # Live stock counter
    /ProductCard.tsx                    # Product display card
    /Cart.tsx                           # Cart widget
    /Chatbot.tsx                        # AI chatbot
    /Notifications.tsx                  # Real-time notifications
  
  /admin
    # Dashboard components
    /MetricCard.tsx                     # Dashboard metric cards
    /RevenueChart.tsx                   # Revenue line chart
    /OrderStatusChart.tsx               # Order pie chart
    
    # Product components
    /ProductForm.tsx                    # Add/edit product form
    /ProductTable.tsx                   # Product list table
    /VariantEditor.tsx                  # Variant management
    /ImageUploader.tsx                  # Multi-image upload
    
    # Order components
    /OrderTable.tsx                     # Order list table
    /OrderDetails.tsx                   # Order detail view
    /StatusUpdater.tsx                  # Order status dropdown
    /InvoiceGenerator.tsx               # Invoice PDF
    
    # Customer components
    /CustomerTable.tsx                  # Customer list
    /LeadCard.tsx                       # Lead detail card
    /SessionPlayer.tsx                  # Session recording player
    
    # Message components
    /MessageInbox.tsx                   # Message list
    /MessageThread.tsx                  # Conversation thread
    /AutoResponseEditor.tsx             # Auto-response form
    
    # Analytics components
    /SalesChart.tsx                     # Sales analytics charts
    /RevenueReport.tsx                  # Revenue report view
    /ProductPerformanceTable.tsx        # Product metrics
    
    # Operations components
    /InventoryTable.tsx                 # Inventory list
    /SupplierForm.tsx                   # Supplier add/edit
    /AccountingForm.tsx                 # Transaction entry
    /StockAdjustment.tsx                # Stock adjustment modal
  
  /shared
    /Button.tsx                         # Reusable button
    /Input.tsx                          # Form input
    /Modal.tsx                          # Modal dialog
    /Badge.tsx                          # Status badge
    /Dropdown.tsx                       # Dropdown select
    /Table.tsx                          # Reusable table
    /Sidebar.tsx                        # Admin sidebar nav

/lib
  /storage.ts                           # ALL localStorage operations
  /types.ts                             # ALL TypeScript interfaces
  /utils.ts                             # Utility functions
  /constants.ts                         # App constants

/hooks
  /useLocalStorage.ts                   # localStorage hook
  /useCart.ts                           # Cart management
  /useAuth.ts                           # Authentication
  /useLeadTracking.ts                   # Lead visitor tracking
  /useMessages.ts                       # Message management
```

---

## 🎯 COMPLETE AI AGENT BUILD COMMAND

```
BUILD COMPLETE WHITE-LABEL E-COMMERCE PLATFORM

TECH STACK:
- Next.js 14+ (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- localStorage ONLY (no external database)

ADMIN PANEL STRUCTURE (7 MAIN SECTIONS):

1. 📊 DASHBOARD
   - Overview with key metrics
   - Revenue charts, order status, recent activity

2. 🛍️ PRODUCTS & CATALOG
   - All Products (list, edit, delete, bulk actions)
   - Add New Product (full form with variants, images, inventory)
   - Categories (add, edit, delete)

3. 📦 ORDERS & FULFILLMENT
   - All Orders (table with filters, search, status updates)
   - Pending Orders (filtered view with quick actions)
   - Delivery Tracking (courier integration, COD reconciliation)

4. 👥 CUSTOMERS & LEADS
   - All Customers (list with order history, loyalty points)
   - Lead Tracker (hot/warm/cold leads, abandoned carts, behavioral data)
   - Session Recordings (visitor tracking with event playback)

5. 💬 COMMUNICATION CENTER
   - Message Inbox (unified inbox from all channels)
   - Auto-Responses (keyword-triggered replies)
   - Customer Conversations (full conversation history)

6. 📈 BUSINESS INTELLIGENCE
   - Sales Analytics (revenue, orders, conversion metrics)
   - Revenue Reports (P&L, expense breakdown, profit margins)
   - Product Performance (top sellers, slow movers, stock turnover)

7. ⚙️ OPERATIONS & SETTINGS
   - Inventory Management (stock tracking, reorder alerts, adjustments)
   - Supplier Management (supplier list, payment tracking, debt management)
   - Accounting & Books (transaction log, invoices, tax reports)
   - Business Settings (profile, storefront, shipping, payments)

STOREFRONT (BUYER-FACING):
- Homepage with spin-to-win wheel (first visit discount)
- Product listing with search and filters
- Product detail with stock ticker ("X people viewing", "Y left in stock")
- Shopping cart with bulk discounts
- Checkout with countdown timer urgency
- Real-time purchase notifications (toast messages)
- AI chatbot with FAQ
- Customer account (optional)

DATA MODELS TO IMPLEMENT:
- Client (business account)
- Product (with variants, images, inventory)
- Order (with items, delivery, payment, status)
- Customer (with addresses, loyalty points, order history)
- Lead (with behavioral tracking, session recordings, abandoned carts)
- Message (unified inbox from all channels)
- AutoResponse (keyword-triggered replies)
- Supplier (with payment history, debt tracking)
- InventoryItem (stock tracking, reorder points)
- AccountingEntry (income/expense transactions)
- DeliveryTracking (courier integration, COD reconciliation)
- ProductReview (ratings, comments, verification)
- Cart (session-based cart)

STORAGE OPERATIONS:
Implement complete storage.ts with ALL operations for:
- Client management (login, signup, session)
- Product CRUD (add, update, delete, get by ID, get all)
- Order management (create, update status, get all, filter)
- Customer management (add, update, get all, search)
- Lead tracking (add, update, convert to customer)
- Message management (add, mark as read, get unread count)
- Auto-response management
- Supplier CRUD and payment tracking
- Inventory tracking and stock adjustments
- Accounting entry logging
- Delivery tracking and COD reconciliation
- Review management and approval

CRITICAL REQUIREMENTS:
1. Every admin page MUST be fully functional (no placeholders)
2. All CRUD operations MUST save to localStorage
3. All tables MUST have search, filter, sort functionality
4. All forms MUST have validation and error handling
5. Use TypeScript strictly (no 'any' types)
6. Every component MUST be responsive (mobile + desktop)
7. Implement proper loading states for all async operations
8. Add proper error handling for all operations
9. Include seed data function (demo account + sample data)
10. Make the UI professional with consistent Tailwind styling

STYLING GUIDELINES:
- Primary color: Blue (#3b82f6)
- Success: Green (#10b981)
- Warning: Orange (#f59e0b)
- Danger: Red (#ef4444)
- Rounded corners (rounded-lg)
- Shadow on hover
- Smooth transitions
- Mobile-first responsive design

SEED DATA:
- 1 demo client (demo@example.com / demo123)
- 10 sample products with variants
- 5 sample orders (different statuses)
- 3 sample customers
- 5 sample leads (with behavioral data)
- 3 sample messages
- 2 sample suppliers
- Sample auto-responses
- Sample accounting entries

DO NOT:
- Add any external dependencies beyond Next.js, React, TypeScript, Tailwind
- Skip any features marked in the admin sections
- Use server components for localStorage operations (use 'use client')
- Create API routes (localStorage only)
- Add authentication libraries (simple localStorage check)
- Over-engineer (keep it simple with localStorage)

BUILD EVERYTHING IN ONE SESSION. MAKE IT PRODUCTION-READY.
```

---

## ✅ ACCEPTANCE CRITERIA CHECKLIST

### Authentication
- [ ] Can signup new client with business details
- [ ] Can login with demo credentials (demo@example.com / demo123)
- [ ] Admin routes protected (redirect to login if not authenticated)
- [ ] Logout clears session and redirects to login

### Dashboard
- [ ] Shows total revenue, orders, products, customers, leads, unread messages
- [ ] Revenue chart displays last 30 days
- [ ] Recent orders table shows last 10 orders
- [ ] Quick stats show today vs yesterday comparison

### Products & Catalog
- [ ] Can view all products in table
- [ ] Can add new product with variants and images
- [ ] Can edit existing product
- [ ] Can delete product with confirmation
- [ ] Can manage categories (add, edit, delete)
- [ ] Stock indicators show correct colors

### Orders & Fulfillment
- [ ] Can view all orders with filters
- [ ] Can update order status from dropdown
- [ ] Can view order details in modal
- [ ] Pending orders page shows only pending orders
- [ ] Can assign courier and tracking number
- [ ] Can update delivery status
- [ ] Can mark COD as collected and remitted

### Customers & Leads
- [ ] Can view all customers with order history
- [ ] Can view lead tracker with hot/warm/cold status
- [ ] Can view lead details with browsing history
- [ ] Can view session recordings with event timeline
- [ ] Can convert lead to customer
- [ ] Can add tags to leads

### Communication Center
- [ ] Can view all messages in unified inbox
- [ ] Can mark messages as read/unread
- [ ] Can reply to messages
- [ ] Can add auto-response with trigger and response
- [ ] Auto-responses show usage count
- [ ] Can view conversation history per customer

### Business Intelligence
- [ ] Sales analytics shows revenue trends
- [ ] Revenue reports show P&L statement
- [ ] Product performance shows top sellers
- [ ] Charts display correctly (line, pie, bar)
- [ ] Can export reports as PDF/CSV

### Operations
- [ ] Inventory management shows all products with stock
- [ ] Can adjust stock with reason
- [ ] Low stock alerts show correctly
- [ ] Can add and edit suppliers
- [ ] Can record supplier payments
- [ ] Outstanding debt calculates correctly
- [ ] Can add accounting entries (income/expense)
- [ ] Transaction log shows all entries with filters
- [ ] Business settings can update profile, logo, colors

### Storefront
- [ ] Homepage shows products and spin wheel on first visit
- [ ] Spin wheel animates and gives discount
- [ ] Product detail shows stock ticker
- [ ] Can add products to cart with variants
- [ ] Cart shows items with quantity controls
- [ ] Checkout creates order and saves to localStorage
- [ ] Order appears in admin panel immediately
- [ ] Real-time notifications appear every 30-90s
- [ ] Chatbot opens with FAQ responses

### Data Persistence
- [ ] All operations save to localStorage
- [ ] Page refresh preserves all data
- [ ] Logout and login preserves data
- [ ] Seed data creates demo account and sample data

### UI/UX
- [ ] Responsive on mobile and desktop
- [ ] Consistent Tailwind styling throughout
- [ ] Smooth animations and transitions
- [ ] Loading states on all async operations
- [ ] Error messages on validation failures
- [ ] Success messages on successful operations

---

This is your COMPLETE specification. Build the full platform with ALL features functional.
