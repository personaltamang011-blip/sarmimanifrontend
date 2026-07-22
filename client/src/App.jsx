import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import MainProductsPage from './components/MainProductsPage';
import CartPage from './components/CartPage';
import AdminPanel from './components/AdminPanel';

const getApiBase = () => {
  // 1. Explicit Environment Variable (for Vercel / Netlify split frontend deployment)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // 2. Automatic Relative Host Resolution (for Render / Railway / Single-host deployment)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.origin}/api`;
  }
  // 3. Fallback for Local Development
  return '/api';
};

const API_BASE = getApiBase();

export default function App() {
  // Navigation State ('home', 'cart', 'admin')
  const [currentTab, setCurrentTab] = useState('home');

  // Application Data States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    totalProfit: 0
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Toast Notification Helper
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Fetch initial data from Express API connected to MongoDB Atlas
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/products`);
      const normalizedProducts = Array.isArray(res.data) ? res.data : [];
      setProducts(normalizedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
      showToast('Could not connect to backend server. Make sure server is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dashboard/stats`);
      setDashboardStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const refreshAllData = () => {
    fetchProducts();
    fetchOrders();
    fetchDashboardStats();
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Cart operations
  const addToCart = (product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast(`"${product.name}" is OUT OF STOCK!`, 'error');
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item._id === product._id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          showToast(`Cannot add more. Remaining stock is ${product.stock}`, 'error');
          return prevCart;
        }
        showToast(`Updated "${product.name}" quantity in cart!`);
        return prevCart.map(item =>
          item._id === product._id ? { ...item, quantity: newQty } : item
        );
      } else {
        showToast(`Added "${product.name}" to your cart!`);
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  const updateCartQty = (id, quantity) => {
    const targetProduct = products.find(p => p._id === id);
    if (targetProduct && quantity > targetProduct.stock) {
      showToast(`Stock limit reached! Only ${targetProduct.stock} items available.`, 'error');
      return;
    }
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(prev => prev.map(item => item._id === id ? { ...item, quantity } : item));
    }
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
    showToast('Item removed from cart.');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Submit Order to MongoDB
  const submitOrder = async (orderData) => {
    try {
      const res = await axios.post(`${API_BASE}/orders`, orderData);
      showToast('Order submitted successfully!', 'success');
      refreshAllData(); // sync products stock and orders
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit order to database.';
      showToast(msg, 'error');
      throw err;
    }
  };

  // Product Admin Operations
  const addProduct = async (productData) => {
    try {
      const res = await axios.post(`${API_BASE}/products`, productData);
      showToast('New product saved to MongoDB database!', 'success');
      refreshAllData();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add product.';
      showToast(msg, 'error');
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const res = await axios.put(`${API_BASE}/products/${id}`, productData);
      showToast('Product updated successfully in MongoDB!', 'success');
      refreshAllData();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update product.';
      showToast(msg, 'error');
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${API_BASE}/products/${id}`);
      showToast('Product deleted from database.', 'success');
      refreshAllData();
    } catch (err) {
      showToast('Failed to delete product.', 'error');
    }
  };

  // Order Admin Operations
  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE}/orders/${id}`, { status });
      showToast(`Order status updated to "${status}" in MongoDB!`, 'success');
      refreshAllData();
    } catch (err) {
      showToast('Failed to update order status.', 'error');
    }
  };

  const deleteOrder = async (id) => {
    try {
      await axios.delete(`${API_BASE}/orders/${id}`);
      showToast('Order deleted from database.', 'success');
      refreshAllData();
    } catch (err) {
      showToast('Failed to delete order.', 'error');
    }
  };

  const clearAllOrders = async () => {
    try {
      await axios.delete(`${API_BASE}/orders`);
      showToast('All orders cleared from database.', 'success');
      refreshAllData();
    } catch (err) {
      showToast('Failed to clear all orders.', 'error');
    }
  };

  const openAdminModal = () => {
    setCurrentTab('admin');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Glassmorphic Navbar */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdminLoggedIn={isAdminLoggedIn}
        openAdminModal={openAdminModal}
      />

      {/* Main Content Area based on active view */}
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {currentTab === 'home' && (
          <MainProductsPage 
            products={products}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            addToCart={addToCart}
          />
        )}

        {currentTab === 'cart' && (
          <CartPage 
            cart={cart}
            updateCartQty={updateCartQty}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            setCurrentTab={setCurrentTab}
            submitOrder={submitOrder}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanel 
            products={products}
            orders={orders}
            dashboardStats={dashboardStats}
            refreshData={refreshAllData}
            addProduct={addProduct}
            updateProduct={updateProduct}
            deleteProduct={deleteProduct}
            updateOrderStatus={updateOrderStatus}
            deleteOrder={deleteOrder}
            clearAllOrders={clearAllOrders}
            isAdminLoggedIn={isAdminLoggedIn}
            setIsAdminLoggedIn={setIsAdminLoggedIn}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.9)', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>© {new Date().getFullYear()} <strong>sarmimani mart</strong>. Powered by MongoDB Atlas. All rights reserved.</p>
      </footer>

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast" style={{ borderColor: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#10b981' : 'var(--primary)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: toast.type === 'error' ? '#ef4444' : toast.type === 'success' ? '#10b981' : '#6366f1' }} />
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
