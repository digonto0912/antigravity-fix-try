# AI AGENT BUILD COMMAND - COMPLETE SYSTEM
## Copy-Paste This Entire Prompt to Your AI Coding Agent

---

## 🎯 BUILD COMPLETE WHITE-LABEL E-COMMERCE PLATFORM

You are building a production-ready white-label e-commerce platform with a comprehensive admin panel and storefront. This is NOT a skeleton or prototype - every feature must be fully functional.

---

## TECH STACK (NON-NEGOTIABLE)

- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript (strict mode, no 'any' types)
- **Styling:** Tailwind CSS only
- **Database:** localStorage (temporary, will migrate to real DB later)
- **State Management:** React useState/useEffect only (NO Zustand, Redux, React Query)
- **Authentication:** Simple localStorage check (NO NextAuth, Auth0)

**DO NOT add any other dependencies. Use only what's listed above.**

---

## ADMIN PANEL - 7 MAIN SECTIONS WITH FULL FUNCTIONALITY

### 1. 📊 DASHBOARD (`/app/admin/page.tsx`)

**Top Metrics (6 cards):**
- Total Revenue (this month) - calculated from orders
- Total Orders (with breakdown: pending/processing/shipped/delivered)
- Total Products (active count)
- Total Customers (registered count)
- Hot Leads (leads with status 'hot')
- Unread Messages (messages with status 'unread')

**Quick Stats (4 cards):**
- Today's Revenue vs Yesterday (percentage change)
- Conversion Rate (orders / visitors %)
- Average Order Value (total revenue / order count)
- Cart Abandonment Rate (abandoned carts / total sessions %)

**Charts (3 visualizations):**
- Revenue Trend: Line chart showing daily revenue for last 30 days
- Orders by Status: Pie chart (pending, processing, shipped, delivered, returned)
- Top 5 Products: Bar chart showing revenue by product

**Recent Activity (table):**
- Last 10 orders with: Order #, Customer, Total, Status, Date
- Quick action: Update status dropdown on each row

**Low Stock Alerts (list):**
- Products with stock < 10
- Show: Product name, Current stock, Reorder point

---

### 2. 🛍️ PRODUCTS & CATALOG

#### 2.1 All Products (`/app/admin/products/page.tsx`)

**Features:**
- Product table with columns: Image, Name, SKU, Category, Price, Sale Price, Stock, Status, Actions
- Filters: Status (active/hidden/archived), Category, Stock level (in stock/low stock/out of stock)
- Search: By name or SKU (real-time)
- Sort: By name, price, stock, date added (asc/desc)
- Bulk actions: Select multiple → Activate/Hide/Delete selected
- Stock indicators: 
  - Green badge (stock > 20)
  - Yellow badge (stock 5-20)
  - Red badge (stock < 5)
  - Gray badge (stock = 0)
- Actions per row:
  - Edit (opens edit form)
  - Duplicate (creates copy)
  - View on storefront (opens product page in new tab)
  - Delete (with confirmation modal)

#### 2.2 Add/Edit Product (`/app/admin/products/new` or `/app/admin/products/[id]/edit`)

**Form sections:**

1. **Basic Info:**
   - Product name (required)
   - SKU (auto-generated from name, editable)
   - Description (textarea, 500 chars max)
   - Category (dropdown from categories + "Add new" button)

2. **Pricing:**
   - Base price (required, number)
   - Sale price (optional, must be less than base)
   - Discount % (auto-calculated if sale price exists)

3. **Images:**
   - Multiple image upload (drag & drop or click to select)
   - Show preview thumbnails
   - Set primary image (first is default)
   - Reorder images (drag & drop)
   - Delete image button on each

4. **Variants:**
   - Add variant type button (e.g., "Size", "Color", "Material")
   - For each variant type:
     - Variant name input
     - Add options (e.g., for Size: S, M, L, XL)
     - Option input with "Add" button
   - Display variant combinations (if Size: S,M,L and Color: Red,Blue = 6 combinations)
   - Option to set different prices per combination

5. **Inventory:**
   - Current stock (number input)
   - Low stock threshold (number, triggers alert)
   - Supplier (dropdown from supplier list + "Add new" button)
   - Purchase price (for profit calculation)
   - Product location/shelf (optional text)

6. **SEO & Visibility:**
   - URL slug (auto-generated from name, editable)
   - Meta description (for SEO)
   - Status radio buttons: Active, Hidden, Archived

7. **Actions:**
   - Save button (validates all required fields)
   - Save & Add Another button
   - Cancel button (goes back to products list)

#### 2.3 Categories (`/app/admin/products/categories`)

**Features:**
- Category list table: Name, Product Count, Actions
- Add category button → modal with name input
- Edit category → inline edit or modal
- Delete category → confirmation modal (warn if products exist, offer to reassign)
- Drag & drop reorder (updates display order)

---

### 3. 📦 ORDERS & FULFILLMENT

#### 3.1 All Orders (`/app/admin/orders/page.tsx`)

**Features:**
- Order table columns: Order #, Customer Name, Phone, Date, Items (count), Total, Payment Method, Payment Status, Delivery Status, Actions
- Filters:
  - Status: All, Pending, Processing, Shipped, Delivered, Returned
  - Payment status: All, Pending, Paid, Failed
  - Date range: Today, This week, This month, Custom range
  - Payment method: All, COD, bKash, Nagad
- Search: By order number, customer name, or phone
- Sort: By date, total amount, status
- Status badges with colors:
  - Pending (gray)
  - Processing (blue)
  - Shipped (purple)
  - Delivered (green)
  - Returned (red)
- Actions per row:
  - View details (opens modal/sidebar with full order info)
  - Update status (dropdown: pending → processing → shipped → delivered)
  - Print invoice (generates PDF)
  - Mark as paid (if payment status is pending)
  - Assign courier (opens delivery tracking form)
- Bulk actions: Select multiple → Update status, Print invoices, Export to CSV

**Order Details Modal:**
- Order number, date, status
- Customer info: Name, phone, address, city
- Order items table: Product, Variant, Quantity, Price, Total
- Pricing breakdown: Subtotal, Discount, Shipping, Total
- Payment info: Method, Status
- Delivery info: Courier, Tracking number, Estimated delivery
- Status history timeline
- Actions: Update status, Print invoice, Contact customer

#### 3.2 Pending Orders (`/app/admin/orders/pending`)

**Features:**
- Filtered view showing only pending orders
- Same table structure as All Orders
- Quick actions:
  - Process button (changes status to processing)
  - Call customer button (opens phone dialer with customer phone)
  - Add note (textarea for order notes)
- Auto-refresh every 30 seconds for new orders

#### 3.3 Delivery Tracking (`/app/admin/orders/tracking`)

**Features:**
- Two sections: Assign Courier (top) and Track Deliveries (bottom)

**Assign Courier Form:**
- Select order (dropdown of orders with status 'processing')
- Courier service dropdown: Pathao, Steadfast, Redex, Sundarban, Other
- Tracking number input
- Delivery boy name input
- Delivery boy phone input
- Estimated delivery date picker
- Delivery charge input
- Assign button (updates order and creates delivery tracking)

**Track Deliveries Table:**
- Columns: Order #, Customer, Courier, Tracking #, Status, Estimated Delivery, COD Amount, Actions
- Status filter: All, Pending, Picked Up, In Transit, Out for Delivery, Delivered, Returned
- Actions per row:
  - Update status (dropdown with status options)
  - Add status note (modal with timestamp + location + note)
  - View history (modal showing status timeline)
  - Mark COD collected (checkbox)
  - Mark COD remitted (checkbox, only if collected)

**COD Reconciliation Section:**
- List orders awaiting COD collection
- Show: Order #, Customer, COD Amount, Collected checkbox, Remitted checkbox
- Summary: Total COD pending, Total collected, Total remitted

---

### 4. 👥 CUSTOMERS & LEADS

#### 4.1 All Customers (`/app/admin/customers/page.tsx`)

**Features:**
- Customer table columns: Name, Phone, Email, Total Orders, Total Spent, Loyalty Points, Join Date, Actions
- Search: By name, phone, or email
- Filter: By total spent (0-1k, 1k-5k, 5k-10k, 10k+), Order count (1, 2-5, 5+), Join date
- Sort: By name, total spent, order count, join date
- Actions per row:
  - View details (expands row or opens modal)
  - Send message (opens message compose)
  - View orders (filtered order list for this customer)
  - Add loyalty points (modal with points and reason)
  - Add tag (modal with tag input)

**Customer Details Panel:**
- Full profile: Name, phone, email, join date
- Order history table: Order #, Date, Total, Status
- Saved addresses list: Address, City, Default badge
- Loyalty points: Current balance, History of points earned/redeemed
- Tags list
- Notes section (add/edit notes)

#### 4.2 Lead Tracker (`/app/admin/customers/leads`)

**Features:**
- Lead stats dashboard (top):
  - Total leads count
  - Hot leads (viewed 3+ products or added to cart)
  - Warm leads (viewed 1-2 products)
  - Cold leads (single page visit)
  - Conversion rate (leads converted to customers %)

- Lead table columns: Name/Phone, Status, Last Visit, Total Visits, Pages Viewed, Products Viewed, Cart Value, Tags, Actions
- Filter: By status (hot/warm/cold), Date range, Has abandoned cart
- Search: By name or phone
- Sort: By last visit, total visits, cart value

- Status badges:
  - Hot (red)
  - Warm (orange)
  - Cold (blue)

- Actions per row:
  - View details (expands to show full lead info)
  - Change status (dropdown: hot/warm/cold)
  - Send message (opens message form)
  - Convert to customer (creates customer account)
  - Add tag (modal)
  - View session (opens session recording)

**Lead Details Panel:**
- Contact info: Name, phone, email, location
- Browsing history: List of pages visited with timestamps
- Products viewed: Grid of products with images
- Abandoned cart (if exists): Items, total value, abandoned date
- Session statistics: Time on site, pages viewed, visit count
- Tags
- Contact attempts log: List of messages sent
- Convert to customer button

#### 4.3 Session Recordings (`/app/admin/customers/sessions`)

**Features:**
- Session list table: Date, Visitor ID (name/phone if known), Duration, Pages Viewed, Converted (yes/no), Actions
- Filter: By converted/not converted, Date range
- Sort: By date, duration

- Actions per row:
  - Play session (opens session player)

**Session Player:**
- Timeline showing all events:
  - Page views (icon + page name + timestamp)
  - Clicks (icon + element clicked + timestamp)
  - Scroll depth (percentage scrolled)
  - Cart adds (product name + timestamp)
  - Cart removes (product name + timestamp)
  - Form inputs (field name, not values for privacy)
- Play/pause controls
- Speed controls (1x, 2x, 4x)
- Event filter (show only certain event types)
- Heatmap view (where user clicked most)
- Scroll map (how far user scrolled on each page)

---

### 5. 💬 COMMUNICATION CENTER

#### 5.1 Message Inbox (`/app/admin/messages/page.tsx`)

**Features:**
- Message list table: Customer Name, Channel, Message Preview, Status, Date, Actions
- Channel badges: Website (blue), Facebook (blue), WhatsApp (green), Email (gray)
- Status badges: Unread (red), Read (gray), Replied (green), Archived (gray)
- Filter: By channel, By status, Date range
- Search: By customer name or message content
- Sort: By date (newest first default)

- Actions per row:
  - View/Reply (opens message thread panel)
  - Mark as read/unread (toggle)
  - Archive (removes from inbox)

**Message Thread Panel (slides in from right):**
- Customer info header: Name, phone, email, total orders
- Conversation history: All messages between client and customer (scrollable)
  - Each message shows: Direction (incoming/outgoing), Content, Timestamp
  - If has attachments, show images/files
- Reply box at bottom:
  - Textarea for message content
  - Attach image/file button
  - Send button
- Quick actions sidebar:
  - Send product link (dropdown of products → inserts link in message)
  - Send order status (dropdown of customer orders → inserts status)
  - Apply tag (dropdown)
  - Create order from conversation (if discussing products)

#### 5.2 Auto-Responses (`/app/admin/messages/auto-responses`)

**Features:**
- Auto-response list table: Trigger Keyword, Response Preview, Status (Active/Inactive), Times Used, Actions
- Filter: By status (active/inactive)
- Search: By trigger or response
- Add auto-response button (opens form)

- Actions per row:
  - Edit (opens form)
  - Toggle active/inactive
  - Delete (with confirmation)
  - View usage stats

**Add/Edit Auto-Response Form:**
- Trigger keyword/phrase input (e.g., "price", "stock", "delivery time")
- Response template textarea (supports variables: {customer_name}, {product_name}, {business_name})
- Preview section (shows how response will look with sample data)
- Active toggle
- Save button

**Pre-built Common Auto-Responses:**
- "Do you have COD?" → "Yes, we offer Cash on Delivery throughout Bangladesh..."
- "When will I get my order?" → "Hi {customer_name}, orders are typically delivered within 3-5 business days..."
- "What sizes are available?" → "Please let me know which product you're interested in..."
- "What's your return policy?" → "We accept returns within 7 days..."

#### 5.3 Customer Conversations (`/app/admin/messages/conversations`)

**Features:**
- List all unique customers with conversation count
- Customer card shows: Name, phone, total messages, last message date, conversation status
- Click card to view full conversation history
- Filter: By conversation status (active/resolved), Date range
- Search: By customer name or phone

**Conversation View:**
- Full message history (all messages with this customer)
- Message count and date range
- Notes section for internal notes about this customer
- Conversation analytics:
  - First contact date
  - Total messages sent/received
  - Average response time
  - Conversion status (lead/customer)
  - Related orders (if customer purchased)

---

### 6. 📈 BUSINESS INTELLIGENCE

#### 6.1 Sales Analytics (`/app/admin/analytics/sales`)

**Features:**
- Revenue dashboard (top section):
  - Total revenue cards: Today, This Week, This Month, All Time
  - Each card shows amount and percentage change from previous period
  
- Revenue chart:
  - Line graph showing revenue over time
  - Period selector: Last 7 days, Last 30 days, Last 3 months, Last year
  - Hover tooltip showing exact amount per day
  
- Revenue breakdown charts:
  - Revenue by category (pie chart)
  - Revenue by payment method (bar chart: COD, bKash, Nagad)
  - Revenue by city (bar chart: top 10 cities)

- Order analytics section:
  - Total orders count
  - Average order value (AOV)
  - Orders by status (pie chart: pending, processing, shipped, delivered, returned)
  - Orders trend (line graph over time)

- Conversion metrics:
  - Total visitors (from lead tracking)
  - Conversion rate (orders / visitors %)
  - Cart abandonment rate (abandoned carts / total carts %)
  - Average time to purchase (from first visit to order)

#### 6.2 Revenue Reports (`/app/admin/analytics/revenue`)

**Features:**
- Period selector: This Month, Last Month, This Quarter, Last Quarter, This Year, Custom Range

- Profit & Loss Statement:
  - Revenue section:
    - Total sales revenue
    - Other income (if any)
    - **Total Revenue**
  - Cost of Goods Sold:
    - Product purchase costs (from inventory purchase prices)
    - **Total COGS**
  - **Gross Profit** (Revenue - COGS)
  - Operating Expenses:
    - Advertising spend
    - Courier charges
    - Platform fees
    - Other expenses
    - **Total Expenses**
  - **Net Profit** (Gross Profit - Operating Expenses)
  - **Profit Margin %** (Net Profit / Total Revenue × 100)

- Expense breakdown:
  - Pie chart showing expense categories
  - Table: Category, Amount, % of Total

- Revenue trends:
  - Daily revenue chart (last 30 days)
  - Monthly revenue chart (last 12 months)
  - Year-over-year comparison (if data exists)

- Export options:
  - Download as PDF (formatted report)
  - Download as CSV (raw data)
  - Email report (sends to client email)

#### 6.3 Product Performance (`/app/admin/analytics/products`)

**Features:**
- Top selling products section:
  - Product name, Image, Units sold, Revenue
  - Sort by: Units sold or Revenue
  - Top 10 shown

- Product metrics table (all products):
  - Product, Views, Add to Cart, Purchases, Conversion Rate, Revenue
  - Conversion Rate = (Purchases / Views) × 100
  - Sort by any column

- Slow moving products section:
  - Products with low sales in last 30 days
  - Show: Product, Last sale date, Days since last sale, Current stock
  - Suggested actions: Discount, Promote, Remove

- Stock turnover analysis:
  - Inventory turnover ratio (Cost of Goods Sold / Average Inventory)
  - Days to sell through current stock
  - Products with high vs low turnover

---

### 7. ⚙️ OPERATIONS & SETTINGS

#### 7.1 Inventory Management (`/app/admin/operations/inventory`)

**Features:**
- Inventory dashboard (top):
  - Total products tracked
  - Total stock value (sum of stock × purchase price)
  - Low stock alerts count
  - Out of stock count

- Inventory table:
  - Columns: Product Image, Product Name, Current Stock, Reorder Point, Supplier, Purchase Price, Stock Value, Location, Actions
  - Filter: Low stock (below reorder point), Out of stock, By supplier
  - Search: By product name
  - Sort: By stock, value, supplier

- Stock level indicators:
  - Green: Stock > reorder point
  - Yellow: Stock = reorder point
  - Red: Stock < reorder point
  - Gray: Out of stock

- Actions per row:
  - Adjust stock (opens adjustment modal)
  - View history (shows all stock movements)
  - Set reorder point (inline edit)

**Stock Adjustment Modal:**
- Product name (read-only)
- Current stock (read-only)
- Adjustment type dropdown: Purchase, Sale, Damage, Theft, Return, Manual Correction
- Quantity: + or - number input
- New stock (auto-calculated)
- Date picker
- Note/reason textarea
- Save button (updates inventory and logs in history)

**Reorder Alerts Section:**
- Products below reorder point
- Show: Product, Current stock, Reorder point, Suggested reorder quantity
- Quick reorder button (creates purchase order or note to restock)

**Stock History (per product):**
- Table: Date, Type (purchase/sale/adjustment), Quantity, Running Balance, Note
- Filter by: Type, Date range

#### 7.2 Supplier Management (`/app/admin/operations/suppliers`)

**Features:**
- Supplier list table:
  - Columns: Name, Contact Person, Phone, Email, Total Purchases, Outstanding Debt, Actions
  - Filter: Has debt (yes/no), By total purchases
  - Search: By name or phone

- Outstanding debt indicator:
  - Green: No debt
  - Yellow: Debt < 10,000
  - Red: Debt > 10,000

- Actions per row:
  - View details (expands or opens panel)
  - Edit (opens form)
  - Record payment (opens payment modal)
  - Delete (with confirmation, only if no products linked)

**Add/Edit Supplier Form:**
- Supplier name (required)
- Contact person name
- Phone (required)
- Email
- Address
- Payment terms (e.g., "Net 30 days")
- Notes
- Save button

**Supplier Details Panel:**
- Contact information
- Financial summary:
  - Total purchases (all time)
  - Total paid (sum of all payments)
  - Outstanding debt (purchases - paid)
- Products supplied (list with purchase prices)
- Purchase history table: Date, Amount, Note
- Payment history table: Date, Amount, Method, Note
- Record payment button

**Record Payment Modal:**
- Supplier name (read-only)
- Outstanding debt (read-only)
- Payment amount input
- Payment date picker
- Payment method dropdown: Cash, Bank Transfer, bKash, Nagad
- Note/reference textarea
- Save button (reduces outstanding debt)

#### 7.3 Accounting & Books (`/app/admin/operations/accounting`)

**Features:**
- Accounting dashboard (top):
  - Total income (this month)
  - Total expenses (this month)
  - Net profit (income - expenses)
  - Bank balance (manual entry field)

- Transaction log table:
  - Columns: Date, Type (Income/Expense/Refund), Category, Description, Amount, Payment Method, Actions
  - Filter: By type, By category, Date range, Payment method
  - Search: By description

- Type badges:
  - Income (green)
  - Expense (red)
  - Refund (orange)

- Actions per row:
  - Edit (opens form)
  - Delete (with confirmation)
  - View receipt (if uploaded)

**Add Transaction Form (modal or page):**
- Transaction type radio: Income, Expense, Refund
- Category dropdown (changes based on type):
  - If Income: Sales, Other Income
  - If Expense: Advertising, Courier, Supplies, Rent, Utilities, Salaries, Supplier Payment, Other
  - If Refund: Customer Refund
- Amount input (required)
- Description textarea (required)
- Payment method dropdown: Cash, bKash, Nagad, Bank Transfer
- Date picker
- Upload receipt button (optional, stores image URL)
- Related order (if type is Sales/Refund, link to order)
- Related supplier (if category is Supplier Payment)
- Save button

**Invoices & Receipts Section:**
- Auto-generate invoice for each order
- Invoice list table: Invoice #, Order #, Customer, Amount, Date, Status (Paid/Unpaid)
- Actions:
  - Download PDF
  - Send via email
  - Mark as paid

**Tax Reports Section:**
- Income summary:
  - Total sales (this month/year)
  - Other income (this month/year)
  - Total income
- Expense summary (by category)
- Profit summary
- Export button (generates tax-ready CSV)

#### 7.4 Business Settings (`/app/admin/operations/settings`)

**Features:**
- Multiple tabs or sections:

**1. Business Profile:**
- Business name input
- Logo upload (drag & drop or click)
- Logo preview
- Contact email input
- Contact phone input
- Business address textarea
- Social media links:
  - Facebook page URL
  - Instagram profile URL
  - WhatsApp number
- Save button

**2. Storefront Settings:**
- Store name (displayed to customers)
- Store tagline
- Primary color picker (affects buttons, links)
- Secondary color picker (affects accents)
- Currency (BDT, fixed)
- Save button

**3. Shipping Settings:**
- Flat rate shipping cost (number input)
- Free shipping threshold (e.g., "Free shipping on orders over 1000tk")
- Delivery areas (multi-select or tags): Dhaka, Chittagong, Sylhet, Rajshahi, Khulna, Barisal, etc.
- Estimated delivery time (e.g., "3-5 business days")
- Save button

**4. Payment Settings:**
- Enable/disable payment methods (toggles):
  - Cash on Delivery (default enabled)
  - bKash (with merchant number input)
  - Nagad (with merchant number input)
  - Bank Transfer (with account details)
- Payment instructions (for each method, shown to customers)
- Save button

**5. Email Templates:**
- Template editor for:
  - Order confirmation email
  - Order shipped email
  - Order delivered email
- Each template has:
  - Subject line input
  - Message body textarea (supports variables: {customer_name}, {order_number}, {tracking_number}, {business_name})
  - Preview section
  - Save button

**6. Notifications:**
- Email notification toggles:
  - New order placed
  - Low stock alert
  - New customer registered
  - New message received
- SMS notification toggles (same as above)
- Notification email address (where to send admin alerts)
- Save button

**7. Advanced:**
- Delete all data button:
  - Shows confirmation modal with warning
  - Requires typing "DELETE" to confirm
  - Clears all localStorage except client account
- Export all data button:
  - Downloads JSON file with all data
- Import data button:
  - Upload JSON file to restore data
- Save button

---

## STOREFRONT (BUYER-FACING PAGES)

### Homepage (`/app/(storefront)/page.tsx`)

**Features:**
- Hero section:
  - Business name/logo
  - Tagline
  - Shop Now button
- **Spin-to-Win Modal** (appears on first visit):
  - Check localStorage for 'spin_wheel_shown' flag
  - If not shown, display modal after 2 seconds
  - Spinning wheel with 6 segments: 5%, 10%, 15%, 20%, 25%, FREE SHIPPING
  - Spin button
  - Wheel animation (CSS or Canvas)
  - Always lands on a discount (weighted random, minimum 10%)
  - Show winning discount in modal: "Congratulations! You won 15% off!"
  - Save discount to localStorage with 15-minute expiry
  - Show countdown timer: "Your discount expires in 14:32"
  - Close button (discount saved anyway)
  - Set 'spin_wheel_shown' flag to prevent re-showing
- Featured products grid (6-8 products):
  - Product cards with:
    - Image
    - Name
    - ~~Base price~~ Sale price
    - "40% OFF" badge (if salePrice exists)
    - Add to Cart button
    - Quick view button (opens modal with product details)

### Product Listing (`/app/(storefront)/products/page.tsx`)

**Features:**
- Category filter (sidebar or top)
- Price range filter (slider: 0 - max price)
- Search bar
- Sort dropdown: Featured, Price: Low to High, Price: High to Low, Newest
- Product grid (responsive: 1 col mobile, 2 cols tablet, 3-4 cols desktop)
- Pagination (if > 20 products)
- Empty state if no products match filters

### Product Detail (`/app/(storefront)/products/[id]/page.tsx`)

**Features:**
- Product image gallery:
  - Large main image
  - Thumbnail navigation (if multiple images)
  - Click thumbnail to change main image
  - Zoom on hover (optional)
- Product info:
  - Product name
  - Price display: ~~Base price~~ Sale price
  - Discount badge (if sale price)
  - Star rating (from reviews, average)
  - Review count (link to reviews section)
- **Stock Ticker Component:**
  - "X people viewing right now" (random 3-8, updates every 30s)
  - "Only Y left in stock" (real inventory count)
  - "Z sold in last hour" (simulated 1-5)
  - Animated counter effect
  - Red warning badge if inventory < 10
- Variant selectors:
  - For each variant type (Size, Color, etc.), show dropdown or radio buttons
  - Selected variant affects price if variant-specific pricing exists
- Quantity selector (+ and - buttons, 1-10)
- Add to Cart button:
  - Disabled if out of stock
  - Shows "Out of Stock" text if inventory = 0
  - On click: Adds to cart, shows success toast
- Description section (collapsible or tabs):
  - Full product description
  - Specifications (if any)
- Reviews section:
  - List approved reviews
  - Star rating, customer name, comment
  - Verified purchase badge
  - Show photos if review has images
  - "Write a Review" button (if customer logged in and purchased)

### Shopping Cart (`/app/(storefront)/cart/page.tsx`)

**Features:**
- Cart items list:
  - Product image
  - Product name
  - Variant (if selected)
  - Price per unit
  - Quantity selector (+ / -, update cart on change)
  - Line total (quantity × price)
  - Remove button (X icon)
- Empty cart state (if no items):
  - "Your cart is empty"
  - "Continue Shopping" button
- Cart summary (right sidebar on desktop):
  - Subtotal (sum of all line totals)
  - Discount (from spin wheel if valid, or from discount code)
  - Shipping (flat 60tk, or "FREE" if over threshold)
  - Total
- Discount code input:
  - Text input for code
  - Apply button
  - Show error if invalid
  - Show success if valid
- **Bulk Discount Message:**
  - If cart has 2+ items: "Buy 2 or more: Save 100tk!" (badge or banner)
- Checkout button (bottom or in summary)

### Checkout (`/app/(storefront)/checkout/page.tsx`)

**Features:**
- Two-column layout (form left, summary right):

**Left: Delivery Information Form:**
- Full name input (required)
- Phone number input (required, validate BD phone format)
- Full address textarea (required)
- City dropdown (required): Dhaka, Chittagong, Sylhet, Rajshahi, Khulna, Barisal, etc.
- Save address checkbox (if customer logged in)

**Right: Order Summary:**
- List cart items (product name, quantity, price)
- Subtotal
- Discount (if any)
- Shipping cost
- Total
- **Timer Component:**
  - "Complete your order in 6:00 for 10% extra off!"
  - Countdown timer (6 minutes)
  - Red text when < 1 minute
  - If timer expires, offer smaller discount or remove timer discount

**Payment Method Selector:**
- Radio buttons or cards:
  - Cash on Delivery (default selected)
  - bKash (shows merchant number, "Pay when order is confirmed")
  - Nagad (same as bKash)
- Payment instructions text (from settings)

**Place Order Button:**
- Validate all required fields
- On click:
  1. Generate order number (ORD-XXXXX format)
  2. Create order object with all data
  3. Save order to localStorage (storage.addOrder)
  4. If customer exists, link order to customer
  5. If new customer, create customer account (optional)
  6. Reduce product inventory (storage.updateProduct)
  7. Clear cart (storage.clearCart)
  8. Redirect to order confirmation page

**Order Confirmation Page:**
- Success message: "Thank you for your order!"
- Order number: "Order #ORD-12345"
- Estimated delivery: "Expected delivery in 3-5 days"
- Order summary (items, total)
- Payment instructions (if bKash/Nagad, show how to pay)
- "Track Order" button (goes to order tracking page, if implemented)
- "Continue Shopping" button

---

## PSYCHOLOGICAL TRIGGER COMPONENTS

### 1. Spin Wheel (`/components/storefront/SpinWheel.tsx`)

**Implementation:**
- Canvas-based wheel or CSS transform animation
- 6 segments with colors: 5% (purple), 10% (blue), 15% (green), 20% (yellow), 25% (orange), FREE SHIPPING (red)
- Center spin button
- Pointer/arrow at top
- On click:
  1. Disable button
  2. Generate random outcome (weighted: 10-15% most likely, 5% and 25% less likely)
  3. Calculate rotation degrees to land on selected segment
  4. Apply CSS rotation animation (3 seconds, ease-out)
  5. On animation end:
     - Show winning result modal
     - Save to localStorage: { discount: 15, expiresAt: Date.now() + 15*60*1000 }
     - Start 15-minute countdown timer
  6. Close wheel modal
- Countdown timer component:
  - Shows "Your 15% discount expires in MM:SS"
  - Updates every second
  - Red text when < 2 minutes
  - On expiry, remove discount from localStorage

### 2. Stock Ticker (`/components/storefront/StockTicker.tsx`)

**Implementation:**
- Display section on product page (near Add to Cart)
- Three stats with icons:
  - 👁️ "X people viewing right now" (random 2-9, updates every 30 seconds)
  - 🔥 "Y sold today" (count orders with today's date for this product)
  - ⚠️ "Only Z left in stock" (real inventory count from product data)
- Animated counter effect:
  - When number changes, animate from old to new value
  - Use CSS transition or React Spring
- Conditional styling:
  - If inventory < 10, show red warning badge
  - If inventory < 5, add pulsing animation

### 3. Real-time Notifications (`/components/storefront/Notifications.tsx`)

**Implementation:**
- Toast notification system (bottom-right corner)
- Show notification every 30-90 seconds (random interval)
- Notification types (rotate randomly):
  - "[City] just ordered [Product]"
  - "[City] received delivery - Confirmed ⭐⭐⭐⭐⭐"
  - "[City] left a 5-star review"
- Data:
  - Random city from Bangladesh cities list
  - Random product from catalog
- Notification component:
  - Small product image (if available)
  - Message text
  - Close button
  - Auto-dismiss after 4 seconds
  - Slide in animation from bottom-right
  - Slide out animation on dismiss
- Implementation:
  - useEffect with setInterval (random 30-90s)
  - Generate random notification
  - Add to notification queue
  - Display with animation
  - Auto-remove after 4s

### 4. AI Chatbot (`/components/storefront/Chatbot.tsx`)

**Implementation:**
- Floating button (bottom-right, above notifications):
  - Chat icon
  - Unread badge (if new auto-response available)
  - Pulsing animation to attract attention
- On click, open chat modal:
  - Chat window (300px wide, 500px tall)
  - Header: "Chat with us" + minimize/close buttons
  - Chat body:
    - Welcome message: "Hi! How can I help you today?"
    - Preset question buttons:
      - "What sizes are available?"
      - "When will I receive my order?"
      - "Do you have COD?"
      - "What's your return policy?"
    - Free text input (for custom questions)
  - On question click:
    1. Show user's question in chat
    2. Check auto-responses for matching trigger
    3. Show bot's response (instant)
    4. If no match, show: "Let me connect you with our team. Please use the 'Contact Us' form."
  - "Talk to Seller" button at bottom:
    - Opens WhatsApp with pre-filled message: "Hi, I'm interested in [last viewed product]"

---

## DATA MODELS (TypeScript Interfaces)

Create `/lib/types.ts` with all these interfaces:

```typescript
// (Include all interfaces from the COMPLETE_ADMIN_SPEC.md data models section)
// Client, Product, Order, Customer, Cart, Lead, Message, AutoResponse, Supplier, InventoryItem, AccountingEntry, DeliveryTracking, ProductReview, BusinessAnalytics
```

---

## STORAGE OPERATIONS

Create `/lib/storage.ts` with ALL these functions:

```typescript
// (Include all storage functions from the COMPLETE_ADMIN_SPEC.md storage section)
// Generic get/set/remove
// Client operations
// Product CRUD
// Order management
// Customer management
// Lead tracking
// Message management
// Auto-response management
// Supplier CRUD
// Inventory tracking
// Accounting entries
// Delivery tracking
// Review management
// generateId function
// seedData function
```

---

## SEED DATA

Create `storage.seedData()` function that creates:

1. **Demo Client:**
   - Email: demo@example.com
   - Password: demo123
   - Business name: "Demo Store"
   - Subdomain: "demo-store"
   - Plan: active
   - Status: active

2. **10 Sample Products** with:
   - Name (e.g., "Classic T-Shirt", "Blue Jeans", "Running Shoes")
   - Description (50-100 words)
   - Images (use placeholder image URLs like unsplash.com)
   - Base price and sale price (with discount)
   - Variants (some with Size: S/M/L, Color: Red/Blue/Black)
   - Inventory (random 5-50)
   - Category (Clothing, Shoes, Accessories)
   - Status: active

3. **5 Sample Orders** with different statuses:
   - 1 pending
   - 2 processing
   - 1 shipped
   - 1 delivered
   - Random customer names, phones, addresses
   - 1-3 items per order
   - COD payment method

4. **3 Sample Customers:**
   - Name, phone, email
   - 1-2 saved addresses
   - 0-100 loyalty points
   - Link to orders

5. **5 Sample Leads:**
   - 2 hot (viewed 3+ products, added to cart)
   - 2 warm (viewed 1-2 products)
   - 1 cold (single page visit)
   - Behavioral data (pages viewed, products viewed)
   - Some with abandoned carts

6. **3 Sample Messages:**
   - Different channels (website, facebook, whatsapp)
   - Mix of unread and read
   - Sample conversations

7. **2 Sample Suppliers:**
   - Name, phone, email
   - Total purchases, outstanding debt
   - Linked to some products

8. **Sample Auto-Responses:**
   - "Do you have COD?" → "Yes, we offer Cash on Delivery..."
   - "When will I get my order?" → "Orders are delivered within 3-5 days..."

9. **Sample Accounting Entries:**
   - 5 income entries (sales from orders)
   - 3 expense entries (advertising, courier)

Call `storage.seedData()` on first app load if no clients exist.

---

## STYLING & UI GUIDELINES

**Color Palette:**
```css
:root {
  --primary: #3b82f6; /* Blue */
  --primary-hover: #2563eb;
  --success: #10b981; /* Green */
  --warning: #f59e0b; /* Orange */
  --danger: #ef4444; /* Red */
  --background: #ffffff;
  --foreground: #0f172a;
  --border: #e2e8f0;
  --muted: #64748b;
}
```

**Component Styling:**
- **Buttons:**
  - Primary: bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-hover
  - Secondary: bg-white text-primary border border-primary rounded-lg px-4 py-2 hover:bg-gray-50
  - Danger: bg-danger text-white rounded-lg px-4 py-2 hover:bg-red-600
  - Disabled: bg-gray-300 text-gray-500 cursor-not-allowed

- **Cards:**
  - bg-white rounded-lg shadow-sm border border-border p-6

- **Inputs:**
  - border border-border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent

- **Tables:**
  - Striped rows: odd:bg-gray-50
  - Hover: hover:bg-gray-100
  - Header: bg-gray-100 font-semibold

- **Badges:**
  - Small: px-2 py-1 rounded-full text-xs font-medium
  - Colors based on status

- **Modals:**
  - Backdrop: bg-black/50
  - Content: bg-white rounded-lg shadow-xl max-w-2xl mx-auto
  - Animation: slide in from bottom or fade in

**Responsive:**
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Admin sidebar: Hidden on mobile, show hamburger menu
- Tables: Horizontal scroll on mobile
- Product grid: 1 col mobile, 2 cols tablet, 3-4 cols desktop

---

## VALIDATION & ERROR HANDLING

**Form Validation:**
- All required fields must be filled
- Email must be valid format
- Phone must be valid BD format (01XXXXXXXXX)
- Prices must be positive numbers
- Sale price must be less than base price
- Show inline error messages below each field
- Disable submit button until form is valid

**Error Handling:**
- Try-catch around all localStorage operations
- If localStorage is full, show error: "Storage limit reached. Please contact support."
- If localStorage is disabled, show error: "Please enable cookies to use this app."
- Network errors (future): Show retry button
- 404 for product/order not found: Show friendly error page

**Success Messages:**
- Toast notifications for:
  - Product added/updated/deleted
  - Order status updated
  - Customer saved
  - Settings saved
- Auto-dismiss after 3 seconds
- Green background, white text

**Loading States:**
- Show loading spinner when:
  - Fetching data from localStorage
  - Submitting forms
  - Deleting items
- Disable buttons during loading
- Show "Loading..." text or spinner icon

---

## ACCEPTANCE CRITERIA (MUST WORK)

### Authentication:
- [ ] Can signup new client with email, password, business name
- [ ] Can login with demo credentials (demo@example.com / demo123)
- [ ] Admin routes redirect to login if not authenticated
- [ ] Logout clears session and redirects to login

### Admin - Dashboard:
- [ ] Shows correct metrics from localStorage (revenue, orders, products, customers, leads, messages)
- [ ] Revenue chart displays last 30 days data
- [ ] Recent orders table shows last 10 orders
- [ ] Low stock alerts show products with stock < 10

### Admin - Products:
- [ ] Product list shows all products from localStorage
- [ ] Can add new product with all fields (name, price, images, variants, inventory)
- [ ] Can edit existing product
- [ ] Can delete product with confirmation
- [ ] Stock indicators show correct colors
- [ ] Can add/edit/delete categories

### Admin - Orders:
- [ ] Order list shows all orders from localStorage
- [ ] Can filter by status, payment, date
- [ ] Can update order status from dropdown
- [ ] Can view order details in modal
- [ ] Pending orders page shows only pending orders
- [ ] Can assign courier and tracking number
- [ ] Can update delivery status
- [ ] Can mark COD as collected/remitted

### Admin - Customers & Leads:
- [ ] Customer list shows all customers with order count and total spent
- [ ] Can view customer details with order history
- [ ] Lead tracker shows leads with hot/warm/cold status
- [ ] Can view lead details with browsing history
- [ ] Can convert lead to customer
- [ ] Session recordings show event timeline

### Admin - Messages:
- [ ] Message inbox shows all messages
- [ ] Can view conversation thread
- [ ] Can reply to messages
- [ ] Can add auto-response
- [ ] Auto-responses trigger on keywords

### Admin - Analytics:
- [ ] Sales analytics shows revenue trends
- [ ] Revenue reports show P&L statement
- [ ] Product performance shows top sellers and metrics

### Admin - Operations:
- [ ] Inventory management shows all products with stock
- [ ] Can adjust stock with reason
- [ ] Low stock alerts show correctly
- [ ] Can add/edit suppliers
- [ ] Can record supplier payments
- [ ] Outstanding debt calculates correctly
- [ ] Can add accounting entries (income/expense)
- [ ] Transaction log shows all entries with filters
- [ ] Business settings can update profile, logo, shipping, payments

### Storefront:
- [ ] Homepage shows products and spin wheel on first visit
- [ ] Spin wheel animates and gives discount
- [ ] Discount saves to localStorage with 15-minute expiry
- [ ] Countdown timer shows remaining time
- [ ] Product list shows all active products
- [ ] Product detail shows images, variants, stock ticker
- [ ] Stock ticker shows real-time stats
- [ ] Can add to cart with variants
- [ ] Cart shows items with quantity controls
- [ ] Cart summary calculates correctly (subtotal, discount, shipping, total)
- [ ] Bulk discount message shows if 2+ items
- [ ] Checkout form validates all fields
- [ ] Timer countdown works (6 minutes)
- [ ] Place order creates order and saves to localStorage
- [ ] Order appears in admin panel immediately
- [ ] Inventory reduces on order
- [ ] Cart clears after order
- [ ] Order confirmation shows order number and details
- [ ] Real-time notifications appear every 30-90s
- [ ] Chatbot opens with FAQ questions
- [ ] Chatbot responds instantly with auto-responses

### Data Persistence:
- [ ] All operations save to localStorage
- [ ] Page refresh preserves all data
- [ ] Logout and login preserves data
- [ ] Seed data creates demo account and sample data on first launch

### UI/UX:
- [ ] Responsive on mobile (320px) and desktop (1920px)
- [ ] Consistent Tailwind styling throughout
- [ ] Smooth animations (spin wheel, notifications, modals)
- [ ] Loading states on all async operations
- [ ] Error messages on validation failures
- [ ] Success toasts on successful operations
- [ ] No console errors
- [ ] No broken layouts
- [ ] All buttons work
- [ ] All forms validate

---

## BUILD INSTRUCTIONS

1. **Create Next.js app:**
   ```bash
   npx create-next-app@latest ecommerce-platform --typescript --tailwind --app
   ```

2. **Create folder structure** as specified above

3. **Build in this order:**
   1. Data models (`/lib/types.ts`)
   2. Storage helpers (`/lib/storage.ts`)
   3. Utility functions (`/lib/utils.ts`)
   4. Shared UI components (`/components/shared/`)
   5. Authentication (`/hooks/useAuth.ts`, `/app/auth/`)
   6. Admin layout and sidebar (`/app/admin/layout.tsx`)
   7. Admin pages (Dashboard, then Products, Orders, Customers, Messages, Analytics, Operations)
   8. Storefront layout (`/app/(storefront)/layout.tsx`)
   9. Storefront pages (Homepage, Products, Cart, Checkout)
   10. Psychological triggers (Spin wheel, Stock ticker, Notifications, Chatbot)
   11. Seed data function
   12. First-load check (call seedData if no clients exist)

4. **Test thoroughly:**
   - Complete user flow: Signup → Add product → Visit storefront → Spin wheel → Add to cart → Checkout → See order in admin
   - Test all filters, searches, sorts
   - Test all CRUD operations
   - Test localStorage persistence
   - Test responsive layouts

5. **Polish:**
   - Consistent spacing
   - Smooth animations
   - Loading states
   - Error handling
   - Success messages

---

## CRITICAL REMINDERS

- **localStorage ONLY** (no API routes, no external databases)
- **Every component with localStorage must use 'use client' directive**
- **TypeScript strict mode** (no 'any' types)
- **Every feature must be FULLY FUNCTIONAL** (no placeholders or TODO comments)
- **All tables must have search, filter, sort**
- **All forms must have validation**
- **All CRUD operations must save to localStorage**
- **Seed data must create demo account and sample data**
- **Responsive design for mobile and desktop**
- **Professional UI with Tailwind CSS**
- **Smooth animations and transitions**
- **Loading and error states everywhere**

---

## START BUILDING NOW

Build the complete system with ALL features described above. Make every page, every button, every form fully functional. Use localStorage for all data operations. Follow the exact structure and specifications.

**DO NOT skip any features. DO NOT add external dependencies. DO NOT create API routes.**

**BUILD EVERYTHING. MAKE IT WORK. MAKE IT PROFESSIONAL.**
