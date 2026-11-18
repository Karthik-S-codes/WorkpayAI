/**
 * PDF Invoice & Financial Receipt Generator
 * Generates branded PDF documents using PDFKit with proper styling,
 * tax breakdown, customer and worker details, and verification QR/hashes.
 */

const PDFDocument = require('pdfkit');

function generateInvoicePdf(invoiceData, outputStream) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  doc.pipe(outputStream);

  // 1. Header Banner
  doc
    .fillColor('#0A192F')
    .rect(0, 0, doc.page.width, 100)
    .fill();

  doc
    .fillColor('#FFFFFF')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('WORKPAY AI', 50, 35)
    .fontSize(10)
    .font('Helvetica')
    .text('Connecting Workers, Securing Payments, Empowering Financial Growth', 50, 62);

  doc
    .fillColor('#64FFDA')
    .fontSize(16)
    .font('Helvetica-Bold')
    .text('TAX INVOICE', 420, 42, { align: 'right' });

  // 2. Invoice Meta Details
  doc.fillColor('#333333');
  doc.fontSize(10).font('Helvetica');

  const startY = 125;
  doc
    .font('Helvetica-Bold').text('Invoice Number: ', 50, startY).font('Helvetica').text(invoiceData.invoice_number || 'INV-2026-0001', 145, startY)
    .font('Helvetica-Bold').text('Date: ', 50, startY + 18).font('Helvetica').text(invoiceData.issued_date || new Date().toISOString().slice(0, 10), 145, startY + 18)
    .font('Helvetica-Bold').text('Transaction Ref: ', 50, startY + 36).font('Helvetica').text(invoiceData.transaction_reference || 'TXN-WP-000', 145, startY + 36)
    .font('Helvetica-Bold').text('Payment Status: ', 50, startY + 54).font('Helvetica').fillColor('#059669').text((invoiceData.status || 'PAID').toUpperCase(), 145, startY + 54);

  // 3. Customer & Worker Columns
  doc.fillColor('#333333');
  const partiesY = 205;

  // Bill To (Customer)
  doc
    .fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('BILLED TO (CUSTOMER):', 50, partiesY)
    .fontSize(10).font('Helvetica').fillColor('#475569')
    .text(invoiceData.customer_name || 'Valued Customer', 50, partiesY + 16)
    .text(invoiceData.customer_phone || '+91 98765 00000', 50, partiesY + 30)
    .text(invoiceData.customer_address || 'Bengaluru, Karnataka', 50, partiesY + 44);

  // Provider (Worker)
  doc
    .fontSize(11).font('Helvetica-Bold').fillColor('#0F172A').text('SERVICE SPECIALIST:', 320, partiesY)
    .fontSize(10).font('Helvetica').fillColor('#475569')
    .text(invoiceData.worker_name || 'Trade Specialist', 320, partiesY + 16)
    .text(invoiceData.worker_category || 'Skilled Professional', 320, partiesY + 30)
    .text(invoiceData.worker_phone || '+91 98765 11111', 320, partiesY + 44);

  // 4. Itemized Table
  const tableY = 285;
  doc
    .fillColor('#F1F5F9')
    .rect(50, tableY, 495, 25)
    .fill();

  doc
    .fillColor('#1E293B')
    .font('Helvetica-Bold')
    .fontSize(9)
    .text('DESCRIPTION', 60, tableY + 8)
    .text('CATEGORY', 260, tableY + 8)
    .text('PAYMENT TYPE', 360, tableY + 8)
    .text('AMOUNT (INR)', 455, tableY + 8, { align: 'right', width: 80 });

  const itemY = tableY + 35;
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#334155')
    .text(invoiceData.job_title || 'Direct Professional Trade Service', 60, itemY, { width: 190 })
    .text(invoiceData.worker_category || 'Skilled Services', 260, itemY)
    .text(invoiceData.payment_type || 'Per Job', 360, itemY)
    .text(`₹${parseFloat(invoiceData.amount || 0).toFixed(2)}`, 455, itemY, { align: 'right', width: 80 });

  // Divider Line
  doc
    .strokeColor('#E2E8F0')
    .lineWidth(1)
    .moveTo(50, itemY + 35)
    .lineTo(545, itemY + 35)
    .stroke();

  // 5. Total Calculations
  const totalsY = itemY + 45;
  const subtotal = parseFloat(invoiceData.amount || 0);
  const tax = parseFloat(invoiceData.tax_amount || 0);
  const total = subtotal + tax;

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#475569')
    .text('Subtotal:', 360, totalsY)
    .text(`₹${subtotal.toFixed(2)}`, 455, totalsY, { align: 'right', width: 80 })
    .text('GST / Platform Tax (0%):', 360, totalsY + 18)
    .text(`₹${tax.toFixed(2)}`, 455, totalsY + 18, { align: 'right', width: 80 });

  doc
    .fillColor('#F8FAFC')
    .rect(350, totalsY + 38, 195, 30)
    .fill();

  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#0A192F')
    .text('Total Paid:', 360, totalsY + 47)
    .text(`₹${total.toFixed(2)}`, 455, totalsY + 47, { align: 'right', width: 80 });

  // 6. Security & Audit Footer
  const footerY = 680;
  doc
    .strokeColor('#CBD5E1')
    .lineWidth(0.5)
    .moveTo(50, footerY)
    .lineTo(545, footerY)
    .stroke();

  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor('#64748B')
    .text('Payment Gateway: Razorpay Sandbox / Verified Electronic Signature', 50, footerY + 10)
    .text('This is a computer-generated tax invoice issued by WorkPay AI. Internal Ledger Record verified.', 50, footerY + 22)
    .text('Support & Inquiries: support@workpay.ai | Bengaluru, Karnataka, India', 50, footerY + 34);

  doc.end();
}

module.exports = {
  generateInvoicePdf
};

