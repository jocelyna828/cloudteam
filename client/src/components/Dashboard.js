import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    avgRating: 0
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [productsRes, ordersRes, categoriesRes] = await Promise.all([
        fetch('http://localhost:5000/api/products'),
        fetch('http://localhost:5000/api/orders'),
        fetch('http://localhost:5000/api/categories')
      ]);

      const [productsData, ordersData, categoriesData] = await Promise.all([
        productsRes.json(),
        ordersRes.json(),
        categoriesRes.json()
      ]);

      if (productsData.success) {
        setProducts(productsData.data);
      }

      if (ordersData.success) {
        setOrders(ordersData.data);
      }

      if (categoriesData.success) {
        setCategories(categoriesData.data);
      }

      // Calculate statistics
      const totalProducts = productsData.success ? productsData.data.length : 0;
      const totalOrders = ordersData.success ? ordersData.data.length : 0;
      const totalCategories = categoriesData.success ? categoriesData.data.length : 0;
      
      const avgRating = productsData.success && productsData.data.length > 0
        ? (productsData.data.reduce((sum, product) => sum + product.rating, 0) / productsData.data.length).toFixed(1)
        : 0;

      setStats({
        totalProducts,
        totalOrders,
        totalCategories,
        avgRating
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.stock <= 5);
  };

  const getRecentOrders = () => {
    return orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };

  const getCategoryStats = () => {
    const categoryStats = {};
    
    categories.forEach(category => {
      const categoryProducts = products.filter(p => p.category === category);
      categoryStats[category] = {
        productCount: categoryProducts.length,
        totalStock: categoryProducts.reduce((sum, p) => sum + p.stock, 0),
        avgPrice: categoryProducts.length > 0 
          ? (categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length).toFixed(2)
          : 0
      };
    });
    
    return categoryStats;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const lowStockProducts = getLowStockProducts();
  const recentOrders = getRecentOrders();
  const categoryStats = getCategoryStats();

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">📊 Dashboard</h1>
        <p className="card-subtitle">System overview and analytics</p>
      </div>

      {/* Statistics Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-label">Total Products</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.totalCategories}</div>
          <div className="stat-label">Categories</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.avgRating}★</div>
          <div className="stat-label">Avg Rating</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>📋 Category Overview</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {Object.entries(categoryStats).map(([category, stats]) => (
            <div key={category} className="card" style={{ background: 'rgba(255, 255, 255, 0.7)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                    {category}
                  </h4>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    {stats.productCount} products • {stats.totalStock} total stock
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#667eea' }}>
                    ${stats.avgPrice}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>avg price</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#dc3545' }}>⚠️ Low Stock Alert</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {lowStockProducts.map(product => (
              <div key={product.id} className="card" style={{ background: 'rgba(220, 53, 69, 0.05)', border: '1px solid rgba(220, 53, 69, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ marginBottom: '0.5rem' }}>{product.name}</h4>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                      {product.brand} • {product.category}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#dc3545' }}>
                      {product.stock} left
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>${product.price}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>🕒 Recent Orders</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {recentOrders.map(order => (
              <div key={order.id} className="card" style={{ background: 'rgba(255, 255, 255, 0.7)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Order #{order.id}</h4>
                    <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                      {order.productName} × {order.quantity}
                    </p>
                    <p style={{ color: '#999', fontSize: '0.9rem' }}>
                      {order.customerInfo.name} • {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#667eea', marginBottom: '0.5rem' }}>
                      ${order.totalPrice}
                    </div>
                    <div style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem',
                      background: 'rgba(102, 126, 234, 0.1)',
                      color: '#667eea'
                    }}>
                      {order.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Health */}
      <div className="card" style={{ background: 'rgba(40, 167, 69, 0.05)', border: '1px solid rgba(40, 167, 69, 0.2)' }}>
        <h3 style={{ marginBottom: '1rem', color: '#28a745' }}>💚 System Health</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>API Status</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#28a745' }}>🟢 Online</div>
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Database</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#28a745' }}>🟢 Connected</div>
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>Last Updated</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#666' }}>
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;