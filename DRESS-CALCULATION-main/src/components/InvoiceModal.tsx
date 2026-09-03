// ============================================================
// SmartTailor AI – Professional Invoice Generator & Modal
// Generates printable / downloadable bespoke tailoring invoices
// ============================================================

import React, { useRef, useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  Scissors,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type {
  Measurements,
  DressType,
  FabricType,
  FabricCalculationResult,
  Currency,
} from '../types';
import { DRESS_TYPE_INFO, FABRICS } from '../utils/demoData';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  measurements: Measurements;
  garmentType: DressType;
  fabricType: FabricType;
  fabricColor: string;
  calculation: FabricCalculationResult;
  currency: Currency;
  orderNumber?: string;
  orderDate?: string;
  dueDate?: string;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  customerName,
  customerPhone,
  customerEmail,
  measurements: m,
  garmentType,
  fabricType,
  fabricColor,
  calculation: calc,
  currency,
  orderNumber = `INV-${Date.now().toString().slice(-6)}`,
  orderDate = new Date().toISOString().split('T')[0],
  dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const currencySymbol =
    currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';

  const dressInfo = DRESS_TYPE_INFO[garmentType] || DRESS_TYPE_INFO.SHIRT;
  const fabricInfo = FABRICS[fabricType] || FABRICS.COTTON;

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = Math.min((pageW - 20) / imgW, (pageH - 20) / imgH);
      const printW = imgW * ratio;
      const printH = imgH * ratio;
      const offsetX = (pageW - printW) / 2;
      const offsetY = 10;

      pdf.addImage(imgData, 'PNG', offsetX, offsetY, printW, printH);
      pdf.save(`${orderNumber}-Invoice.pdf`);
    } catch (err) {
      console.error('Invoice PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="invoice-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* ── Modal Controls Bar ─────────────────────────── */}
        <div className="modal-toolbar">
          <div className="toolbar-left">
            <FileText size={18} className="modal-icon" />
            <h3 className="modal-title">Tailoring Invoice &bull; {orderNumber}</h3>
          </div>

          <div className="toolbar-right">
            <button
              type="button"
              className="btn-modal-action"
              onClick={handlePrint}
              title="Print Invoice"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>

            <button
              type="button"
              className="btn-modal-action primary"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              title="Download PDF"
            >
              <Download size={15} />
              <span>{isExporting ? 'Exporting...' : 'Download PDF'}</span>
            </button>

            <button
              type="button"
              className="btn-close-modal"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Printable Invoice Document ─────────────────── */}
        <div className="printable-invoice-wrapper" ref={invoiceRef}>
          {/* Invoice Header */}
          <div className="invoice-header">
            <div className="studio-brand">
              <div className="studio-logo-icon">
                <Scissors size={24} />
              </div>
              <div>
                <h1 className="studio-name">FabriPlay Studio</h1>
                <p className="studio-sub">Haute Couture &bull; Bespoke Pattern &bull; Digital Tailoring</p>
                <p className="studio-address">
                  7th Floor, Fashion Tech Boulevard, Bangalore 560001 &bull; Phone: +91 80 2345 6789
                </p>
              </div>
            </div>

            <div className="invoice-meta-card">
              <span className="invoice-badge">TAX INVOICE</span>
              <div className="meta-row">
                <span className="meta-label">Invoice #:</span>
                <span className="meta-val font-mono">{orderNumber}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Date:</span>
                <span className="meta-val">{orderDate}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Due Date:</span>
                <span className="meta-val font-semibold">{dueDate}</span>
              </div>
            </div>
          </div>

          <hr className="invoice-divider" />

          {/* Customer & Garment Specs */}
          <div className="invoice-specs-split">
            {/* Bill To */}
            <div className="specs-box">
              <h4 className="specs-title">Customer Details</h4>
              <p className="cust-primary-name">{customerName || 'Walk-in Customer'}</p>
              {customerPhone && <p className="cust-meta-text">Phone: {customerPhone}</p>}
              {customerEmail && <p className="cust-meta-text">Email: {customerEmail}</p>}
              <p className="cust-meta-text">
                Gender: {m.gender || 'Female'} &bull; Age: {m.age || 26}
              </p>
            </div>

            {/* Garment & Material */}
            <div className="specs-box">
              <h4 className="specs-title">Garment &amp; Material</h4>
              <div className="garment-spec-row">
                <span className="spec-item-label">Garment:</span>
                <span className="spec-item-val font-semibold">
                  {dressInfo.icon} {dressInfo.label}
                </span>
              </div>
              <div className="garment-spec-row">
                <span className="spec-item-label">Fabric:</span>
                <span className="spec-item-val">
                  {fabricInfo.name} ({calc.fabricWidthInches}" Width)
                </span>
              </div>
              <div className="garment-spec-row">
                <span className="spec-item-label">Color:</span>
                <span className="spec-item-val color-spec-val">
                  <span className="color-dot" style={{ backgroundColor: fabricColor }} />
                  <span>{fabricColor}</span>
                </span>
              </div>
              <div className="garment-spec-row">
                <span className="spec-item-label">Fabric Length:</span>
                <span className="spec-item-val font-semibold text-primary">
                  {calc.requiredLengthMeters} Meters ({calc.requiredLengthYards} Yds)
                </span>
              </div>
            </div>
          </div>

          {/* Measurements Summary Table */}
          <div className="invoice-measurements-summary">
            <h4 className="specs-title">Custom Tailoring Measurements (Inches)</h4>
            <div className="meas-summary-grid">
              <div className="meas-summary-item">
                <span className="meas-name">Chest/Bust</span>
                <span className="meas-val">{m.bust}"</span>
              </div>
              <div className="meas-summary-item">
                <span className="meas-name">Waist</span>
                <span className="meas-val">{m.waist}"</span>
              </div>
              <div className="meas-summary-item">
                <span className="meas-name">Hip</span>
                <span className="meas-val">{m.hip}"</span>
              </div>
              <div className="meas-summary-item">
                <span className="meas-name">Shoulder</span>
                <span className="meas-val">{m.shoulderWidth}"</span>
              </div>
              <div className="meas-summary-item">
                <span className="meas-name">Sleeve</span>
                <span className="meas-val">{m.sleeveLength || 22}"</span>
              </div>
              <div className="meas-summary-item">
                <span className="meas-name">Length</span>
                <span className="meas-val">{m.fullLength}"</span>
              </div>
              <div className="meas-summary-item">
                <span className="meas-name">Ease</span>
                <span className="meas-val">+{m.ease}"</span>
              </div>
            </div>
          </div>

          {/* Itemized Billing Table */}
          <table className="invoice-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item &amp; Description</th>
                <th className="text-center">Qty / Length</th>
                <th className="text-right">Unit Rate</th>
                <th className="text-right">Total ({currencySymbol})</th>
              </tr>
            </thead>
            <tbody>
              {/* Fabric */}
              <tr>
                <td>1</td>
                <td>
                  <strong>{fabricInfo.name}</strong>
                  <div className="table-sub-desc">
                    Required for {dressInfo.label} &bull; Cutting Efficiency {100 - calc.cuttingWasteEstimatePercent}%
                  </div>
                </td>
                <td className="text-center">{calc.requiredLengthMeters} m</td>
                <td className="text-right">
                  {currencySymbol}
                  {calc.pricePerMeter}
                </td>
                <td className="text-right font-semibold">
                  {currencySymbol}
                  {calc.fabricCost.toLocaleString()}
                </td>
              </tr>

              {/* Base Stitching */}
              <tr>
                <td>2</td>
                <td>
                  <strong>Bespoke Tailoring &amp; Construction Fee</strong>
                  <div className="table-sub-desc">
                    Master cutting, pattern drafting, seam sealing &amp; edge finishing
                  </div>
                </td>
                <td className="text-center">1 Garment</td>
                <td className="text-right">
                  {currencySymbol}
                  {calc.baseStitchingCharge}
                </td>
                <td className="text-right font-semibold">
                  {currencySymbol}
                  {calc.baseStitchingCharge.toLocaleString()}
                </td>
              </tr>

              {/* Addons */}
              {calc.addOnCharges.lining > 0 && (
                <tr>
                  <td>3</td>
                  <td>Inner Lining Fabric &amp; Attachment</td>
                  <td className="text-center">1 Set</td>
                  <td className="text-right">
                    {currencySymbol}
                    {calc.addOnCharges.lining}
                  </td>
                  <td className="text-right">
                    {currencySymbol}
                    {calc.addOnCharges.lining}
                  </td>
                </tr>
              )}

              {calc.addOnCharges.embroidery > 0 && (
                <tr>
                  <td>4</td>
                  <td>Custom Embroidery / Lace Finishing</td>
                  <td className="text-center">Custom</td>
                  <td className="text-right">
                    {currencySymbol}
                    {calc.addOnCharges.embroidery}
                  </td>
                  <td className="text-right">
                    {currencySymbol}
                    {calc.addOnCharges.embroidery}
                  </td>
                </tr>
              )}

              {calc.addOnCharges.buttons > 0 && (
                <tr>
                  <td>5</td>
                  <td>Premium Fasteners &amp; Hardware</td>
                  <td className="text-center">1 Set</td>
                  <td className="text-right">
                    {currencySymbol}
                    {calc.addOnCharges.buttons}
                  </td>
                  <td className="text-right">
                    {currencySymbol}
                    {calc.addOnCharges.buttons}
                  </td>
                </tr>
              )}

              {calc.addOnCharges.express > 0 && (
                <tr>
                  <td>6</td>
                  <td>Express Rush Tailoring (24-48h Delivery)</td>
                  <td className="text-center">Rush</td>
                  <td className="text-right">
                    {currencySymbol}
                    {calc.addOnCharges.express}
                  </td>
                  <td className="text-right">
                    {currencySymbol}
                    {calc.addOnCharges.express}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="invoice-totals-row">
            <div className="invoice-terms-notes">
              <h5 className="terms-title">Terms &amp; Tailoring Guarantee:</h5>
              <p>1. Free alterations within 14 days of delivery for perfect fit guarantee.</p>
              <p>2. Fabric pre-shrunk and handled with industrial steam treatment.</p>
              <p>3. Thank you for choosing FabriPlay Studio!</p>
            </div>

            <div className="invoice-summary-card">
              <div className="summary-calc-row">
                <span>Subtotal:</span>
                <span>
                  {currencySymbol}
                  {calc.subtotal.toLocaleString()}
                </span>
              </div>
              {calc.discountAmount > 0 && (
                <div className="summary-calc-row text-success">
                  <span>Discount:</span>
                  <span>
                    -{currencySymbol}
                    {calc.discountAmount}
                  </span>
                </div>
              )}
              {calc.taxAmount > 0 && (
                <div className="summary-calc-row">
                  <span>GST / Tax ({calc.taxPercent}%):</span>
                  <span>
                    +{currencySymbol}
                    {calc.taxAmount}
                  </span>
                </div>
              )}
              <div className="summary-calc-row grand-total">
                <span>Grand Total:</span>
                <span>
                  {currencySymbol}
                  {calc.totalCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
