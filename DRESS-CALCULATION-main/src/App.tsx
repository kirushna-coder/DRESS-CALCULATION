// ============================================================
// SmartTailor AI – Intelligent Dress Calculation & Tailoring Assistant
// Main Application Root & State Orchestration
// ============================================================

import React, { useState, useMemo, useCallback } from 'react';
import './index.css';

// Components
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import CustomerMeasurementModule from './components/CustomerMeasurementModule';
import DressSelector from './components/DressSelector';
import FabricSelector from './components/FabricSelector';
import DressPreview2D from './components/DressPreview2D';
import AIRecommendationCard from './components/AIRecommendationCard';
import SmartFabricSummary from './components/SmartFabricSummary';
import InvoiceModal from './components/InvoiceModal';
import OrdersManager from './components/OrdersManager';
import CustomerDirectory from './components/CustomerDirectory';
import CADStudio from './components/CADStudio';

// Hooks & Utils
import { useLocalStorage } from './hooks/useLocalStorage';
import type {
  ActiveTab,
  Customer,
  Order,
  OrderStatus,
  Measurements,
  DressType,
  PatternType,
  FabricType,
  TailoringAddOns,
  Unit,
  Currency,
} from './types';
import {
  DEFAULT_BODY_MEASUREMENTS,
  DEMO_CUSTOMERS,
  DEMO_ORDERS,
  FABRICS,
  DRESS_TYPE_INFO,
} from './utils/demoData';
import { calculateFabricRequirement } from './calculations/fabricCalculator';
import { analyzeMeasurementsAI } from './calculations/aiAdvisor';

const App: React.FC = () => {
  // ── Navigation & Global View State ───────────────────────
  const [activeTab, setActiveTab] = useLocalStorage<ActiveTab>(
    'smarttailor-active-tab',
    'dashboard'
  );
  const [unit, setUnit] = useLocalStorage<Unit>('smarttailor-unit', 'in');
  const [currency, setCurrency] = useLocalStorage<Currency>(
    'smarttailor-currency',
    'INR'
  );

  // ── Data Collections (LocalStorage with Preloaded Demo Fallback) ──
  const [customers, setCustomers] = useLocalStorage<Customer[]>(
    'smarttailor-customers',
    DEMO_CUSTOMERS
  );
  const [orders, setOrders] = useLocalStorage<Order[]>(
    'smarttailor-orders',
    DEMO_ORDERS
  );

  // ── Active Calculation & Studio State ────────────────────
  const [measurements, setMeasurements] = useLocalStorage<Measurements>(
    'smarttailor-current-measurements',
    DEFAULT_BODY_MEASUREMENTS
  );
  const [dressType, setDressType] = useLocalStorage<DressType>(
    'smarttailor-dress-type',
    'FROCK'
  );
  const [fabricType, setFabricType] = useLocalStorage<FabricType>(
    'smarttailor-fabric-type',
    'SILK'
  );
  const [fabricColor, setFabricColor] = useLocalStorage<string>(
    'smarttailor-fabric-color',
    '#881337'
  );

  const [pricePerMeter, setPricePerMeter] = useState<number>(
    FABRICS.SILK.defaultPricePerMeter
  );
  const [stitchingCharge, setStitchingCharge] = useState<number>(
    DRESS_TYPE_INFO.FROCK.baseStitchingCharge
  );
  const [addOns, setAddOns] = useState<TailoringAddOns>({
    lining: true,
    embroideryOrLace: false,
    premiumButtonsOrZips: false,
    expressDelivery: false,
    customCollarCuffs: false,
  });

  // ── CAD Studio Model Sync ────────────────────────────────
  const [cadPatternType, setCadPatternType] = useLocalStorage<PatternType>(
    'smarttailor-cad-pattern-type',
    'ONE_PIECE'
  );

  // ── Invoice & Modal States ───────────────────────────────
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceOrderSnapshot, setInvoiceOrderSnapshot] = useState<Order | null>(null);
  const [isSavingCustomerToast, setIsSavingCustomerToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── Reactive Fabric & Cost Calculation ────────────────────
  const calculationResult = useMemo(() => {
    return calculateFabricRequirement({
      garmentType: dressType,
      fabricType: fabricType,
      measurements,
      customPricePerMeter: pricePerMeter,
      customStitchingCharge: stitchingCharge,
      addOns,
    });
  }, [dressType, fabricType, measurements, pricePerMeter, stitchingCharge, addOns]);

  // ── Reactive AI Tailoring Recommendation ──────────────────
  const aiRecommendation = useMemo(() => {
    return analyzeMeasurementsAI(measurements, dressType, fabricType);
  }, [measurements, dressType, fabricType]);

  // ── Handlers ─────────────────────────────────────────────
  const handleDressSelect = useCallback(
    (newDress: DressType) => {
      setDressType(newDress);
      const info = DRESS_TYPE_INFO[newDress];
      if (info) {
        setStitchingCharge(info.baseStitchingCharge);
        setMeasurements((prev) => ({
          ...prev,
          fullLength: info.defaultLength,
        }));
      }
    },
    [setDressType, setMeasurements]
  );

  const handleFabricSelect = useCallback(
    (newFabric: FabricType) => {
      setFabricType(newFabric);
      const fInfo = FABRICS[newFabric];
      if (fInfo) {
        setPricePerMeter(fInfo.defaultPricePerMeter);
      }
    },
    [setFabricType]
  );

  const handleLoadCustomer = useCallback(
    (cust: Customer) => {
      setMeasurements({
        ...cust.measurements,
        customerName: cust.name,
        age: cust.age,
        gender: cust.gender,
        height: cust.height,
        weight: cust.weight,
      });
      showToast(`Loaded measurements for ${cust.name}`);
    },
    [setMeasurements]
  );

  const handleSaveCustomerToDirectory = useCallback(() => {
    const custName = measurements.customerName?.trim();
    if (!custName) return;

    setIsSavingCustomerToast(true);
    const existingIndex = customers.findIndex(
      (c) => c.name.toLowerCase() === custName.toLowerCase()
    );

    const newCust: Customer = {
      id: existingIndex >= 0 ? customers[existingIndex].id : `cust-${Date.now()}`,
      name: custName,
      phone: '+91 98765 43210',
      age: measurements.age || 26,
      gender: measurements.gender || 'female',
      height: measurements.height,
      weight: measurements.weight,
      measurements,
      createdAt: new Date().toISOString().split('T')[0],
      totalOrdersCount: existingIndex >= 0 ? customers[existingIndex].totalOrdersCount : 1,
    };

    if (existingIndex >= 0) {
      const updated = [...customers];
      updated[existingIndex] = newCust;
      setCustomers(updated);
      showToast(`Updated customer ${custName} in directory`);
    } else {
      setCustomers([newCust, ...customers]);
      showToast(`Saved new customer ${custName} to directory`);
    }

    setTimeout(() => setIsSavingCustomerToast(false), 1200);
  }, [measurements, customers, setCustomers]);

  const handleSaveAsOrder = useCallback(() => {
    const custName = measurements.customerName?.trim() || 'Walk-in Customer';
    const orderNum = `ST-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customerId: `cust-${Date.now()}`,
      customerName: custName,
      customerPhone: '+91 98400 12345',
      dressType,
      fabricType,
      fabricColor,
      fabricLengthMeters: calculationResult.requiredLengthMeters,
      measurements,
      costBreakdown: calculationResult,
      totalCost: calculationResult.totalCost,
      currency,
      status: 'pending',
      paymentStatus: 'unpaid',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      notes: `${fabricColor} ${fabricType} ${dressType} with ${calculationResult.requiredLengthMeters}m fabric.`,
      aiRecommendations: aiRecommendation,
    };

    setOrders([newOrder, ...orders]);
    showToast(`Order ${orderNum} created successfully!`);
    setActiveTab('orders');
  }, [
    measurements,
    orders,
    dressType,
    fabricType,
    fabricColor,
    calculationResult,
    currency,
    aiRecommendation,
    setOrders,
    setActiveTab,
  ]);

  const handleUpdateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      showToast(`Order status updated to ${status.replace('_', ' ')}`);
    },
    [setOrders]
  );

  const handleDeleteOrder = useCallback(
    (orderId: string) => {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast('Order removed');
    },
    [setOrders]
  );

  const handleDeleteCustomer = useCallback(
    (custId: string) => {
      setCustomers((prev) => prev.filter((c) => c.id !== custId));
      showToast('Customer profile deleted');
    },
    [setCustomers]
  );

  const handleOpenCurrentInvoice = useCallback(() => {
    setInvoiceOrderSnapshot(null); // use current active calculation
    setIsInvoiceOpen(true);
  }, []);

  const handleViewOrderInvoice = useCallback((order: Order) => {
    setInvoiceOrderSnapshot(order);
    setIsInvoiceOpen(true);
  }, []);

  return (
    <div className="smart-tailor-app">
      {/* ── Toast Notification ───────────────────────────── */}
      {toastMessage && (
        <div className="toast-notification" role="status">
          <span>✨ {toastMessage}</span>
        </div>
      )}

      {/* ── Top Navigation Bar ───────────────────────────── */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currency={currency}
        onCurrencyChange={setCurrency}
        unit={unit}
        onUnitChange={setUnit}
        ordersCount={orders.length}
        customersCount={customers.length}
      />

      {/* ── Main Application View Router ─────────────────── */}
      <main className="app-main-viewport">
        {/* 1. Dashboard View */}
        {activeTab === 'dashboard' && (
          <Dashboard
            customers={customers}
            orders={orders}
            currency={currency}
            onNavigate={setActiveTab}
            onSelectOrder={handleViewOrderInvoice}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {/* 2. Smart Calculator & Design Studio */}
        {activeTab === 'calculator' && (
          <div className="calculator-view-grid">
            {/* Left Column: Measurements + Dress + Fabric Selectors */}
            <div className="calc-left-col">
              <CustomerMeasurementModule
                measurements={measurements}
                onChange={setMeasurements}
                unit={unit}
                customers={customers}
                onSelectCustomer={handleLoadCustomer}
                onSaveAsCustomer={handleSaveCustomerToDirectory}
                isSavingCustomer={isSavingCustomerToast}
              />

              <DressSelector
                selectedDress={dressType}
                onSelectDress={handleDressSelect}
              />

              <FabricSelector
                selectedFabric={fabricType}
                onSelectFabric={handleFabricSelect}
                pricePerMeter={pricePerMeter}
                onPriceChange={setPricePerMeter}
                stitchingCharge={stitchingCharge}
                onStitchingChargeChange={setStitchingCharge}
                addOns={addOns}
                onAddOnsChange={setAddOns}
                currency={currency}
              />
            </div>

            {/* Right Column: Garment Visualizer + AI Card + Fabric Summary */}
            <div className="calc-right-col">
              <DressPreview2D
                dressType={dressType}
                fabricType={fabricType}
                color={fabricColor}
                onColorChange={setFabricColor}
                measurements={measurements}
              />

              <AIRecommendationCard
                recommendation={aiRecommendation}
                measurements={measurements}
                selectedGarment={dressType}
                selectedFabric={fabricType}
                onApplyEase={(ease) =>
                  setMeasurements((prev) => ({ ...prev, ease }))
                }
                onApplyFabric={handleFabricSelect}
                onApplyGarment={handleDressSelect}
              />

              <SmartFabricSummary
                calculation={calculationResult}
                currency={currency}
                onSaveOrder={handleSaveAsOrder}
                onOpenInvoice={handleOpenCurrentInvoice}
                onOpenCADStudio={() => {
                  setCadPatternType(dressType === 'FROCK' ? 'ONE_PIECE' : (dressType as PatternType));
                  setActiveTab('cad_studio');
                }}
              />
            </div>
          </div>
        )}

        {/* 3. CAD Pattern Studio View */}
        {activeTab === 'cad_studio' && (
          <CADStudio
            measurements={measurements}
            onMeasurementsChange={setMeasurements}
            unit={unit}
            onUnitChange={setUnit}
            patternType={cadPatternType}
            onPatternTypeChange={setCadPatternType}
          />
        )}

        {/* 4. Orders & Invoices Management View */}
        {activeTab === 'orders' && (
          <OrdersManager
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onViewInvoice={handleViewOrderInvoice}
            onNavigate={setActiveTab}
            currency={currency}
          />
        )}

        {/* 5. Customer Directory View */}
        {activeTab === 'customers' && (
          <CustomerDirectory
            customers={customers}
            onSelectCustomerForCalc={(cust) => {
              handleLoadCustomer(cust);
              setActiveTab('calculator');
            }}
            onDeleteCustomer={handleDeleteCustomer}
            onNavigate={setActiveTab}
          />
        )}
      </main>

      {/* ── Global Invoice Modal ─────────────────────────── */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        customerName={
          invoiceOrderSnapshot?.customerName ||
          measurements.customerName ||
          'Walk-in Customer'
        }
        customerPhone={invoiceOrderSnapshot?.customerPhone || '+91 98401 23456'}
        customerEmail={invoiceOrderSnapshot?.customerEmail}
        measurements={invoiceOrderSnapshot?.measurements || measurements}
        garmentType={invoiceOrderSnapshot?.dressType || dressType}
        fabricType={invoiceOrderSnapshot?.fabricType || fabricType}
        fabricColor={invoiceOrderSnapshot?.fabricColor || fabricColor}
        calculation={invoiceOrderSnapshot?.costBreakdown || calculationResult}
        currency={invoiceOrderSnapshot?.currency || currency}
        orderNumber={invoiceOrderSnapshot?.orderNumber}
        orderDate={invoiceOrderSnapshot?.orderDate}
        dueDate={invoiceOrderSnapshot?.deliveryDueDate}
      />
    </div>
  );
};

export default App;
