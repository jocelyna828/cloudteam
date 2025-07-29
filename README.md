# 🛒 EcomStore - Ecommerce Platform Prototype

A full-stack ecommerce platform prototype with inventory management, order placement, and tracking features.

## 🌟 Features

### ✅ **Inventory Management**
- Product catalog with categories (baby carrier, stroller, baby food, etc.)
- Real-time stock levels
- Product search and filtering by category
- **Lowest price finder** - automatically finds and highlights the best deal in each category
- Low stock alerts in dashboard

### ✅ **Order Placement System**
- User-friendly order form with customer information
- Real-time inventory checking
- **Automatic lowest price selection** for categories
- Order confirmation with tracking number generation
- Stock reduction upon successful orders

### ✅ **Order Tracking**
- Track orders by tracking number
- **Dynamic status updates** based on time:
  - Processing (< 1 hour)
  - Shipped (1-24 hours)
  - In Transit (1-3 days)
  - Delivered (3+ days)
- Complete tracking timeline with timestamps
- Order history and recent orders view

### ✅ **Dashboard & Analytics**
- System overview with key metrics
- Category breakdown and statistics
- Low stock alerts
- Recent orders monitoring
- System health indicators

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd ecommerce-platform
   ```

2. **Install backend dependencies**:
   ```bash
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd client
   npm install
   cd ..
   ```

### Running the Application

#### Option 1: Run both servers simultaneously
```bash
npm run dev
```

#### Option 2: Run servers separately

**Backend (Terminal 1)**:
```bash
npm run server
```
Server runs on: http://localhost:5000

**Frontend (Terminal 2)**:
```bash
npm run client
```
Frontend runs on: http://localhost:3000

## 📋 API Endpoints

### Products
- `GET /api/products` - Get all products (optional `?category=` filter)
- `GET /api/products/:id` - Get specific product
- `GET /api/products/category/:category/lowest-price` - **Get lowest price product in category**
- `GET /api/categories` - Get all categories

### Orders
- `POST /api/orders` - Place new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get specific order

### Tracking
- `GET /api/track/:trackingNumber` - **Track order with full timeline**

### System
- `GET /api/health` - Health check

## 💡 Key Demonstrations

### 1. **Inventory Check Example**
Visit the catalog and see real-time stock levels. Try the "Baby Carrier" category to see the inventory system in action.

### 2. **Lowest Price Finder**
1. Go to the Catalog
2. Select "Baby Carrier" category
3. See the highlighted "Best Deal" section showing the lowest price product
4. Click "Quick Order" to immediately order the best deal

### 3. **Order Placement Flow**
1. Select any product from the catalog
2. Fill in customer information
3. Choose quantity (respects stock limits)
4. Place order and receive tracking number

### 4. **Order Tracking Demo**
1. After placing an order, go to the Tracking tab
2. Use the generated tracking number (e.g., `TRK1234567890ABCDE`)
3. See the complete tracking timeline
4. Notice how status changes over time (refresh after some time to see progression)

### 5. **Dashboard Analytics**
Visit the Dashboard to see:
- Total products, orders, and categories
- Category breakdown with stock levels
- Low stock alerts (products with ≤5 items)
- Recent order activity

## 🛠️ Technical Architecture

### Backend (Express.js/Node.js)
- RESTful API design
- In-memory data storage (easily replaceable with database)
- Rate limiting and security middleware
- Comprehensive error handling
- Dynamic order status based on time progression

### Frontend (React)
- Modern, responsive UI with glassmorphism design
- Component-based architecture
- Real-time API integration
- Mobile-friendly responsive design
- Modern UX with smooth animations

### Sample Data
The system comes pre-loaded with:
- **5 baby carrier products** (Ergobaby, BabyBjörn, Tula, Lillebaby, Infantino)
- **2 additional categories** (stroller, baby food)
- **Various price points** ($39.99 - $159.99) to demonstrate lowest price finder

## 🎯 Core Functionalities Demonstrated

### ✅ Inventory Management
- [x] Real-time stock tracking
- [x] Category-based organization
- [x] Product information with ratings and descriptions
- [x] Stock level warnings

### ✅ Lowest Price Finding
- [x] Automatic detection of cheapest product per category
- [x] Prominent display of best deals
- [x] One-click ordering of lowest price items
- [x] Price comparison across categories

### ✅ Order Processing
- [x] Complete order flow with validation
- [x] Customer information capture
- [x] Inventory reduction upon order
- [x] Unique tracking number generation
- [x] Order confirmation and details

### ✅ Tracking System
- [x] Real-time order status tracking
- [x] Time-based status progression
- [x] Complete tracking history timeline
- [x] Multiple tracking methods (number lookup, order list)
- [x] Estimated delivery dates

## 🧪 Testing the Platform

1. **Browse Products**: Start in the Catalog tab to explore inventory
2. **Find Best Deals**: Select "Baby Carrier" category and use the lowest price finder
3. **Place Orders**: Order products and note the tracking numbers
4. **Track Progress**: Use the Tracking tab to monitor order status
5. **Monitor System**: Check the Dashboard for analytics and system health

## 🚀 Production Considerations

For production deployment, consider:
- Replace in-memory storage with a proper database (PostgreSQL, MongoDB)
- Add user authentication and sessions
- Implement payment processing
- Add email notifications for order updates
- Set up proper logging and monitoring
- Add data validation and sanitization
- Implement caching for better performance
- Add search functionality and filters
- Include product images and reviews

## 📝 License

MIT License - feel free to use this prototype for learning or as a starting point for your own ecommerce platform!