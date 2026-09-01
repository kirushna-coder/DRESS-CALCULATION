// ============================================================
// SmartTailor AI – Customer Directory Module
// ============================================================

import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Phone,
  Mail,
  Scissors,
  Trash2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { Customer, ActiveTab } from '../types';

interface CustomerDirectoryProps {
  customers: Customer[];
  onSelectCustomerForCalc: (cust: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onNavigate: (tab: ActiveTab) => void;
}

const CustomerDirectory: React.FC<CustomerDirectoryProps> = ({
  customers,
  onSelectCustomerForCalc,
  onDeleteCustomer,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="customers-container">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="orders-header-row">
        <div>
          <h2 className="orders-title">Customer Measurement Profiles</h2>
          <p className="orders-sub">
            Maintain reusable body measurement histories and custom fit notes
          </p>
        </div>

        <button
          type="button"
          className="btn-primary-action"
          onClick={() => onNavigate('calculator')}
        >
          <UserPlus size={16} />
          <span>New Customer Profile</span>
        </button>
      </div>

      {/* ── Search Bar ──────────────────────────────────── */}
      <div className="orders-filter-bar">
        <div className="search-input-wrap">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search customers by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Customers Grid ──────────────────────────────── */}
      <div className="customers-cards-grid">
        {filteredCustomers.map((cust) => {
          const m = cust.measurements;
          return (
            <div key={cust.id} className="customer-card">
              <div className="customer-card-header">
                <div className="customer-avatar-initials">
                  {cust.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="customer-header-details">
                  <h3 className="cust-title">{cust.name}</h3>
                  <span className="cust-meta-badge">
                    {cust.gender} &bull; Age {cust.age || 26} &bull; Size {m.dressSize}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-delete-cust"
                  onClick={() => onDeleteCustomer(cust.id)}
                  title="Remove customer profile"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Contact Info */}
              <div className="customer-contact-list">
                {cust.phone && (
                  <div className="contact-item">
                    <Phone size={13} className="contact-icon" />
                    <span>{cust.phone}</span>
                  </div>
                )}
                {cust.email && (
                  <div className="contact-item">
                    <Mail size={13} className="contact-icon" />
                    <span>{cust.email}</span>
                  </div>
                )}
              </div>

              {/* Measurement Highlights Grid */}
              <div className="customer-meas-mini-grid">
                <div className="mini-meas-box">
                  <span className="mini-lbl">Bust</span>
                  <span className="mini-val">{m.bust}"</span>
                </div>
                <div className="mini-meas-box">
                  <span className="mini-lbl">Waist</span>
                  <span className="mini-val">{m.waist}"</span>
                </div>
                <div className="mini-meas-box">
                  <span className="mini-lbl">Hip</span>
                  <span className="mini-val">{m.hip}"</span>
                </div>
                <div className="mini-meas-box">
                  <span className="mini-lbl">Length</span>
                  <span className="mini-val">{m.fullLength}"</span>
                </div>
              </div>

              {/* Notes */}
              {cust.notes && (
                <p className="customer-card-notes">
                  <Sparkles size={11} className="sparkle-icon" />
                  <span>{cust.notes}</span>
                </p>
              )}

              {/* Card Action */}
              <div className="customer-card-footer">
                <button
                  type="button"
                  className="btn-load-customer"
                  onClick={() => onSelectCustomerForCalc(cust)}
                >
                  <Scissors size={14} />
                  <span>Start Calculation</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerDirectory;
