import PDFDocument from 'pdfkit';
import type { Quotation } from '../drizzle/schema';

export async function generateQuotationPDF(quotation: Quotation): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(24).fillColor('#2c3e50').text('QUOTATION', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#7f8c8d').text(`Quotation #${quotation.quotationNumber}`, { align: 'center' });
      doc.moveDown(1);

      // Horizontal line
      doc.strokeColor('#3498db').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      // Customer Information Section
      doc.fontSize(14).fillColor('#2c3e50').text('Customer Information', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#34495e');
      doc.text(`Name: ${quotation.customerName}`);
      if (quotation.customerEmail) doc.text(`Email: ${quotation.customerEmail}`);
      if (quotation.customerPhone) doc.text(`Phone: ${quotation.customerPhone}`);
      if (quotation.customerAddress) doc.text(`Address: ${quotation.customerAddress}`);
      doc.moveDown(1);

      // Product Details Section
      doc.fontSize(14).fillColor('#2c3e50').text('Product Details', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#34495e');
      
      const productTypeDisplay = quotation.productType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      doc.text(`Product Type: ${productTypeDisplay}`);
      doc.text(`Dimensions: ${quotation.width} cm × ${quotation.height} cm`);
      doc.text(`Quantity: ${quotation.quantity}`);
      doc.text(`Total Area: ${Number(quotation.area).toFixed(2)} m²`);
      doc.text(`Price per m²: €${Number(quotation.pricePerSqm).toFixed(2)}`);
      doc.moveDown(1);

      // Pricing Breakdown Section
      doc.fontSize(14).fillColor('#2c3e50').text('Pricing Breakdown', { underline: true });
      doc.moveDown(0.5);
      
      // Create a table-like structure
      const startY = doc.y;
      const col1X = 50;
      const col2X = 400;
      
      doc.fontSize(11).fillColor('#34495e');
      
      // Net Price
      doc.text('Net Price:', col1X, startY);
      doc.text(`€${Number(quotation.netPrice).toFixed(2)}`, col2X, startY, { align: 'right', width: 145 });
      doc.moveDown(0.5);
      
      // Discount
      if (quotation.discountType !== 'none' && Number(quotation.discountAmount) > 0) {
        const discountLabel = quotation.discountType === 'percentage' 
          ? `Discount (${Number(quotation.discountValue).toFixed(0)}%):`
          : 'Discount:';
        doc.text(discountLabel, col1X);
        doc.text(`-€${Number(quotation.discountAmount).toFixed(2)}`, col2X, doc.y - 12, { align: 'right', width: 145 });
        doc.moveDown(0.5);
      }
      
      // Gross Price (before additional costs)
      doc.text('Gross Price:', col1X);
      doc.text(`€${Number(quotation.grossPrice).toFixed(2)}`, col2X, doc.y - 12, { align: 'right', width: 145 });
      doc.moveDown(0.5);
      
      // VAT
      doc.text(`VAT (${Number(quotation.vatPercentage).toFixed(0)}%):`, col1X);
      doc.text(`€${Number(quotation.vatAmount).toFixed(2)}`, col2X, doc.y - 12, { align: 'right', width: 145 });
      doc.moveDown(0.5);
      
      // Additional Costs
      if (quotation.additionalCosts && Array.isArray(quotation.additionalCosts) && quotation.additionalCosts.length > 0) {
        doc.moveDown(0.3);
        doc.fontSize(12).fillColor('#2c3e50').text('Additional Costs:', col1X);
        doc.moveDown(0.3);
        doc.fontSize(11).fillColor('#34495e');
        
        quotation.additionalCosts.forEach((cost: { name: string; amount: number }) => {
          doc.text(`  ${cost.name}:`, col1X);
          doc.text(`€${Number(cost.amount).toFixed(2)}`, col2X, doc.y - 12, { align: 'right', width: 145 });
          doc.moveDown(0.3);
        });
        doc.moveDown(0.2);
      }
      
      // Horizontal line before total
      doc.strokeColor('#3498db').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);
      
      // Final Total
      doc.fontSize(14).fillColor('#2c3e50').font('Helvetica-Bold');
      doc.text('TOTAL:', col1X);
      doc.text(`€${Number(quotation.finalTotal).toFixed(2)}`, col2X, doc.y - 16, { align: 'right', width: 145 });
      doc.font('Helvetica');
      doc.moveDown(1.5);
      
      // Notes Section
      if (quotation.notes) {
        doc.fontSize(14).fillColor('#2c3e50').text('Notes', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#34495e').text(quotation.notes, { align: 'left' });
        doc.moveDown(1);
      }
      
      // Footer
      doc.fontSize(9).fillColor('#95a5a6');
      const footerY = 750;
      doc.text(
        `Generated on ${new Date(quotation.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`,
        50,
        footerY,
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
