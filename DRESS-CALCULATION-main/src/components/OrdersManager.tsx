// ============================================================
// SmartTailor AI – Orders Management System
// Status tracking (Pending, In Progress, Ready, Delivered), search, filter & invoices
// ============================================================

import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Eye,
  Trash2,
  Plus,
} from 'lucide-react';
import type { Order, OrderStatus, Currency, ActiveTab } from '../types';
import { DRESS_TYPE_INFO } from '../utils/demoData';

interface OrdersManagerProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onViewInvoice: (order: Order) => void;
  onNavigate: (tab: ActiveTab) => void;
  currency: Currency;
}

const OrdersManager: React.FC<OrdersManagerProps> = ({
  orders,
  onUpdateStatus,
  onDeleteOrder,
  onViewInvoice,
  onNavigate,
  currency,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

  const currencySymbol =
    currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.dressType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const inProgressCount = orders.filter((o) => o.status === 'in_progress').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  return (
    <div className="orders-container">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="orders-header-row">
        <div>
          <h2 className="orders-title">Order Management &amp; Workshop Queue</h2>
          <p className="orders-sub">
            Track cutting progress, manage customer deliverables, and issue invoices
          </p>
        </div>

        <button
          type="button"
          className="btn-primary-action"
          onClick={() => onNavigate('calculator')}
        >
          <Plus size={16} />
          <span>New Calculation &amp; Order</span>
        </button>
      </div>

      {/* ── Filter Bar & Search ──────────────────────────── */}
      <div className="orders-filter-bar">
        {/* Search */}
        <div className="search-input-wrap">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by customer name, order #, or garment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="status-filter-group">
          <button
            type="button"
            className={`filter-pill-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({orders.length})
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            ⏳ Pending ({pendingCount})
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${statusFilter === 'in_progress' ? 'active' : ''}`}
            onClick={() => setStatusFilter('in_progress')}
          >
            ⚙️ In Progress ({inProgressCount})
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${statusFilter === 'ready' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ready')}
          >
            ✨ Ready ({readyCount})
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${statusFilter === 'delivered' ? 'active' : ''}`}
            onClick={() => setStatusFilter('delivered')}
          >
            ✅ Delivered ({deliveredCount})
          </button>
        </div>
      </div>

      {/* ── Orders Table / List ─────────────────────────── */}
      <div className="panel-card orders-table-panel">
        {filteredOrders.length > 0 ? (
          <div className="table-responsive">
            <table className="dashboard-table orders-full-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer Info</th>
                  <th>Garment &amp; Specs</th>
                  <th>Fabric &amp; Color</th>
                  <th>Order Date</th>
                  <th>Due Date</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => {
                  const dressInfo = DRESS_TYPE_INFO[ord.dressType];
                  return (
                    <tr key={ord.id}>
                      <td className="font-mono font-semibold">{ord.orderNumber}</td>
                      <td>
                        <div className="customer-cell">
                          <span className="cust-name">{ord.customerName}</span>
                          <span className="cust-phone">{ord.customerPhone}</span>
                        </div>
                      </td>
                      <td>
                        <span className="garment-tag">
                          {dressInfo?.icon || '👗'} {dressInfo?.label || ord.dressType}
                        </span>
                        <div className="table-sub-desc">
                          {ord.fabricLengthMeters}m fabric &bull; Size {ord.measurements.dressSize}
                        </div>
                      </td>
                      <td>
                        <div className="fabric-color-cell">
                          <span
                            className="color-swatch-sm"
                            style={{ backgroundColor: ord.fabricColor }}
                            title={ord.fabricColor}
                          />
                          <span className="fabric-text">{ord.fabricType}</span>
                        </div>
                      </td>
                      <td className="text-muted">{ord.orderDate}</td>
                      <td className="font-semibold">{ord.deliveryDueDate}</td>
                      <td className="font-semibold text-primary">
                        {currencySymbol}
                        {ord.totalCost.toLocaleString()}
                      </td>
                      <td>
                        <select
                          className={`status-select-badge status-${ord.status}`}
                          value={ord.status}
                          onChange={(e) =>
                            onUpdateStatus(ord.id, e.target.value as OrderStatus)
                          }
                          aria-label="Change Order Status"
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="in_progress">⚙️ In Progress</option>
                          <option value="ready">✨ Ready</option>
                          <option value="delivered">✅ Delivered</option>
                        </select>
                      </td>
                      <td className="text-right">
                        <div className="action-buttons-inline">
                          <button
                            type="button"
                            className="btn-table-action"
                            onClick={() => onViewInvoice(ord)}
                            title="View / Print Invoice"
                          >
                            <Eye size={14} />
                            <span>Invoice</span>
                          </button>
                          <button
                            type="button"
                            className="btn-table-action danger"
                            onClick={() => onDeleteOrder(ord.id)}
                            title="Delete Order"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-orders-state">
            <ShoppingBag size={36} className="empty-icon-muted" />
            <h4 className="empty-title">No orders found</h4>
            <p className="empty-sub">Try changing your search terms or create a new order.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManager;
