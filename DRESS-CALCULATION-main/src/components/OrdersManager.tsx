// ============================================================
// SmartTailor AI – Complete Order Tracking & Workshop Queue System
// Features 5-Stage Status Tracking: Pending → Cutting → Stitching → Ready → Delivered
// Visual status progress bar, order creation modal, search by name/phone, localStorage persistence
// ============================================================

import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Eye,
  Trash2,
  Plus,
  Clock,
  Scissors,
  Layers,
  Sparkles,
  CheckCircle,
  X,
  Calendar,
  User,
  Phone,
  FileText,
  AlertCircle,
  Ruler,
} from 'lucide-react';
import type { Order, OrderStatus, Currency, ActiveTab, DressType, FabricType, Measurements } from '../types';
import { DRESS_TYPE_INFO, FABRICS, DEFAULT_BODY_MEASUREMENTS } from '../utils/demoData';
import { calculateFabricRequirement } from '../calculations/fabricCalculator';

interface OrdersManagerProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onViewInvoice: (order: Order) => void;
  onNavigate: (tab: ActiveTab) => void;
  onAddOrder: (newOrder: Order) => void;
  currency: Currency;
}

export const ORDER_STAGES: { key: OrderStatus; label: string; icon: React.ReactNode; colorClass: string }[] = [
  { key: 'pending', label: 'Pending', icon: <Clock size={14} />, colorClass: 'stage-pending' },
  { key: 'cutting', label: 'Cutting', icon: <Scissors size={14} />, colorClass: 'stage-cutting' },
  { key: 'stitching', label: 'Stitching', icon: <Layers size={14} />, colorClass: 'stage-stitching' },
  { key: 'ready', label: 'Ready', icon: <Sparkles size={14} />, colorClass: 'stage-ready' },
  { key: 'delivered', label: 'Delivered', icon: <CheckCircle size={14} />, colorClass: 'stage-delivered' },
];

const OrdersManager: React.FC<OrdersManagerProps> = ({
  orders,
  onUpdateStatus,
  onDeleteOrder,
  onViewInvoice,
  onNavigate,
  onAddOrder,
  currency,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

  // Modal State for New Order
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [dressType, setDressType] = useState<DressType>('FROCK');
  const [fabricType, setFabricType] = useState<FabricType>('COTTON');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Form measurements state
  const [mLength, setMLength] = useState(42);
  const [mBust, setMBust] = useState(38);
  const [mWaist, setMWaist] = useState(32);
  const [mHip, setMHip] = useState(40);
  const [mShoulder, setMShoulder] = useState(15);
  const [mSleeve, setMSleeve] = useState(18);

  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string; dates?: string }>({});

  const currencySymbol =
    currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

  // Filter orders by search term (Customer Name or Phone Number) and status
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      order.customerName.toLowerCase().includes(term) ||
      order.customerPhone.toLowerCase().includes(term) ||
      order.orderNumber.toLowerCase().includes(term) ||
      order.dressType.toLowerCase().includes(term);

    // Support legacy 'in_progress' by mapping to 'stitching' or matching status
    const matchesStatus =
      statusFilter === 'all' ||
      order.status === statusFilter ||
      (statusFilter === 'stitching' && order.status === 'in_progress');

    return matchesSearch && matchesStatus;
  });

  // Stage counters
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const cuttingCount = orders.filter((o) => o.status === 'cutting').length;
  const stitchingCount = orders.filter((o) => o.status === 'stitching' || o.status === 'in_progress').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const getStageIndex = (status: OrderStatus) => {
    if (status === 'in_progress') return 2; // maps to stitching
    const idx = ORDER_STAGES.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  // Create Order submit handler
  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { name?: string; phone?: string; dates?: string } = {};

    if (!customerName.trim()) errs.name = 'Customer name is required';
    if (!customerPhone.trim()) errs.phone = 'Phone number is required';
    if (new Date(deliveryDate) < new Date(orderDate)) {
      errs.dates = 'Delivery date cannot be earlier than order date';
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    const customMeasurements: Measurements = {
      ...DEFAULT_BODY_MEASUREMENTS,
      customerName,
      fullLength: mLength,
      bust: mBust,
      waist: mWaist,
      hip: mHip,
      shoulderWidth: mShoulder,
      sleeveLength: mSleeve,
    };

    const calcResult = calculateFabricRequirement({
      garmentType: dressType,
      fabricType: fabricType,
      measurements: customMeasurements,
    });

    const orderNum = `ST-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customerId: `cust-${Date.now()}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      dressType,
      fabricType,
      fabricColor: '#881337',
      fabricLengthMeters: calcResult.requiredLengthMeters,
      measurements: customMeasurements,
      costBreakdown: calcResult,
      totalCost: calcResult.totalCost,
      currency,
      status: 'pending',
      paymentStatus: 'unpaid',
      orderDate,
      deliveryDueDate: deliveryDate,
      specialInstructions: specialInstructions.trim(),
      notes: specialInstructions.trim() || `${dressType} with ${calcResult.requiredLengthMeters}m ${fabricType}`,
    };

    onAddOrder(newOrder);
    setIsModalOpen(false);

    // Reset form
    setCustomerName('');
    setCustomerPhone('');
    setSpecialInstructions('');
    setFormErrors({});
  };

  return (
    <div className="orders-container">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="orders-header-row">
        <div>
          <h2 className="orders-title">Order Tracking &amp; Workshop Queue</h2>
          <p className="orders-sub">
            Track stage progress (Pending → Cutting → Stitching → Ready → Delivered), manage customers, and generate invoices.
          </p>
        </div>

        <div className="orders-header-actions">
          <button
            type="button"
            className="btn-secondary-action mr-2"
            onClick={() => onNavigate('calculator')}
          >
            <Scissors size={15} />
            <span>Dress Calculation</span>
          </button>
          <button
            type="button"
            className="btn-primary-action"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      {/* ── Search & Stage Filter Bar ────────────────────── */}
      <div className="orders-filter-bar">
        {/* Search by Name or Phone */}
        <div className="search-input-wrap">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by customer name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
            >
              <X size={13} />
            </button>
          )}
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
            className={`filter-pill-btn ${statusFilter === 'cutting' ? 'active' : ''}`}
            onClick={() => setStatusFilter('cutting')}
          >
            ✂️ Cutting ({cuttingCount})
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${statusFilter === 'stitching' ? 'active' : ''}`}
            onClick={() => setStatusFilter('stitching')}
          >
            🪡 Stitching ({stitchingCount})
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

      {/* ── Orders List with 5-Stage Tracker ─────────────── */}
      <div className="orders-cards-list">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((ord) => {
            const dressInfo = DRESS_TYPE_INFO[ord.dressType];
            const currentStageIdx = getStageIndex(ord.status);

            return (
              <div key={ord.id} className="panel-card order-tracking-card">
                {/* Top Info Bar */}
                <div className="order-card-header">
                  <div className="order-id-badge">
                    <span className="ord-number">{ord.orderNumber}</span>
                    <span className="garment-tag">
                      {dressInfo?.icon || '👗'} {dressInfo?.label || ord.dressType}
                    </span>
                  </div>

                  <div className="order-dates-group">
                    <span className="date-item">
                      <Calendar size={12} /> Order: <strong>{ord.orderDate}</strong>
                    </span>
                    <span className="date-item due-date">
                      <Clock size={12} /> Delivery: <strong>{ord.deliveryDueDate}</strong>
                    </span>
                  </div>
                </div>

                {/* Customer Details Row */}
                <div className="order-customer-row">
                  <div className="cust-info">
                    <div className="cust-name-phone">
                      <User size={15} className="icon-muted" />
                      <span className="cust-name-bold">{ord.customerName}</span>
                      <Phone size={13} className="icon-muted ml-2" />
                      <span className="cust-phone-num">{ord.customerPhone}</span>
                    </div>

                    <div className="cust-specs-line mt-1">
                      <span>{ord.fabricLengthMeters}m {ord.fabricType}</span>
                      <span className="dot-sep">&bull;</span>
                      <span>Length: {ord.measurements.fullLength}"</span>
                      <span className="dot-sep">&bull;</span>
                      <span>Bust: {ord.measurements.bust}"</span>
                      <span className="dot-sep">&bull;</span>
                      <span>Waist: {ord.measurements.waist}"</span>
                    </div>

                    {(ord.specialInstructions || ord.notes) && (
                      <div className="special-instructions-box mt-2">
                        <FileText size={13} className="text-amber" />
                        <span>
                          <strong>Instructions:</strong> {ord.specialInstructions || ord.notes}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="order-price-box">
                    <span className="price-label">Total Amount</span>
                    <span className="price-value font-bold text-emerald">
                      {currencySymbol}{ord.totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* ── 5-STAGE VISUAL TRACKER ──────────────────── */}
                <div className="visual-status-tracker-container">
                  <div className="tracker-steps-bar">
                    {ORDER_STAGES.map((stage, idx) => {
                      const isPassed = idx <= currentStageIdx;
                      const isActive = idx === currentStageIdx;

                      return (
                        <div
                          key={stage.key}
                          className={`tracker-step-item ${isPassed ? 'passed' : ''} ${
                            isActive ? 'active' : ''
                          }`}
                          onClick={() => onUpdateStatus(ord.id, stage.key)}
                          title={`Click to set stage to ${stage.label}`}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="step-circle">
                            {isPassed ? (
                              isActive ? stage.icon : <CheckCircle size={14} />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>
                          <span className="step-label">{stage.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Stage Quick Select Dropdown */}
                  <div className="tracker-actions">
                    <select
                      className={`status-select-badge status-${ord.status}`}
                      value={ord.status === 'in_progress' ? 'stitching' : ord.status}
                      onChange={(e) => onUpdateStatus(ord.id, e.target.value as OrderStatus)}
                      aria-label="Update Stage Status"
                    >
                      <option value="pending">⏳ 1. Pending</option>
                      <option value="cutting">✂️ 2. Cutting</option>
                      <option value="stitching">🪡 3. Stitching</option>
                      <option value="ready">✨ 4. Ready</option>
                      <option value="delivered">✅ 5. Delivered</option>
                    </select>

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
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-orders-state panel-card">
            <ShoppingBag size={40} className="empty-icon-muted mb-2" />
            <h4 className="empty-title">No orders found</h4>
            <p className="empty-sub">No matching orders found for search term "{searchTerm}". Try clearing search or add a new order.</p>
          </div>
        )}
      </div>

      {/* ── CREATE NEW ORDER MODAL ───────────────────────── */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card order-modal-wrap">
            <div className="modal-header-bar">
              <div className="modal-title-wrap">
                <Scissors size={20} className="text-purple" />
                <h3 className="modal-title">Create New Trackable Order</h3>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="modal-body-form">
              {/* Customer Info */}
              <div className="form-row-2col">
                <div className="form-group-item">
                  <label className="form-label-sm required">Customer Name</label>
                  <input
                    type="text"
                    required
                    className={`form-input-sm ${formErrors.name ? 'input-error' : ''}`}
                    placeholder="Enter customer full name..."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  {formErrors.name && <span className="error-text"><AlertCircle size={11} /> {formErrors.name}</span>}
                </div>

                <div className="form-group-item">
                  <label className="form-label-sm required">Phone Number</label>
                  <input
                    type="tel"
                    required
                    className={`form-input-sm ${formErrors.phone ? 'input-error' : ''}`}
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                  {formErrors.phone && <span className="error-text"><AlertCircle size={11} /> {formErrors.phone}</span>}
                </div>
              </div>

              {/* Garment & Fabric Type */}
              <div className="form-row-2col mt-3">
                <div className="form-group-item">
                  <label className="form-label-sm">Dress / Garment Type</label>
                  <select
                    className="form-select-sm"
                    value={dressType}
                    onChange={(e) => setDressType(e.target.value as DressType)}
                  >
                    {(Object.keys(DRESS_TYPE_INFO) as DressType[]).map((dKey) => (
                      <option key={dKey} value={dKey}>
                        {DRESS_TYPE_INFO[dKey].icon} {DRESS_TYPE_INFO[dKey].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-item">
                  <label className="form-label-sm">Fabric Type</label>
                  <select
                    className="form-select-sm"
                    value={fabricType}
                    onChange={(e) => setFabricType(e.target.value as FabricType)}
                  >
                    {(Object.keys(FABRICS) as FabricType[]).map((fKey) => (
                      <option key={fKey} value={fKey}>
                        {FABRICS[fKey].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Key Measurements */}
              <div className="form-section-title mt-4 mb-2">
                <Ruler size={14} />
                <span>Customer Body Measurements (Inches)</span>
              </div>

              <div className="form-grid-3col">
                <div className="form-group-item">
                  <label className="form-label-xs">Full Length</label>
                  <input
                    type="number"
                    className="form-input-xs"
                    value={mLength}
                    onChange={(e) => setMLength(Number(e.target.value))}
                  />
                </div>
                <div className="form-group-item">
                  <label className="form-label-xs">Bust / Chest</label>
                  <input
                    type="number"
                    className="form-input-xs"
                    value={mBust}
                    onChange={(e) => setMBust(Number(e.target.value))}
                  />
                </div>
                <div className="form-group-item">
                  <label className="form-label-xs">Waist</label>
                  <input
                    type="number"
                    className="form-input-xs"
                    value={mWaist}
                    onChange={(e) => setMWaist(Number(e.target.value))}
                  />
                </div>
                <div className="form-group-item">
                  <label className="form-label-xs">Hip</label>
                  <input
                    type="number"
                    className="form-input-xs"
                    value={mHip}
                    onChange={(e) => setMHip(Number(e.target.value))}
                  />
                </div>
                <div className="form-group-item">
                  <label className="form-label-xs">Shoulder</label>
                  <input
                    type="number"
                    className="form-input-xs"
                    value={mShoulder}
                    onChange={(e) => setMShoulder(Number(e.target.value))}
                  />
                </div>
                <div className="form-group-item">
                  <label className="form-label-xs">Sleeve Length</label>
                  <input
                    type="number"
                    className="form-input-xs"
                    value={mSleeve}
                    onChange={(e) => setMSleeve(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="form-row-2col mt-3">
                <div className="form-group-item">
                  <label className="form-label-sm">Order Date</label>
                  <input
                    type="date"
                    className="form-input-sm"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                  />
                </div>

                <div className="form-group-item">
                  <label className="form-label-sm">Delivery Due Date</label>
                  <input
                    type="date"
                    className="form-input-sm"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>
              </div>
              {formErrors.dates && <span className="error-text mt-1"><AlertCircle size={11} /> {formErrors.dates}</span>}

              {/* Special Instructions */}
              <div className="form-group-item mt-3">
                <label className="form-label-sm">Special Instructions / Customization Notes</label>
                <textarea
                  rows={2}
                  className="form-textarea-sm"
                  placeholder="e.g. Add lining, deep V neck, express delivery request..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>

              {/* Modal Actions */}
              <div className="modal-actions-row mt-4">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                >
                  <Plus size={15} />
                  <span>Save Trackable Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
