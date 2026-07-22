import React, { useState } from 'react';
import { ShoppingBag, Search, ShoppingCart, ShieldCheck, Menu, X } from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  cartCount, 
  searchQuery, 
  setSearchQuery,
  isAdminLoggedIn,
  openAdminModal
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavSelect = (tab) => {
    setCurrentTab(tab);
    setMenuOpen(false);
  };

  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      setCurrentTab('admin');
    } else {
      openAdminModal();
    }
    setMenuOpen(false);
  };

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
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className={`nav-actions-list ${menuOpen ? 'open' : ''}`}>
            <button 
              className={`nav-btn ${currentTab === 'home' ? 'active' : ''}`}
              onClick={() => handleNavSelect('home')}
            >
              Products
            </button>

            <button 
              className={`nav-btn ${currentTab === 'cart' ? 'active' : ''}`}
              onClick={() => handleNavSelect('cart')}
            >
              <ShoppingCart size={18} />
              Cart
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </button>

            <button 
              className={`nav-btn ${currentTab === 'admin' ? 'active' : ''}`}
              onClick={handleAdminClick}
              style={{ borderColor: isAdminLoggedIn ? '#10b981' : 'transparent' }}
            >
              <ShieldCheck size={18} style={{ color: isAdminLoggedIn ? '#10b981' : 'inherit' }} />
              {isAdminLoggedIn ? 'Admin Panel' : 'Admin Login'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
