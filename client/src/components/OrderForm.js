import React, { useState } from 'react';

const OrderForm = ({ product, onOrderComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'quantity') {
      setFormData(prev => ({
        ...prev,
        quantity: parseInt(value) || 1
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        customerInfo: {
          ...prev.customerInfo,
          [name]: value
        }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: formData.quantity,
          customerInfo: formData.customerInfo
        }),
      });

      const data = await response.json();

      if (data.success) {
        onOrderComplete(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to place order');
      console.error('Error placing order:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return (product.price * formData.quantity).toFixed(2);
  };

  if (!product) {
    return (
      <div className="card">
        <div className="alert alert-error">
          No product selected
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Place Order</h1>
        <p className="card-subtitle">Complete your purchase</p>
      </div>

      {/* Product Summary */}
      <div className="card" style={{ marginBottom: '2rem', background: 'rgba(102, 126, 234, 0.05)' }}>
        <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Order Summary</h3>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ fontSize: '3rem' }}>🍼</div>
          <div style={{ flex: 1 }}>
            <h4>{product.name}</h4>
            <p style={{ color: '#666', margin: '0.5rem 0' }}>{product.brand}</p>
            <p style={{ color: '#667eea', fontSize: '1.2rem', fontWeight: '600' }}>
              ${product.price} each
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              {product.stock} available
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Quantity */}
        <div className="form-group">
          <label htmlFor="quantity" className="form-label">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            max={product.stock}
            value={formData.quantity}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        {/* Customer Information */}
        <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Customer Information</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.customerInfo.name}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.customerInfo.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="phone" className="form-label">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.customerInfo.phone}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="address" className="form-label">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.customerInfo.address}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city" className="form-label">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.customerInfo.city}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="zipCode" className="form-label">ZIP Code</label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.customerInfo.zipCode}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>

        {/* Order Total */}
        <div className="card" style={{ background: 'rgba(102, 126, 234, 0.05)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>Total:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea' }}>
              ${calculateTotal()}
            </span>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
            {formData.quantity} × ${product.price}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="btn-group">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || product.stock < formData.quantity}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                Placing Order...
              </>
            ) : (
              '🛒 Place Order'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;