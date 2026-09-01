// ============================================================
// SmartTailor AI – Top Navigation & Branding Bar
// ============================================================

import React from 'react';
import {
  Scissors,
  LayoutDashboard,
  Calculator,
  Compass,
  ShoppingBag,
  Users,
  Sparkles,
  DollarSign,
  Ruler,
} from 'lucide-react';
import type { ActiveTab, Currency, Unit } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  unit: Unit;
  onUnitChange: (u: Unit) => void;
  ordersCount: number;
  customersCount: number;
}

const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  currency,
  onCurrencyChange,
  unit,
  onUnitChange,
  ordersCount,
  customersCount,
}) => {
  return (
    <header className="smart-nav">
      {/* Brand & Identity */}
      <div className="nav-brand" onClick={() => onTabChange('dashboard')} role="button" tabIndex={0}>
        <div className="brand-logo-glow">
          <Scissors size={20} className="brand-icon" />
        </div>
        <div className="brand-text">
          <div className="brand-title-row">
            <span className="brand-name">SmartTailor</span>
            <span className="brand-badge-ai">
              <Sparkles size={10} /> AI
            </span>
          </div>
          <span className="brand-tagline">Intelligent Dress Calculation & Tailoring</span>
        </div>
      </div>

      {/* Center Tab Navigation */}
      <nav className="nav-tabs" aria-label="Main Navigation">
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
        >
          <LayoutDashboard size={15} />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => onTabChange('calculator')}
        >
          <Calculator size={15} />
          <span>Smart Calculator</span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'cad_studio' ? 'active' : ''}`}
          onClick={() => onTabChange('cad_studio')}
        >
          <Compass size={15} />
          <span>CAD Pattern Studio</span>
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => onTabChange('orders')}
        >
          <ShoppingBag size={15} />
          <span>Orders</span>
          {ordersCount > 0 && <span className="tab-counter">{ordersCount}</span>}
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => onTabChange('customers')}
        >
          <Users size={15} />
          <span>Customers</span>
          {customersCount > 0 && <span className="tab-counter secondary">{customersCount}</span>}
        </button>
      </nav>

      {/* Right Controls: Currency & Unit switchers */}
      <div className="nav-controls">
        {/* Currency Switcher */}
        <div className="control-pill" title="Select Currency">
          <DollarSign size={13} className="control-icon-muted" />
          <select
            className="currency-select"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as Currency)}
            aria-label="Currency Selector"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
          </select>
        </div>

        {/* Unit Switcher */}
        <div className="unit-pill-group" role="group" aria-label="Measurement Units">
          <button
            type="button"
            className={`unit-pill-btn ${unit === 'in' ? 'active' : ''}`}
            onClick={() => onUnitChange('in')}
          >
            <Ruler size={12} />
            <span>Inches</span>
          </button>
          <button
            type="button"
            className={`unit-pill-btn ${unit === 'cm' ? 'active' : ''}`}
            onClick={() => onUnitChange('cm')}
          >
            <span>CM</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
