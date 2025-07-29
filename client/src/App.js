import React, { useState, useEffect } from 'react';
import './App.css';
import ProductCatalog from './components/ProductCatalog';
import OrderForm from './components/OrderForm';
import OrderTracking from './components/OrderTracking';
import Header from './components/Header';
import Dashboard from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orders, setOrders] = useState([]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setActiveTab('order');
  };

  const handleOrderComplete = (order) => {
    setOrders([...orders, order]);
    setActiveTab('tracking');
  };

  return (
    <div className="App">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {activeTab === 'catalog' && (
          <ProductCatalog onProductSelect={handleProductSelect} />
        )}
        
        {activeTab === 'order' && (
          <OrderForm 
            product={selectedProduct} 
            onOrderComplete={handleOrderComplete}
            onCancel={() => setActiveTab('catalog')}
          />
        )}
        
        {activeTab === 'tracking' && (
          <OrderTracking orders={orders} />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard />
        )}
      </main>
    </div>
  );
}

export default App;
