import React, { useState, useEffect } from 'react';

const ProductCatalog = ({ onProductSelect }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lowestPriceProduct, setLowestPriceProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchLowestPriceProduct(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchProducts = async (category = '') => {
    try {
      setLoading(true);
      const url = category 
        ? `http://localhost:5000/api/products?category=${encodeURIComponent(category)}`
        : 'http://localhost:5000/api/products';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchLowestPriceProduct = async (category) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/category/${encodeURIComponent(category)}/lowest-price`);
      const data = await response.json();
      
      if (data.success) {
        setLowestPriceProduct(data.data);
      } else {
        setLowestPriceProduct(null);
      }
    } catch (err) {
      console.error('Error fetching lowest price product:', err);
      setLowestPriceProduct(null);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchProducts(category);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('☆');
    }
    
    return stars.join('');
  };

  const handleQuickOrder = (product) => {
    onProductSelect(product);
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

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Product Catalog</h1>
        <p className="card-subtitle">Browse our inventory and find the best deals</p>
      </div>

      {/* Category Filter */}
      <div className="categories">
        <button
          className={`category-chip ${selectedCategory === '' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('')}
        >
          All Products
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Lowest Price Product Highlight */}
      {lowestPriceProduct && selectedCategory && (
        <div className="alert alert-info">
          <h3>💰 Best Deal in {selectedCategory}!</h3>
          <p>
            <strong>{lowestPriceProduct.name}</strong> - Only ${lowestPriceProduct.price}
            <button 
              className="btn btn-primary" 
              style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
              onClick={() => handleQuickOrder(lowestPriceProduct)}
            >
              Quick Order
            </button>
          </p>
        </div>
      )}

      {/* Products Grid */}
      <div className="products-grid">
        {products.map(product => (
          <div 
            key={product.id} 
            className="product-card"
            onClick={() => onProductSelect(product)}
          >
            <div className="product-image">
              🍼
            </div>
            <div className="product-content">
              <div className="product-brand">{product.brand}</div>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              
              <div className="rating">
                <span className="stars">{renderStars(product.rating)}</span>
                <span className="rating-value">({product.rating})</span>
              </div>
              
              <div className="product-footer">
                <div>
                  <div className="product-price">${product.price}</div>
                  <div className="product-stock">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="alert alert-info">
          No products found in this category.
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;