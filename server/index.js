const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// In-memory data stores (in production, use a database)
let products = [
  {
    id: '1',
    name: 'Ergobaby Carrier Classic',
    category: 'baby carrier',
    price: 129.99,
    stock: 15,
    description: 'Ergonomic baby carrier with lumbar support',
    image: 'https://via.placeholder.com/300x300?text=Ergobaby+Classic',
    brand: 'Ergobaby',
    rating: 4.8
  },
  {
    id: '2',
    name: 'BabyBjörn Mini Carrier',
    category: 'baby carrier',
    price: 79.99,
    stock: 8,
    description: 'Soft and ergonomic baby carrier for newborns',
    image: 'https://via.placeholder.com/300x300?text=BabyBjorn+Mini',
    brand: 'BabyBjörn',
    rating: 4.6
  },
  {
    id: '3',
    name: 'Tula Free-to-Grow Carrier',
    category: 'baby carrier',
    price: 159.99,
    stock: 12,
    description: 'Adjustable carrier that grows with your baby',
    image: 'https://via.placeholder.com/300x300?text=Tula+Free+to+Grow',
    brand: 'Tula',
    rating: 4.9
  },
  {
    id: '4',
    name: 'Lillebaby Complete Carrier',
    category: 'baby carrier',
    price: 119.99,
    stock: 6,
    description: 'All seasons baby carrier with multiple positions',
    image: 'https://via.placeholder.com/300x300?text=Lillebaby+Complete',
    brand: 'Lillebaby',
    rating: 4.7
  },
  {
    id: '5',
    name: 'Infantino Flip 4-in-1 Carrier',
    category: 'baby carrier',
    price: 39.99,
    stock: 20,
    description: 'Affordable 4-in-1 convertible baby carrier',
    image: 'https://via.placeholder.com/300x300?text=Infantino+Flip',
    brand: 'Infantino',
    rating: 4.3
  },
  // Add some products from other categories
  {
    id: '6',
    name: 'Baby Stroller Deluxe',
    category: 'stroller',
    price: 299.99,
    stock: 5,
    description: 'Premium baby stroller with all-terrain wheels',
    image: 'https://via.placeholder.com/300x300?text=Stroller+Deluxe',
    brand: 'BabyTech',
    rating: 4.5
  },
  {
    id: '7',
    name: 'Organic Baby Formula',
    category: 'baby food',
    price: 24.99,
    stock: 30,
    description: 'Organic baby formula for healthy nutrition',
    image: 'https://via.placeholder.com/300x300?text=Baby+Formula',
    brand: 'OrganicBaby',
    rating: 4.4
  }
];

let orders = [];
let orderCounter = 1000;

// Utility function to generate tracking number
function generateTrackingNumber() {
  return 'TRK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Utility function to get order status based on time
function getOrderStatus(createdAt) {
  const now = new Date();
  const orderTime = new Date(createdAt);
  const hoursDiff = (now - orderTime) / (1000 * 60 * 60);
  
  if (hoursDiff < 1) return 'Processing';
  if (hoursDiff < 24) return 'Shipped';
  if (hoursDiff < 72) return 'In Transit';
  return 'Delivered';
}

// API Routes

// Get all products or filter by category
app.get('/api/products', (req, res) => {
  try {
    const { category } = req.query;
    let filteredProducts = products;
    
    if (category) {
      filteredProducts = products.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    res.json({
      success: true,
      data: filteredProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  try {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// Get lowest price product in a category
app.get('/api/products/category/:category/lowest-price', (req, res) => {
  try {
    const { category } = req.params;
    const categoryProducts = products.filter(p => 
      p.category.toLowerCase() === category.toLowerCase() && p.stock > 0
    );
    
    if (categoryProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No products available in category: ${category}`
      });
    }
    
    const lowestPriceProduct = categoryProducts.reduce((lowest, current) => 
      current.price < lowest.price ? current : lowest
    );
    
    res.json({
      success: true,
      data: lowestPriceProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error finding lowest price product',
      error: error.message
    });
  }
});

// Get all categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = [...new Set(products.map(p => p.category))];
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// Place an order
app.post('/api/orders', (req, res) => {
  try {
    const { productId, quantity = 1, customerInfo } = req.body;
    
    // Validate input
    if (!productId || !customerInfo || !customerInfo.name || !customerInfo.email) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and customer information (name, email) are required'
      });
    }
    
    const product = products.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`
      });
    }
    
    // Create order
    const order = {
      id: (orderCounter++).toString(),
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
      customerInfo,
      status: 'Processing',
      trackingNumber: generateTrackingNumber(),
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };
    
    // Update product stock
    product.stock -= quantity;
    
    // Add to orders
    orders.push(order);
    
    res.status(201).json({
      success: true,
      data: order,
      message: 'Order placed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error placing order',
      error: error.message
    });
  }
});

// Get all orders
app.get('/api/orders', (req, res) => {
  try {
    // Update order statuses based on time
    const updatedOrders = orders.map(order => ({
      ...order,
      status: getOrderStatus(order.createdAt)
    }));
    
    res.json({
      success: true,
      data: updatedOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
  try {
    const order = orders.find(o => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update order status based on time
    const updatedOrder = {
      ...order,
      status: getOrderStatus(order.createdAt)
    };
    
    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
});

// Track order by tracking number
app.get('/api/track/:trackingNumber', (req, res) => {
  try {
    const order = orders.find(o => o.trackingNumber === req.params.trackingNumber);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Tracking number not found'
      });
    }
    
    // Update order status based on time
    const currentStatus = getOrderStatus(order.createdAt);
    
    // Generate tracking history
    const createdTime = new Date(order.createdAt);
    const trackingHistory = [
      {
        status: 'Processing',
        timestamp: createdTime.toISOString(),
        description: 'Order received and being processed'
      }
    ];
    
    if (currentStatus !== 'Processing') {
      trackingHistory.push({
        status: 'Shipped',
        timestamp: new Date(createdTime.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour later
        description: 'Package shipped from warehouse'
      });
    }
    
    if (currentStatus === 'In Transit' || currentStatus === 'Delivered') {
      trackingHistory.push({
        status: 'In Transit',
        timestamp: new Date(createdTime.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 1 day later
        description: 'Package in transit to destination'
      });
    }
    
    if (currentStatus === 'Delivered') {
      trackingHistory.push({
        status: 'Delivered',
        timestamp: new Date(createdTime.getTime() + 72 * 60 * 60 * 1000).toISOString(), // 3 days later
        description: 'Package delivered successfully'
      });
    }
    
    res.json({
      success: true,
      data: {
        orderId: order.id,
        trackingNumber: order.trackingNumber,
        currentStatus,
        productName: order.productName,
        quantity: order.quantity,
        estimatedDelivery: order.estimatedDelivery,
        trackingHistory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error tracking order',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Ecommerce API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Ecommerce API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;