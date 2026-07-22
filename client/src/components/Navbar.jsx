import React from 'react';
import { ShoppingBag, Search, ShoppingCart, ShieldCheck } from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  cartCount, 
  searchQuery, 
  setSearchQuery,
  isAdminLoggedIn,
  openAdminModal
}) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand Logo */}
        <div className="logo-brand" onClick={() => setCurrentTab('home')}>
          <ShoppingBag size={28} style={{ color: '#6366f1' }} />
          <span>sarmimani mart</span>
        </div>

        {/* Live Search Bar */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentTab !== 'home') setCurrentTab('home');
            }}
          />
        </div>

        {/* Navigation Action Buttons */}
        <div className="nav-actions">
          <button 
            className={`nav-btn ${currentTab === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentTab('home')}
          >
            Products
          </button>

          <button 
            className={`nav-btn ${currentTab === 'cart' ? 'active' : ''}`}
            onClick={() => setCurrentTab('cart')}
          >
            <ShoppingCart size={18} />
            Cart
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>

          <button 
            className={`nav-btn ${currentTab === 'admin' ? 'active' : ''}`}
            onClick={() => {
              if (isAdminLoggedIn) {
                setCurrentTab('admin');
              } else {
                openAdminModal();
              }
            }}
            style={{ borderColor: isAdminLoggedIn ? '#10b981' : 'transparent' }}
          >
            <ShieldCheck size={18} style={{ color: isAdminLoggedIn ? '#10b981' : 'inherit' }} />
            {isAdminLoggedIn ? 'Admin Panel' : 'Admin Login'}
          </button>
        </div>
      </div>
    </nav>
  );
}
