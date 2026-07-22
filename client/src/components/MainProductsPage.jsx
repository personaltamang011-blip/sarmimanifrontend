import React, { useState } from 'react';
import { ShoppingCart, AlertTriangle, Plus, Minus, Search, Sparkles } from 'lucide-react';

export default function MainProductsPage({ 
  products, 
  loading, 
  searchQuery, 
  setSearchQuery, 
  addToCart 
}) {
  const [quantities, setQuantities] = useState({});

  const handleQtyChange = (id, delta, maxStock) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      const next = Math.max(1, Math.min(maxStock, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div>
      {/* Hero Header Banner */}
      <div className="hero-banner">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.2)', padding: '0.4rem 1rem', borderRadius: '999px', color: '#818cf8', fontWeight: '600', fontSize: '0.85rem', marginBottom: '1rem' }}>
          <Sparkles size={16} /> Premium Quality Products
        </div>
        <h1 className="hero-title">
          Welcome to <span>sarmimani mart</span>
        </h1>
        <p className="hero-subtitle">
          Shop your favorite items with direct MongoDB live database integration, fast checkout, and instant stock sync!
        </p>
      </div>

      {/* Out of Stock Alert Summary Banner (if any products out of stock) */}
      {products.some(p => p.stock === 0) && (
        <div style={{
          maxWidth: '1280px',
          margin: '1.5rem auto 0',
          padding: '1rem 1.5rem',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#fca5a5'
        }}>
          <AlertTriangle size={20} style={{ color: '#ef4444' }} />
          <span>
            <strong>Notice:</strong> Some products are currently out of stock. Stock levels are synchronized live with our database.
          </span>
        </div>
      )}

      {/* Product Grid */}
      <div className="product-grid">
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <p>Loading products from MongoDB...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <Search size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h3>No products found</h3>
            <p>Try searching for a different product name</p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const qty = quantities[product._id] || 1;
            const isOutOfStock = product.stock <= 0;

            return (
              <div key={product._id} className="product-card">
                <div className="product-img-wrapper">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="product-img"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60';
                    }}
                  />
                  <span className={`stock-tag ${isOutOfStock ? 'stock-out' : 'stock-in'}`}>
                    {isOutOfStock ? 'OUT OF STOCK' : `In Stock: ${product.stock}`}
                  </span>
                </div>

                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-desc">{product.description || 'High quality product available at Sarmimani Mart.'}</p>
                  
                  <div className="price-row">
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Selling Price</span>
                      <span className="selling-price">रु {product.sellingPrice.toLocaleString()}</span>
                    </div>

                    {!isOutOfStock && (
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn"
                          onClick={() => handleQtyChange(product._id, -1, product.stock)}
                          disabled={qty <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="qty-value">{qty}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => handleQtyChange(product._id, 1, product.stock)}
                          disabled={qty >= product.stock}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <button 
                    className="add-cart-btn"
                    disabled={isOutOfStock}
                    onClick={() => addToCart(product, qty)}
                  >
                    <ShoppingCart size={18} />
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
