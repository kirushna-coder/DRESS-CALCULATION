// ============================================================
// SmartTailor AI – Modern Tailoring Dashboard
// Live business metrics, quick actions, popular dress stats & recent orders
// ============================================================

import React from 'react';
import {
  Users,
  ShoppingBag,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Scissors,
  Eye,
} from 'lucide-react';
import type { Customer, Order, OrderStatus, Currency, ActiveTab } from '../types';
import { DRESS_TYPE_INFO } from '../utils/demoData';

interface DashboardProps {
  customers: Customer[];
  orders: Order[];
  currency: Currency;
  onNavigate: (tab: ActiveTab) => void;
  onSelectOrder: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  customers,
  orders,
  currency,
  onNavigate,
  onSelectOrder,
  onUpdateOrderStatus,
}) => {
  const totalCustomers = customers.length;
  const totalOrders = orders.length;

  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.totalCost || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const cuttingOrders = orders.filter((o) => o.status === 'cutting').length;
  const stitchingOrders = orders.filter((o) => o.status === 'stitching' || o.status === 'in_progress').length;
  const readyOrders = orders.filter((o) => o.status === 'ready').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;

  const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

  // ── Popular Dress Breakdown ──────────────────────────────
  const dressCounts: Record<string, number> = {};
  orders.forEach((o) => {
    dressCounts[o.dressType] = (dressCounts[o.dressType] || 0) + 1;
  });

  const popularDresses = Object.entries(dressCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="dashboard-container">
      {/* ── Hero Welcome & Actions ───────────────────────── */}
      <section className="dashboard-hero">
        <div className="hero-text-block">
          <div className="hero-badge">
            <Sparkles size={13} className="hero-sparkle" />
            <span>AI-Powered Tailoring Intelligence</span>
          </div>
          <h1 className="hero-title">Studio Management &amp; Calculation Hub</h1>
          <p className="hero-desc">
            Transform customer body metrics into precise fabric lengths, cutting layouts, itemized cost estimates, and CAD pattern drafts.
          </p>
        </div>

        <div className="hero-actions-grid">
          <button
            type="button"
            className="hero-action-btn primary"
            onClick={() => onNavigate('calculator')}
          >
            <div className="btn-icon-circle">
              <PlusCircle size={18} />
            </div>
            <div className="btn-text-block">
              <span className="btn-title">New Smart Calculation</span>
              <span className="btn-sub">Measure &bull; Fabric &bull; AI Estimate</span>
            </div>
            <ArrowRight size={16} className="btn-arrow" />
          </button>

          <button
            type="button"
            className="hero-action-btn secondary"
            onClick={() => onNavigate('cad_studio')}
          >
            <div className="btn-icon-circle accent">
              <Scissors size={18} />
            </div>
            <div className="btn-text-block">
              <span className="btn-title">CAD Pattern Studio</span>
              <span className="btn-sub">Drafting &bull; SVG &bull; PDF Export</span>
            </div>
            <ArrowRight size={16} className="btn-arrow" />
          </button>
        </div>
      </section>

      {/* ── Key Metrics Cards ────────────────────────────── */}
      <section className="metrics-grid">
        {/* Total Customers */}
        <div className="metric-card" onClick={() => onNavigate('customers')} role="button" tabIndex={0}>
          <div className="metric-icon-wrap blue">
            <Users size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Total Customers</span>
            <div className="metric-value-row">
              <span className="metric-number">{totalCustomers}</span>
              <span className="metric-sub-badge positive">+12% this mo</span>
            </div>
            <span className="metric-footer-text">Registered measurement profiles</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="metric-card" onClick={() => onNavigate('orders')} role="button" tabIndex={0}>
          <div className="metric-icon-wrap purple">
            <ShoppingBag size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Total Orders</span>
            <div className="metric-value-row">
              <span className="metric-number">{totalOrders}</span>
              <span className="metric-status-dots">
                <span className="dot in-progress" title={`${stitchingOrders} In Stitching`} />
                <span className="dot ready" title={`${readyOrders} Ready`} />
              </span>
            </div>
            <span className="metric-footer-text">
              {cuttingOrders + stitchingOrders} active in workshop &bull; {readyOrders} ready
            </span>
          </div>
        </div>

        {/* Estimated Revenue */}
        <div className="metric-card">
          <div className="metric-icon-wrap emerald">
            <TrendingUp size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Estimated Revenue</span>
            <div className="metric-value-row">
              <span className="metric-number">
                {currencySymbol}
                {totalRevenue.toLocaleString()}
              </span>
            </div>
            <span className="metric-footer-text">Across {totalOrders} custom garments</span>
          </div>
        </div>

        {/* Pipeline & Delivery */}
        <div className="metric-card">
          <div className="metric-icon-wrap amber">
            <Clock size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Workshop Pipeline</span>
            <div className="metric-value-row">
              <span className="metric-number">{pendingOrders + cuttingOrders + stitchingOrders}</span>
              <span className="metric-sub-badge warning">Active</span>
            </div>
            <span className="metric-footer-text">{deliveredOrders} successfully delivered</span>
          </div>
        </div>
      </section>

      {/* ── Feature Integration Summary Widgets ─────────── */}
      <section className="dashboard-feature-widgets-grid">
        {/* Widget 1: Latest Fabric Recommendation Summary */}
        <div className="dash-widget-card fabric-rec-widget" onClick={() => onNavigate('calculator')} role="button" tabIndex={0}>
          <div className="widget-header">
            <div className="widget-title-group">
              <div className="widget-icon-bg indigo">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="widget-title">Latest Fabric Recommendation</h4>
                <span className="widget-sub">AI Fabric Engine &bull; Summer / Casual</span>
              </div>
            </div>
            <span className="dash-badge-glow">Active</span>
          </div>
          <div className="widget-body">
            <div className="fabric-summary-hero">
              <span className="dash-fabric-name">Pure Cotton &amp; Linen</span>
              <div className="dash-score-pills">
                <span className="dash-pill comfort">Comfort: 95%</span>
                <span className="dash-pill durability">Durability: 85%</span>
              </div>
            </div>
            <p className="dash-widget-desc">
              Recommended for breathable comfort and minimal fabric waste cutting layout.
            </p>
          </div>
          <div className="widget-footer">
            <span>View Recommendation &bull; Dress Calculation</span>
            <ArrowRight size={13} />
          </div>
        </div>

        {/* Widget 2: Average Fit Confidence Summary */}
        <div className="dash-widget-card fit-conf-widget" onClick={() => onNavigate('ai_insights')} role="button" tabIndex={0}>
          <div className="widget-header">
            <div className="widget-title-group">
              <div className="widget-icon-bg emerald">
                <TrendingUp size={16} />
              </div>
              <div>
                <h4 className="widget-title">Average Fit Confidence</h4>
                <span className="widget-sub">Studio Pattern Precision Metric</span>
              </div>
            </div>
            <span className="dash-badge-emerald">92% Match</span>
          </div>
          <div className="widget-body">
            <div className="fit-summary-hero">
              <div className="mini-meter-circle">
                <span>92%</span>
              </div>
              <div className="fit-summary-info">
                <strong>Excellent Match Status</strong>
                <p>94% of active studio orders fit directly with standard seam margins.</p>
              </div>
            </div>
          </div>
          <div className="widget-footer">
            <span>Open Size Intelligence Studio</span>
            <ArrowRight size={13} />
          </div>
        </div>

        {/* Widget 3: AI Tailor Assistant Shortcut */}
        <div className="dash-widget-card ai-assistant-widget">
          <div className="widget-header">
            <div className="widget-title-group">
              <div className="widget-icon-bg purple">
                <Scissors size={16} />
              </div>
              <div>
                <h4 className="widget-title">AI Tailor Assistant</h4>
                <span className="widget-sub">Instant Fabric &amp; Sizing Q&amp;A</span>
              </div>
            </div>
            <span className="dash-badge-purple">Floating Chat</span>
          </div>
          <div className="widget-body">
            <p className="dash-widget-desc">
              Ask questions about fabric calculations, shirt lengths, slim vs regular fit, or waste reduction.
            </p>
            <div className="dash-quick-questions">
              <span className="dash-q-chip" onClick={() => onNavigate('calculator')}>
                Shirt fabric length?
              </span>
              <span className="dash-q-chip" onClick={() => onNavigate('calculator')}>
                Summer fabrics?
              </span>
              <span className="dash-q-chip" onClick={() => onNavigate('calculator')}>
                Cotton vs Linen
              </span>
            </div>
          </div>
          <div className="widget-footer">
            <span>Use Floating Chat Button at bottom right</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </section>

      {/* ── Split Section: Popular Garments & AI Tailoring Tips ── */}
      <div className="dashboard-mid-split">
        {/* Popular Dress Types */}
        <div className="panel-card popular-garments-card">
          <div className="panel-card-header">
            <div>
              <h3 className="panel-title">Popular Garment Demand</h3>
              <p className="panel-sub">Volume breakdown of tailored styles</p>
            </div>
            <span className="tag-pill">{popularDresses.length} Styles</span>
          </div>

          <div className="popular-bars-list">
            {popularDresses.length > 0 ? (
              popularDresses.map(([dressKey, count]) => {
                const info = DRESS_TYPE_INFO[dressKey as keyof typeof DRESS_TYPE_INFO];
                const percent = Math.round((count / Math.max(1, totalOrders)) * 100);
                return (
                  <div key={dressKey} className="popular-bar-row">
                    <div className="popular-bar-info">
                      <span className="garment-emoji">{info?.icon || '👗'}</span>
                      <span className="garment-name">{info?.label || dressKey}</span>
                      <span className="garment-count">
                        {count} orders ({percent}%)
                      </span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${Math.max(15, percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="popular-empty-state">
                <div className="empty-icon-circle">
                  <Scissors size={22} />
                </div>
                <p className="empty-text">No order data yet. Create your first calculation!</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Tailoring Intelligence Widget */}
        <div className="panel-card ai-insights-widget">
          <div className="panel-card-header">
            <div className="ai-widget-title-row">
              <Sparkles size={16} className="ai-glow-icon" />
              <h3 className="panel-title">AI Master Tailor Insights</h3>
            </div>
            <span className="ai-status-badge">Live Advisory</span>
          </div>

          <div className="ai-tips-list">
            <div className="ai-tip-item">
              <div className="tip-bullet gold" />
              <div className="tip-content">
                <strong>Fabric Shrinkage Allowance:</strong>
                <p>Always pre-wash pure cotton (adds ~3% shrinkage). Add 1.5" to full length before marking hems.</p>
              </div>
            </div>

            <div className="ai-tip-item">
              <div className="tip-bullet purple" />
              <div className="tip-content">
                <strong>Wide-Fabric Cutting Efficiency:</strong>
                <p>58" European Linen allows front &amp; back shirt panels to fit on single fold width, cutting fabric waste down to &lt;6%.</p>
              </div>
            </div>

            <div className="ai-tip-item">
              <div className="tip-bullet emerald" />
              <div className="tip-content">
                <strong>Saree Blouse Dart Engineering:</strong>
                <p>For D-cup and higher bust measurements, three-point princess seam reduces front bust tension folds significantly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Orders Table ──────────────────────────── */}
      <section className="panel-card recent-orders-panel">
        <div className="panel-card-header">
          <div>
            <h3 className="panel-title">Recent Tailoring Orders</h3>
            <p className="panel-sub">Monitor orders and quick-switch production status</p>
          </div>
          <button
            type="button"
            className="btn-link"
            onClick={() => onNavigate('orders')}
          >
            <span>View All Orders ({totalOrders})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Garment</th>
                <th>Fabric &amp; Color</th>
                <th>Due Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((ord) => {
                const dressInfo = DRESS_TYPE_INFO[ord.dressType];
                return (
                  <tr key={ord.id}>
                    <td className="font-mono">{ord.orderNumber}</td>
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
                    <td className="text-muted">{ord.deliveryDueDate}</td>
                    <td className="font-semibold">
                      {currencySymbol}
                      {ord.totalCost.toLocaleString()}
                    </td>
                    <td>
                      <select
                        className={`status-select-badge status-${ord.status}`}
                        value={ord.status === 'in_progress' ? 'stitching' : ord.status}
                        onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        aria-label="Update Order Status"
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="cutting">✂️ Cutting</option>
                        <option value="stitching">🪡 Stitching</option>
                        <option value="ready">✨ Ready</option>
                        <option value="delivered">✅ Delivered</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-table-action"
                        onClick={() => onSelectOrder(ord)}
                        title="View Invoice & Details"
                      >
                        <Eye size={14} />
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
