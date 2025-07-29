import React, { useState, useEffect } from 'react';

const OrderTracking = ({ orders: localOrders = [] }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      const data = await response.json();
      
      if (data.success) {
        setAllOrders(data.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError(null);
    setTrackingResult(null);

    try {
      const response = await fetch(`http://localhost:5000/api/track/${trackingNumber}`);
      const data = await response.json();

      if (data.success) {
        setTrackingResult(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to track order');
      console.error('Error tracking order:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'status-badge status-processing';
      case 'shipped':
        return 'status-badge status-shipped';
      case 'in transit':
        return 'status-badge status-transit';
      case 'delivered':
        return 'status-badge status-delivered';
      default:
        return 'status-badge';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const combinedOrders = [...localOrders, ...allOrders];
  const uniqueOrders = combinedOrders.filter((order, index, self) => 
    index === self.findIndex(o => o.id === order.id)
  );

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Order Tracking</h1>
        <p className="card-subtitle">Track your orders and delivery status</p>
      </div>

      {/* Tracking Input */}
      <form onSubmit={handleTrackOrder} className="tracking-input">
        <input
          type="text"
          placeholder="Enter tracking number (e.g., TRK123456789ABCDE)"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="form-input"
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
              Tracking...
            </>
          ) : (
            '📦 Track Order'
          )}
        </button>
      </form>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Tracking Result */}
      {trackingResult && (
        <div className="tracking-result">
          <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>
            📦 Order #{trackingResult.orderId}
          </h3>
          
          <div className="order-status">
            <span className={getStatusBadgeClass(trackingResult.currentStatus)}>
              {trackingResult.currentStatus}
            </span>
            <span style={{ color: '#666' }}>
              Expected delivery: {formatDate(trackingResult.estimatedDelivery)}
            </span>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <p><strong>Product:</strong> {trackingResult.productName}</p>
            <p><strong>Quantity:</strong> {trackingResult.quantity}</p>
            <p><strong>Tracking Number:</strong> {trackingResult.trackingNumber}</p>
          </div>

          {/* Tracking Timeline */}
          <div className="tracking-timeline">
            <h4 style={{ marginBottom: '1rem', color: '#333' }}>Tracking History</h4>
            {trackingResult.trackingHistory.map((item, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-dot">
                  {index + 1}
                </div>
                <div className="timeline-content">
                  <div className="timeline-status">{item.status}</div>
                  <div className="timeline-description">{item.description}</div>
                  <div className="timeline-timestamp">{formatDate(item.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {uniqueOrders.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Recent Orders</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {uniqueOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="card" style={{ background: 'rgba(255, 255, 255, 0.7)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Order #{order.id}</h4>
                    <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                      {order.productName} × {order.quantity}
                    </p>
                    <p style={{ color: '#667eea', fontWeight: '600', marginBottom: '0.5rem' }}>
                      ${order.totalPrice}
                    </p>
                    <p style={{ color: '#999', fontSize: '0.9rem' }}>
                      Ordered: {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={getStatusBadgeClass(order.status)} style={{ marginBottom: '0.5rem' }}>
                      {order.status}
                    </div>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      onClick={() => {
                        setTrackingNumber(order.trackingNumber);
                        handleTrackOrder({ preventDefault: () => {} });
                      }}
                    >
                      Track
                    </button>
                  </div>
                </div>
                {order.trackingNumber && (
                  <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px' }}>
                    <small style={{ color: '#667eea' }}>
                      Tracking: {order.trackingNumber}
                    </small>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {uniqueOrders.length === 0 && !trackingResult && (
        <div className="alert alert-info">
          <h3>No orders found</h3>
          <p>Start by browsing our catalog and placing an order!</p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;