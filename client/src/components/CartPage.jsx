import React, { useState } from 'react';
import { ShoppingBag, Trash2, ArrowLeft, CheckCircle2, User, Phone, MapPin, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CartPage({ 
  cart, 
  updateCartQty, 
  removeFromCart, 
  clearCart, 
  setCurrentTab,
  submitOrder,
  submittingOrder
}) {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: ''
  });

  const [orderSuccess, setOrderSuccess] = useState(null);

  const subtotal = cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      alert('Please fill out all required fields: Name, Phone No, and Address.');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    try {
      const orderData = {
        customerName: formData.customerName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          costPrice: item.costPrice || 0,
          sellingPrice: item.sellingPrice
        }))
      };

      const result = await submitOrder(orderData);
      if (result) {
        setOrderSuccess(result);
        clearCart();
        setFormData({ customerName: '', phone: '', address: '' });
        
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Order Submission Error:', err);
    }
  };

  if (orderSuccess) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>Order Placed Successfully!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Your order has been recorded in MongoDB database and is currently <strong>Pending</strong> confirmation.
          </p>

          <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
              <strong style={{ color: '#38bdf8' }}>{orderSuccess.orderId}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Date (Nepali):</span>
              <strong>{orderSuccess.dateNepali}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Date (English):</span>
              <strong>{orderSuccess.dateEnglish}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
              <strong>{orderSuccess.customerName} ({orderSuccess.phone})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
              <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>रु {orderSuccess.totalAmount.toLocaleString()}</strong>
            </div>
          </div>

          <button 
            className="add-cart-btn"
            onClick={() => {
              setOrderSuccess(null);
              setCurrentTab('home');
            }}
          >
            Back to Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 1.5rem' }}>
      <button 
        onClick={() => setCurrentTab('home')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: '600' }}
      >
        <ArrowLeft size={18} /> Continue Shopping
      </button>

      <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem' }}>Your Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <ShoppingBag size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>Your cart is empty</h2>
          <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>Add some products from Sarmimani Mart to start an order.</p>
          <button 
            className="add-cart-btn"
            style={{ maxWidth: '220px', margin: '0 auto' }}
            onClick={() => setCurrentTab('home')}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="cart-container" style={{ margin: '0' }}>
          {/* Cart Items List */}
          <div className="glass-panel cart-items-panel">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Items in Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </h3>

            {cart.map(item => (
              <div key={item._id} className="cart-item">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="cart-item-img" 
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60';
                  }}
                />
                <div className="cart-item-details">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <div className="cart-item-price">रु {item.sellingPrice.toLocaleString()} each</div>
                </div>

                <div className="quantity-controls">
                  <button 
                    className="qty-btn"
                    onClick={() => updateCartQty(item._id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button 
                    className="qty-btn"
                    onClick={() => updateCartQty(item._id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                  >
                    +
                  </button>
                </div>

                <div style={{ textAlign: 'right', minWidth: '90px' }}>
                  <div style={{ fontWeight: '800', color: '#fff', fontSize: '1rem' }}>
                    रु {(item.sellingPrice * item.quantity).toLocaleString()}
                  </div>
                </div>

                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item._id)}
                  title="Remove Item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Checkout & Form */}
          <div className="glass-panel checkout-panel">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem' }}>Order Details & Checkout</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={14} /> Full Customer Name *
                </label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. Ramesh Thapa"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={14} /> Phone Number *
                </label>
                <input 
                  type="tel" 
                  className="form-input"
                  placeholder="e.g. 9841234567"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} /> Shipping Address *
                </label>
                <textarea 
                  className="form-input"
                  placeholder="e.g. Kathmandu, New Road, House #42"
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div style={{ marginTop: '1.5rem', background: 'rgba(0, 0, 0, 0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>रु {subtotal.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Charge</span>
                  <span style={{ color: '#10b981', fontWeight: '600' }}>FREE</span>
                </div>
                <div className="summary-total summary-row">
                  <span>Total Calculated Amount</span>
                  <span style={{ color: '#38bdf8' }}>रु {subtotal.toLocaleString()}</span>
                </div>
              </div>

              <button 
                type="submit"
                className="add-cart-btn"
                disabled={submittingOrder}
                style={{ width: '100%', padding: '0.9rem' }}
              >
                <Send size={18} />
                {submittingOrder ? 'Saving to Database...' : 'Confirm & Submit Order'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
