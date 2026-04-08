export const printDocument = (sale: any, siteSettings: any, invoiceSettings: any, rate: number = 1) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const isDeliveryNote = sale.docType === 'DELIVERY_NOTE';
  const docLabel = isDeliveryNote ? 'Nota de Entrega' : (sale.docType === 'PROFORMA' ? 'Fatura Proforma' : 'Fatura Recibo');
  const prefix = isDeliveryNote ? 'GUIA DE ENTREGA' : (sale.docType === 'PROFORMA' ? 'PROFORMA' : 'FATURA RECIBO');
  const isProforma = sale.docType === 'PROFORMA';

  const dateStr = new Date(sale.createdAt || sale.date || Date.now()).toLocaleString('pt-AO');
  const docId = sale.invoiceNumber;
  
  const customerName = typeof sale.customerName === 'string' ? sale.customerName : (sale.customer?.name || 'CONSUMIDOR FINAL').toUpperCase();
  const customerNif = typeof sale.customerNif === 'string' ? sale.customerNif : (sale.customer?.nif || '999999999');

  const grandTotal = sale.total;
  const qrData = encodeURIComponent(`TYPE:${prefix}|DOC:${docId}|NIF:${customerNif}|TOTAL:${(grandTotal * rate).toFixed(2)}`);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}`;

  const ivaAmount = sale.tax || 0; 
  const subtotalSemIva = grandTotal - ivaAmount;

  const itemsHtml = sale.items.map((item: any) => {
    const name = item.product?.name || item.name || 'Artigo sem nome';
    const price = item.price;
    const variationId = item.variationId;
    
    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: left;">${name}${variationId ? ` (${variationId})` : ''}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        ${!isDeliveryNote ? `
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${(price * rate).toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${(price * rate * item.quantity).toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</td>
        ` : ''}
      </tr>
    `;
  }).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>${docLabel} - ${docId}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
          
          @page {
            size: A4;
            margin: 0;
          }

          body { 
            font-family: 'Inter', sans-serif; 
            margin: 0;
            padding: 0;
            color: #111827; 
            line-height: 1.4; 
            font-size: 11px;
          }

          .page-wrapper {
            width: 210mm;
            height: 297mm; /* Fixed height for flex-spacer to work */
            padding: 20mm;
            margin: 0 auto;
            position: relative;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            background: white;
            overflow: hidden;
          }

          .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
          .logo-section { max-width: 50%; }
          .logo-section img { max-height: 60px; margin-bottom: 15px; }
          .logo-section h1 { margin: 0 0 10px 0; color: #111827; font-weight: 900; text-transform: uppercase; font-size: 20px; }
          .company-details { font-size: 10px; color: #4b5563; line-height: 1.5; }
          
          .doc-info-section { text-align: right; }
          .doc-title { margin: 0 0 10px 0; font-weight: 900; color: #111827; font-size: 24px; text-transform: uppercase; }
          .doc-meta table { width: auto; margin-left: auto; border-collapse: collapse; }
          .doc-meta td { padding: 4px 12px; border: 1px solid #e5e7eb; text-align: right; font-size: 10px; }
          .doc-meta td:first-child { background: #f9fafb; font-weight: 700; color: #374151; }
          
          .client-section { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; }
          .client-box { flex: 1; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; }
          .client-box-title { text-transform: uppercase; color: #6b7280; font-weight: 900; margin: 0 0 8px 0; font-size: 9px; letter-spacing: 0.5px; }
          .client-name { font-size: 12px; font-weight: 700; margin: 0 0 4px 0; color: #111827; }
          .client-detail { font-size: 10px; color: #4b5563; margin: 2px 0; }
          
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th { background: #f9fafb; padding: 10px; text-align: left; border-bottom: 2px solid #111827; font-size: 10px; text-transform: uppercase; color: #111827; font-weight: 700; }
          .items-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 10px; color: #374151; }
          
          .flex-spacer { flex-grow: 1; }

          .bottom-section { page-break-inside: avoid; margin-top: 30px; }
          
          .summary-area { display: flex; justify-content: flex-end; margin-bottom: 30px; }
          .bank-info { margin-top: 15px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; font-size: 9px; color: #374151; display: ${isDeliveryNote ? 'none' : 'block'}; width: 280px; align-self: flex-end; }
          .bank-info-title { margin: 0 0 4px 0; font-weight: 700; color: #111827; text-transform: uppercase; font-size: 8px; }
          .bank-info p { margin: 2px 0; line-height: 1.3; }
          
          .qr-container { display: flex; flex-direction: column; align-items: flex-end; margin-top: 15px; visibility: ${isDeliveryNote ? 'hidden' : 'visible'}; }
          .qr-container img { width: 80px; height: 80px; border: 1px solid #e5e7eb; padding: 4px; border-radius: 6px; }
          .qr-label { font-size: 8px; color: #6b7280; text-align: right; margin-top: 4px; font-weight: 700; text-transform: uppercase; width: 80px; }
          
          .signature-area { display: ${isDeliveryNote ? 'flex' : 'none'}; justify-content: space-between; gap: 80px; margin-top: 20px; padding: 0 10mm; }
          .signature-box { text-align: center; flex: 1; }
          .signature-line { border-top: 1px solid #111827; margin-bottom: 10px; padding-top: 10px; }
          .footer { text-align: center; font-size: 9px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 15px; margin-top: 20px; }
          
          .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; font-weight: 900; color: rgba(0,0,0,0.02); pointer-events: none; z-index: 0; white-space: nowrap; }
          
          @media print { 
            body { background: none; }
            .page-wrapper { margin: 0; border: none; width: 100%; min-height: 100vh; padding: 15mm; }
          }
        </style>
      </head>
      <body>
        <div class="page-wrapper">
          <div class="watermark">${prefix}</div>
          
          <!-- Header -->
          <div class="header-container">
            <div class="logo-section">
              ${siteSettings.siteLogo ? `<img src="${siteSettings.siteLogo}" alt="Logo" />` : `<h1>${invoiceSettings.companyName}</h1>`}
              <div class="company-details">
                <strong>${invoiceSettings.companyName}</strong><br>
                NIF: ${invoiceSettings.nif}<br>
                Endereço: ${invoiceSettings.address}<br>
                Tel: ${invoiceSettings.phone}
              </div>
            </div>
            <div class="doc-info-section">
              <h2 class="doc-title">${docLabel}</h2>
              <div class="doc-meta">
                <table>
                  <tr><td>Data de Emissão</td><td>${dateStr}</td></tr>
                  <tr><td>Data de Impressão</td><td>${new Date().toLocaleString('pt-AO')}</td></tr>
                  <tr><td>Doc n.º</td><td><strong>${docId}</strong></td></tr>
                  <tr><td>Moeda</td><td>${siteSettings.currency || 'AOA'}</td></tr>
                </table>
              </div>
            </div>
          </div>

          <!-- Client -->
          <div class="client-section">
            <div class="client-box">
              <p class="client-box-title">Cliente / Destinatário</p>
              <p class="client-name">${customerName}</p>
              <p class="client-detail">NIF: ${customerNif}</p>
            </div>
            ${isDeliveryNote ? `
            <div class="client-box" style="background: #f9fafb; border-style: dashed;">
              <p class="client-box-title">Detalhes Logísticos</p>
              <p class="client-detail"><strong>Levantamento:</strong> Presencial em Loja</p>
              <p class="client-detail" style="font-size: 9px; line-height: 1.2;">Este documento prova que os artigos foram conferidos e entregues em boas condições.</p>
            </div>
            ` : ''}
          </div>

          <!-- Items -->
          <table class="items-table">
            <thead>
              <tr>
                <th>Descrição do Artigo</th>
                <th style="width: 60px; text-align: center;">Qtd</th>
                ${!isDeliveryNote ? `
                <th style="width: 100px; text-align: right;">P. Unitário</th>
                <th style="width: 120px; text-align: right;">Valor Total</th>
                ` : ''}
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <!-- Bottom Area: Totals, Bank & QR -->
          <div class="bottom-section" style="display: ${isDeliveryNote ? 'none' : 'block'};">
            <div class="summary-area">
              <div class="totals-box">
                <div class="total-row"><span>Subtotal s/ IVA:</span><span>${(subtotalSemIva * rate).toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</span></div>
                <div class="total-row"><span>IVA Incidente:</span><span>${(ivaAmount * rate).toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</span></div>
                ${sale.discount > 0 ? `<div class="total-row"><span>Desconto Aplicado:</span><span>-${(sale.discount * rate).toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</span></div>` : ''}
                <div class="total-row grand"><span>TOTAL AOA:</span><span>${((grandTotal - sale.discount) * rate).toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</span></div>
              </div>
            </div>

            ${(invoiceSettings.bankName || invoiceSettings.iban) ? `
            <div class="bank-info">
              <p class="bank-info-title">Pagamento via Transferência / Depósito</p>
              <p><strong>Banco:</strong> ${invoiceSettings.bankName}</p>
              <p><strong>IBAN:</strong> ${invoiceSettings.iban}</p>
              ${invoiceSettings.swift ? `<p><strong>SWIFT:</strong> ${invoiceSettings.swift}</p>` : ''}
            </div>
            ` : ''}

            <div class="qr-container">
              <img src="${qrCodeUrl}" />
              <p class="qr-label">DOC VÁLIDO</p>
            </div>
          </div>

          <!-- Content Spacer (Pushes signatures/footer to the very bottom) -->
          <div class="flex-spacer"></div>

            <!-- Signatures Only for Delivery Note -->
            ${isDeliveryNote ? `
            <div class="signature-area">
              <div class="signature-box">
                <div class="signature-line"></div>
                <p class="signature-title">${invoiceSettings.companyName}</p>
                <p class="signature-desc">O Operador</p>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <p class="signature-title">Recebi em conformidade</p>
                <p class="signature-desc">Assinatura do Cliente</p>
              </div>
            </div>
            ` : ''}

            <div class="footer">
              <p>${isDeliveryNote ? 'GUIA DE REMESSA PARA EFEITOS DE TRANSPORTE E CONFERÊNCIA.' : (isProforma ? 'ESTE DOCUMENTO NÃO SERVE DE FATURA. APENAS COTAÇÃO.' : 'Documento processado por computador | Software by Infodinamica')}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
};
