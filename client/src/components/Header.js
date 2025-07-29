import React from 'react';

const Header = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'catalog', label: '🛍️ Catalog', title: 'Browse Products' },
    { id: 'dashboard', label: '📊 Dashboard', title: 'Overview' },
    { id: 'tracking', label: '📦 Tracking', title: 'Track Orders' }
  ];

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          🛒 EcomStore
        </div>
        <nav className="nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.title}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;