import React, { useState, useEffect } from 'react';
import { 
  Lock, KeyRound, ShoppingBag, Package, DollarSign, TrendingUp, 
  Plus, Edit2, Trash2, Save, Image, RefreshCw, X, AlertCircle, Download
} from 'lucide-react';

export default function AdminPanel({
  products,
  orders,
  dashboardStats,
  refreshData,
  addProduct,
  updateProduct,
  deleteProduct,
  updateOrderStatus,
  deleteOrder,
  clearAllOrders,
  isAdminLoggedIn,
  setIsAdminLoggedIn
}) {
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Admin Sub-tab ('dashboard', 'products', 'orders')
  const [adminSubTab, setAdminSubTab] = useState('dashboard');

  // Product Form state
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    description: '',
    costPrice: '',
    sellingPrice: '',
    stock: '',
    image: ''
  });

  const [imagePreview, setImagePreview] = useState('');
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [statusDrafts, setStatusDrafts] = useState({});

  // Export Orders Table to CSV File with UTF-8 BOM (prevents data truncation in Excel)
  const exportToCSV = () => {
    if (orders.length === 0) {
      alert('No orders available to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Date Nepali',
      'Date English',
      'Customer Name',
      'Phone No',
      'Address',
      'Items',
      'Total Cost Price',
      'Total Selling Price',
      'Total Amount',
      'Status'
    ];

    const rows = orders.map(o => {
      const itemsStr = o.items.map(i => `${i.name} (x${i.quantity})`).join('; ');
      return [
        `"${(o.orderId || '').replace(/"/g, '""')}"`,
        `"${(o.dateNepali || '').replace(/"/g, '""')}"`,
        `"${(o.dateEnglish || '').replace(/"/g, '""')}"`,
        `"${(o.customerName || '').replace(/"/g, '""')}"`,
        `"${(o.phone || '').replace(/"/g, '""')}"`,
        `"${(o.address || '').replace(/"/g, '""')}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
        o.totalCostPrice || 0,
        o.totalSellingPrice || 0,
        o.totalAmount || 0,
        `"${(o.status || 'Pending').replace(/"/g, '""')}"`
      ];
    });

    // \uFEFF is UTF-8 Byte Order Mark for full unicode support
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sarmimani_mart_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV import removed from admin panel

  // Initialize statusDrafts when orders change
  useEffect(() => {
    const initial = {};
    orders.forEach(o => {
      initial[o._id] = o.status;
    });
    setStatusDrafts(initial);
  }, [orders]);

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === '246810') {
      setIsAdminLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password! Please try again.');
    }
  };

  // Image Upload Reader (Computer upload -> Base64 data string saved to MongoDB)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large! Please choose an image under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setProductForm(prev => ({ ...prev, image: base64String }));
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Submit Product Form (Create or Edit)
  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!productForm.name || !productForm.costPrice || !productForm.sellingPrice || productForm.stock === '') {
      alert('Please fill out all required fields.');
      return;
    }

    if (!productForm.image) {
      alert('Please select a product image from your computer.');
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      costPrice: parseFloat(productForm.costPrice),
      sellingPrice: parseFloat(productForm.sellingPrice),
      stock: parseInt(productForm.stock, 10),
      image: productForm.image
    };

    if (isEditingProduct) {
      await updateProduct(productForm.id, payload);
    } else {
      await addProduct(payload);
    }

    // Reset Form
    resetProductForm();
  };

  const handleEditClick = (product) => {
    setProductForm({
      id: product._id,
      name: product.name,
      description: product.description || '',
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      image: product.image
    });
    setImagePreview(product.image);
    setIsEditingProduct(true);
    setAdminSubTab('products');
  };

  const resetProductForm = () => {
    setProductForm({
      id: null,
      name: '',
      description: '',
      costPrice: '',
      sellingPrice: '',
      stock: '',
      image: ''
    });
    setImagePreview('');
    setIsEditingProduct(false);
  };

  const handleStatusChange = (orderId, newStatus) => {
    setStatusDrafts(prev => ({ ...prev, [orderId]: newStatus }));
  };

  const handleSaveStatus = async (orderId) => {
    const statusToSave = statusDrafts[orderId];
    if (statusToSave) {
      await updateOrderStatus(orderId, statusToSave);
    }
  };

  // Password Login Modal Gate
  if (!isAdminLoggedIn) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Lock size={28} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Admin Panel Access</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Enter password to manage products, orders & database.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="Enter admin password (246810)"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {loginError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.65rem 1rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> {loginError}
              </div>
            )}

            <button type="submit" className="add-cart-btn" style={{ width: '100%', padding: '0.85rem' }}>
              Unlock Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Top Header & Sub-nav Options */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Admin Control Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Connected to MongoDB Atlas: <strong>mymartDB</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            className="nav-btn"
            onClick={refreshData}
            title="Refresh database records"
          >
            <RefreshCw size={16} /> Sync DB
          </button>
          
          <button 
            className="btn-delete"
            style={{ padding: '0.65rem 1rem' }}
            onClick={() => setIsAdminLoggedIn(false)}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Admin Sub-Tabs Navigation Options */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`nav-btn ${adminSubTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setAdminSubTab('dashboard')}
        >
          <TrendingUp size={18} /> Dashboard & Monitoring
        </button>
        <button 
          className={`nav-btn ${adminSubTab === 'products' ? 'active' : ''}`}
          onClick={() => setAdminSubTab('products')}
        >
          <Package size={18} /> Product Option ({products.length})
        </button>
        <button 
          className={`nav-btn ${adminSubTab === 'orders' ? 'active' : ''}`}
          onClick={() => setAdminSubTab('orders')}
        >
          <ShoppingBag size={18} /> Order Option ({orders.length})
        </button>
      </div>

      {/* 1. DASHBOARD MONITORING SYSTEM */}
      {adminSubTab === 'dashboard' && (
        <div>
          <div className="dashboard-grid">
            <div className="glass-panel dash-card">
              <div className="dash-icon blue">
                <ShoppingBag size={26} />
              </div>
              <div>
                <div className="dash-val">{dashboardStats.totalOrders}</div>
                <div className="dash-lbl">Total Orders</div>
              </div>
            </div>

            <div className="glass-panel dash-card">
              <div className="dash-icon purple">
                <Package size={26} />
              </div>
              <div>
                <div className="dash-val">{dashboardStats.totalProducts}</div>
                <div className="dash-lbl">Total Products</div>
              </div>
            </div>

            <div className="glass-panel dash-card">
              <div className="dash-icon green">
                <TrendingUp size={26} />
              </div>
              <div>
                <div className="dash-val" style={{ color: '#10b981' }}>
                  रु {dashboardStats.totalProfit.toLocaleString()}
                </div>
                <div className="dash-lbl">Net Profit (Delivered Only)</div>
              </div>
            </div>

            <div className="glass-panel dash-card">
              <div className="dash-icon amber">
                <DollarSign size={26} />
              </div>
              <div>
                <div className="dash-val" style={{ color: '#f59e0b' }}>
                  रु {dashboardStats.totalRevenue.toLocaleString()}
                </div>
                <div className="dash-lbl">Total Revenue</div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>
              System Quick Overview & Alert Status
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ color: '#38bdf8', marginBottom: '0.5rem' }}>Inventory Health</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Total In Stock Products: {products.filter(p => p.stock > 0).length} items
                </p>
                <p style={{ fontSize: '0.9rem', color: '#ef4444', marginTop: '0.25rem' }}>
                  Out of Stock Products: {products.filter(p => p.stock <= 0).length} items
                </p>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>Order Status Breakdown</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Pending Orders: {orders.filter(o => o.status === 'Pending').length}
                </p>
                <p style={{ fontSize: '0.9rem', color: '#10b981', marginTop: '0.25rem' }}>
                  Delivered / Confirmed: {orders.filter(o => o.status === 'Delivered' || o.status === 'Confirmed').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCT OPTION (Add/Edit Product & Stock System) */}
      {adminSubTab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Add / Edit Product Form */}
          <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                {isEditingProduct ? 'Edit Product' : 'Upload New Product'}
              </h3>
              {isEditingProduct && (
                <button onClick={resetProductForm} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              )}
            </div>

            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label className="form-label">Product Image (Upload from Computer) *</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="form-input"
                  style={{ padding: '0.5rem' }}
                />
                {imagePreview && (
                  <div style={{ marginTop: '0.75rem', height: '140px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Wireless Headphones"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  placeholder="Product specifications & details"
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Cost Price (रु) *</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    className="form-input" 
                    placeholder="e.g. 500"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Selling Price (रु) *</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    className="form-input" 
                    placeholder="e.g. 850"
                    value={productForm.sellingPrice}
                    onChange={(e) => setProductForm({ ...productForm, sellingPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Stock Quantity *</label>
                <input 
                  type="number" 
                  min="0"
                  className="form-input" 
                  placeholder="e.g. 15"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="add-cart-btn" style={{ width: '100%', marginTop: '0.5rem' }}>
                <Plus size={18} />
                {isEditingProduct ? 'Save Changes' : 'Save to MongoDB Database'}
              </button>
            </form>
          </div>

          {/* Product List Table */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem' }}>
              Products Saved in Database ({products.length})
            </h3>

            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Cost Price</th>
                    <th>Selling Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No products available in database yet. Add your first product on the left!
                      </td>
                    </tr>
                  ) : (
                    products.map(p => (
                      <tr key={p._id}>
                        <td>
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} 
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=60'; }}
                          />
                        </td>
                        <td>
                          <strong style={{ color: '#fff', display: 'block' }}>{p.name}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.description ? p.description.slice(0, 30) + '...' : ''}</span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>रु {p.costPrice.toLocaleString()}</td>
                        <td style={{ color: '#38bdf8', fontWeight: '700' }}>रु {p.sellingPrice.toLocaleString()}</td>
                        <td>
                          <span className={`stock-tag ${p.stock <= 0 ? 'stock-out' : 'stock-in'}`} style={{ position: 'static', padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                            {p.stock <= 0 ? '0 (Out)' : `${p.stock} units`}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              className="btn-save"
                              onClick={() => handleEditClick(p)}
                              title="Edit product"
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => {
                                if (window.confirm(`Delete "${p.name}" from database?`)) {
                                  deleteProduct(p._id);
                                }
                              }}
                              title="Delete product"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. ORDER OPTION (Complete Database Orders Table) */}
      {adminSubTab === 'orders' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  {/* CSV import removed */}

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              Customer Orders Database ({orders.length})
            </h3>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button 
                className="btn-save"
                onClick={exportToCSV}
                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                title="Export order details to CSV file"
              >
                <Download size={16} /> Export CSV
              </button>

              <button 
                className="btn-delete"
                onClick={() => {
                  if (orders.length === 0) {
                    alert('No orders available to clear.');
                    return;
                  }
                  if (window.confirm('Are you sure you want to CLEAR ALL ORDERS from the database? This action cannot be undone.')) {
                    clearAllOrders();
                  }
                }}
                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                title="Delete all orders from database"
              >
                <Trash2 size={16} /> Clear All Orders
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date (Nepali & English)</th>
                  <th>Customer Name</th>
                  <th>Phone No</th>
                  <th>Address</th>
                  <th>Items</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No customer orders recorded in database yet.
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order._id}>
                      <td>
                        <strong style={{ color: '#38bdf8' }}>{order.orderId}</strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.85rem' }}>{order.dateNepali}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.dateEnglish}</div>
                      </td>
                      <td style={{ fontWeight: '600', color: '#fff' }}>{order.customerName}</td>
                      <td>{order.phone}</td>
                      <td style={{ maxWidth: '160px', wordBreak: 'break-word', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.address}</td>
                      <td>
                        <ul style={{ listStyle: 'none', fontSize: '0.85rem' }}>
                          {order.items.map((it, idx) => (
                            <li key={idx} style={{ marginBottom: '0.2rem' }}>
                              • {it.name} (x{it.quantity})
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        रु {(order.totalCostPrice || 0).toLocaleString()}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        रु {(order.totalSellingPrice || 0).toLocaleString()}
                      </td>
                      <td style={{ color: '#10b981', fontWeight: '800', fontSize: '0.95rem' }}>
                        रु {(order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td>
                        <select 
                          className={`status-select status-${statusDrafts[order._id] || order.status}`}
                          value={statusDrafts[order._id] || order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Canceled">Canceled</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexDirection: 'column' }}>
                          <button 
                            className="btn-save"
                            onClick={() => handleSaveStatus(order._id)}
                            title="Save status update to database"
                          >
                            <Save size={14} /> Save
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => {
                              if (window.confirm(`Delete order ${order.orderId}?`)) {
                                deleteOrder(order._id);
                              }
                            }}
                            title="Delete order"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
