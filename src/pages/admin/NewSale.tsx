
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Search, ShoppingCart, ChevronLeft, 
  Loader2, Plus, Minus, UserCircle, X, Check,
  Wallet, Banknote, CreditCard, Printer, UserPlus,
  Building2, User as UserIcon
} from 'lucide-react';
import { Product, Customer, OrderStatus } from '@/types';
import { EXCHANGE_RATES } from '@/constants';

interface NewSaleProps {
  onNavigate: (page: string) => void;
}

export const NewSale: React.FC<NewSaleProps> = ({ onNavigate }) => {
  const { 
    products, 
    customers, 
    formatPrice, 
    placeOrder, 
    currency, 
    editingOrder, 
    setEditingOrder,
    invoiceSettings,
    siteSettings,
    addToast,
    t 
  } = useApp();
  
  const p = t.admin.pos;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [saleItems, setSaleItems] = useState<{product: Product, quantity: number, variationId?: string}[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);
  
  const [receivedAmount, setReceivedAmount] = useState<number | string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Dinheiro' | 'TPA' | 'Transferência' | 'Wallet'>('Dinheiro');
  const [varModalProduct, setVarModalProduct] = useState<Product | null>(null);
  
  const rate = EXCHANGE_RATES[currency];
  const applyTax = invoiceSettings.taxEnabled;
  const currentTaxRate = invoiceSettings.taxRate;

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return [];
    return customers.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      c.nif.includes(customerSearch)
    );
  }, [customers, customerSearch]);

  const addItem = (product: Product, variationId?: string) => {
    if (product.variations.length > 0 && !variationId) {
      setVarModalProduct(product);
      return;
    }
    const limit = variationId ? (product.variations.find(v => v.id === variationId)?.stock || 0) : product.stock;
    
    setSaleItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.variationId === variationId);
      if (existing) {
        if (existing.quantity + 1 > limit) {
          addToast(`Limite atingido (${limit} un.)`, 'warning');
          return prev;
        }
        return prev.map(i => (i.product.id === product.id && i.variationId === variationId) ? {...i, quantity: i.quantity + 1} : i);
      }
      if (limit <= 0) { addToast('Sem stock disponível', 'error'); return prev; }
      return [...prev, {product, quantity: 1, variationId}];
    });
    setVarModalProduct(null);
  };

  const updateQty = (productId: string, variationId: string | undefined, delta: number) => {
    setSaleItems(prev => prev.map(item => {
      if (item.product.id === productId && item.variationId === variationId) {
        const limit = variationId ? (item.product.variations.find(v => v.id === variationId)?.stock || 0) : item.product.stock;
        const newQty = item.quantity + delta;
        if (newQty > limit) {
          addToast('Stock insuficiente.', 'warning');
          return item;
        }
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const removeItem = (productId: string, variationId?: string) => {
    setSaleItems(prev => prev.filter(i => !(i.product.id === productId && i.variationId === variationId)));
  };

  const subtotal = useMemo(() => saleItems.reduce((acc, item) => {
    const price = item.variationId 
      ? (item.product.variations.find(v => v.id === item.variationId)?.price || item.product.price)
      : item.product.price;
    return acc + (price * rate * item.quantity);
  }, 0), [saleItems, rate]);

  const taxAmount = 0;
  const grandTotal = subtotal;
  const change = (Number(receivedAmount) > grandTotal) ? (Number(receivedAmount) - grandTotal) : 0;

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dateStr = new Date().toLocaleString('pt-AO');
    const orderId = `FR-${Date.now().toString().slice(-6)}`;
    const qrData = encodeURIComponent(`TYPE:FATURA-RECIBO|DOC:${orderId}|NIF:${selectedCustomer?.nif || '999999999'}|TOTAL:${grandTotal.toFixed(2)}`);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}`;

    const ivaAmount = grandTotal * 0.14; // Assuming 14% IVA
    const subtotalSemIva = grandTotal - ivaAmount;

    const itemsHtml = saleItems.map(item => {
      const price = item.variationId ? (item.product.variations.find(v => v.id === item.variationId)?.price || item.product.price) : item.product.price;
      return `
        <tr>
          <td style="padding: 6px 8px; border-bottom: 1px solid #f3f4f6; text-align: left;">${item.product.name}${item.variationId ? ` (${item.variationId})` : ''}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #f3f4f6; text-align: center;">${item.quantity}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #f3f4f6; text-align: right;">${(price * rate).toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: bold;">${(price * rate * item.quantity).toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Fatura Recibo - ${orderId}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 30px 40px; color: #111827; line-height: 1.4; font-size: 11px; margin: 0; }
            .header-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
            .logo-section { max-width: 50%; }
            .logo-section img { max-height: 60px; margin-bottom: 15px; }
            .logo-section h1 { margin: 0 0 10px 0; color: #111827; font-weight: 900; text-transform: uppercase; font-size: 20px; }
            .company-details { font-size: 10px; color: #4b5563; line-height: 1.5; }
            .doc-info-section { text-align: right; }
            .doc-title { margin: 0 0 15px 0; font-weight: 900; color: #111827; font-size: 24px; text-transform: uppercase; }
            .doc-meta { font-size: 10px; color: #4b5563; }
            .doc-meta table { width: auto; margin-left: auto; border-collapse: collapse; }
            .doc-meta td { padding: 4px 12px; border: 1px solid #e5e7eb; text-align: right; }
            .doc-meta td:first-child { background: #f9fafb; font-weight: 700; color: #374151; }
            
            .client-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .client-box { width: 48%; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; }
            .client-box-title { text-transform: uppercase; color: #6b7280; font-weight: 900; margin: 0 0 8px 0; font-size: 9px; letter-spacing: 0.5px; }
            .client-name { font-size: 12px; font-weight: 700; margin: 0 0 4px 0; color: #111827; }
            .client-detail { font-size: 10px; color: #4b5563; margin: 2px 0; }
            
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th { background: #f9fafb; padding: 10px; text-align: left; border-bottom: 2px solid #111827; font-size: 10px; text-transform: uppercase; color: #111827; font-weight: 700; }
            .items-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 10px; color: #374151; }
            .items-table th.text-right, .items-table td.text-right { text-align: right; }
            .items-table th.text-center, .items-table td.text-center { text-align: center; }
            
            .summary-area { display: flex; justify-content: space-between; align-items: flex-start; gap: 30px; page-break-inside: avoid; }
            .qr-container { display: flex; flex-direction: column; align-items: center; }
            .qr-container img { width: 110px; height: 110px; border: 1px solid #e5e7eb; padding: 5px; border-radius: 8px; background: #fff; }
            .qr-label { font-size: 8px; color: #6b7280; text-align: center; margin-top: 6px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
            
            .totals-box { width: 300px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 11px; color: #4b5563; }
            .total-row.grand { border-bottom: none; border-top: 2px solid #111827; padding-top: 12px; margin-top: 4px; font-weight: 900; font-size: 16px; color: #111827; }
            
            .bank-info { margin-top: 30px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; font-size: 10px; color: #374151; page-break-inside: avoid; }
            .bank-info-title { margin: 0 0 8px 0; font-weight: 700; color: #111827; text-transform: uppercase; font-size: 10px; }
            .bank-info p { margin: 4px 0; }
            
            .signature-area { margin-top: 50px; display: flex; justify-content: flex-end; page-break-inside: avoid; }
            .signature-box { text-align: center; width: 250px; }
            .signature-line { border-top: 1px solid #111827; margin-bottom: 8px; }
            .signature-title { margin: 0; font-size: 10px; font-weight: 700; color: #111827; text-transform: uppercase; }
            .signature-name { margin: 4px 0 0 0; font-size: 10px; color: #4b5563; }
            
            .footer { margin-top: 40px; text-align: center; font-size: 9px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px; page-break-inside: avoid; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; font-weight: 900; color: rgba(0,0,0,0.03); pointer-events: none; z-index: -1; white-space: nowrap; }
            
            @media print { 
              .no-print { display: none; } 
              body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } 
            }
          </style>
        </head>
        <body>
          <div class="watermark">FATURA RECIBO</div>
          
          <div class="header-container">
            <div class="logo-section">
              ${siteSettings.siteLogo ? `<img src="${siteSettings.siteLogo}" alt="${invoiceSettings.companyName}" />` : `<h1>${invoiceSettings.companyName}</h1>`}
              <div class="company-details">
                <strong>${invoiceSettings.companyName}</strong><br>
                NIF: ${invoiceSettings.nif}<br>
                Endereço: ${invoiceSettings.address}<br>
                Tel: ${invoiceSettings.phone}
              </div>
            </div>
            <div class="doc-info-section">
              <h2 class="doc-title">Fatura Recibo</h2>
              <div class="doc-meta">
                <table>
                  <tr><td>Data</td><td>${dateStr}</td></tr>
                  <tr><td>Referência</td><td>${orderId}</td></tr>
                  <tr><td>Moeda</td><td>AOA</td></tr>
                </table>
              </div>
            </div>
          </div>

          <div class="client-section">
            <div class="client-box">
              <p class="client-box-title">Cliente</p>
              <p class="client-name">${selectedCustomer?.name || 'CONSUMIDOR FINAL / CLIENTE GENÉRICO'}</p>
              <p class="client-detail">NIF: ${selectedCustomer?.nif || '999999999'}</p>
              ${selectedCustomer ? `<p class="client-detail" style="color: #4f46e5; font-weight: 700; margin-top: 6px;">SALDO WALLET: ${formatPrice(selectedCustomer.balance)}</p>` : ''}
            </div>
            <div class="client-box" style="visibility: hidden;">
              <!-- Placeholder for alignment if needed -->
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Descrição do Artigo</th>
                <th class="text-center" style="width: 60px;">Qtd</th>
                <th class="text-right" style="width: 120px;">Preço Unit.</th>
                <th class="text-right" style="width: 120px;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div class="summary-area">
            <div class="qr-container">
              <img src="${qrCodeUrl}" alt="QR Code" />
              <p class="qr-label">Documento Válido</p>
            </div>
            <div class="totals-box">
              <div class="total-row"><span>Subtotal:</span><span>${subtotalSemIva.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</span></div>
              <div class="total-row"><span>IVA (14%):</span><span>${ivaAmount.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</span></div>
              <div class="total-row grand"><span>TOTAL A PAGAR:</span><span>${grandTotal.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</span></div>
              
              <div style="margin-top: 12px; border-top: 1px dashed #d1d5db; padding-top: 10px;">
                <div class="total-row"><span>Método de Pagamento:</span><span>${paymentMethod}</span></div>
                <div class="total-row"><span>Valor Entregue:</span><span>${Number(receivedAmount).toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</span></div>
                <div class="total-row"><span>Troco:</span><span style="color: #10b981; font-weight: 700;">${change.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</span></div>
              </div>
            </div>
          </div>

          <div class="bank-info">
            <p class="bank-info-title">Coordenadas Bancárias para Pagamento</p>
            <p><strong>Banco:</strong> ${invoiceSettings.bankName} &nbsp;|&nbsp; <strong>IBAN:</strong> ${invoiceSettings.iban}</p>
            <p><strong>Referência de Pagamento:</strong> ${orderId}</p>
          </div>

          <div class="signature-area">
            <div class="signature-box">
              <div class="signature-line"></div>
              <p class="signature-title">O Representante</p>
              <p class="signature-name">${invoiceSettings.representativeName}</p>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0 0 4px 0; font-weight: 700; color: #374151;">Este documento serve de quitação após bom pagamento.</p>
            <p style="margin: 0;">Software: Infodinamica v3.5 | Processado por Computador</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleFinishSale = () => {
    if (saleItems.length === 0) return;
    if (selectedCustomer?.type === 'empresa' && !selectedCustomer.nif) {
      addToast('NIF obrigatório para empresas.', 'error');
      return;
    }
    if (paymentMethod === 'Dinheiro' && Number(receivedAmount) < grandTotal) {
      addToast('Valor insuficiente.', 'error');
      return;
    }
    setIsFinishing(true);
    handlePrintReceipt();
    const orderItems = saleItems.map(item => ({
      ...item.product,
      productId: item.product.id,
      quantity: item.quantity,
      variationId: item.variationId,
      image: item.product.images?.[0] || ''
    }));

    placeOrder({ 
      items: orderItems,
      total: grandTotal/rate, 
      source: 'pos', 
      customerName: selectedCustomer?.name || 'Venda POS',
      paymentMethod: paymentMethod,
      customerId: selectedCustomer?.id
    });
    setTimeout(() => { onNavigate('admin-orders'); setIsFinishing(false); }, 800);
  };

  return (
    <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-8 h-[calc(100vh-64px)] overflow-hidden bg-gray-50/50">
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('admin-dashboard')} className="p-2 hover:bg-white rounded-xl shadow-sm border border-gray-100 transition-all"><ChevronLeft /></button>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter italic">{p.title}</h1>
          </div>
          
          <div className="relative w-80">
            <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all ${selectedCustomer ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white border-gray-100'}`}>
               {selectedCustomer?.type === 'empresa' ? <Building2 size={18}/> : <UserIcon size={18} />}
               <input 
                 type="text" 
                 placeholder="Pesquisar NIF ou Nome..." 
                 value={selectedCustomer ? selectedCustomer.name : customerSearch}
                 onChange={e => { setCustomerSearch(e.target.value); setShowCustomerResults(true); setSelectedCustomer(null); }}
                 className={`bg-transparent outline-none text-sm font-black w-full placeholder:text-gray-400 ${selectedCustomer ? 'text-white' : 'text-gray-900'}`}
               />
               {selectedCustomer && <button onClick={() => {setSelectedCustomer(null); setCustomerSearch('');}} className="p-1 hover:bg-white/10 rounded-lg"><X size={14}/></button>}
            </div>
            
            {showCustomerResults && customerSearch && !selectedCustomer && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2">
                 <div className="max-h-60 overflow-y-auto custom-scrollbar">
                   {filteredCustomers.map(c => (
                     <button 
                      key={c.id}
                      onClick={() => { setSelectedCustomer(c); setShowCustomerResults(false); }}
                      className="w-full p-5 text-left hover:bg-indigo-50 flex items-center justify-between group border-b border-gray-50 last:border-none"
                     >
                        <div>
                          <p className="text-xs font-black text-gray-900 uppercase flex items-center gap-2">
                            {c.type === 'empresa' && <Building2 size={12} className="text-indigo-600"/>}
                            {c.name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold">NIF: {c.nif} • Wallet: {formatPrice(c.balance)}</p>
                        </div>
                        <Plus size={14} className="text-indigo-300 group-hover:text-indigo-600" />
                     </button>
                   ))}
                 </div>
                 <button onClick={() => onNavigate('admin-customers')} className="w-full p-4 text-center text-[10px] font-black uppercase text-indigo-600 bg-gray-50 hover:bg-indigo-100 border-t flex items-center justify-center gap-2">
                    <UserPlus size={14}/> Registar Novo Cliente
                 </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder={p.search_products} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-16 pr-6 py-5 bg-white rounded-[2.5rem] border-none shadow-xl shadow-indigo-500/5 outline-none font-bold text-lg" />
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 pr-2 custom-scrollbar">
          {products.filter(pr => pr.name.toLowerCase().includes(searchTerm.toLowerCase())).map(prod => (
            <button key={prod.id} onClick={() => addItem(prod)} className={`bg-white p-4 rounded-[2rem] border border-gray-100 hover:border-indigo-600 hover:shadow-xl transition-all text-left flex flex-col group shadow-sm ${prod.stock <= 0 ? 'opacity-50 grayscale' : ''}`}>
              <div className="aspect-square rounded-2xl overflow-hidden mb-3 relative bg-gray-50">
                <img src={prod.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                {prod.stock <= 0 && <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[1px]"><span className="bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-lg uppercase">Esgotado</span></div>}
              </div>
              <p className="text-[11px] font-black text-gray-900 truncate uppercase tracking-tighter leading-tight">{t.products[prod.id] || prod.name}</p>
              <div className="flex justify-between items-center mt-auto pt-3">
                 <p className="text-sm font-black text-indigo-600">{formatPrice(prod.price)}</p>
                 <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border">{prod.stock} un.</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-[480px] bg-white border border-gray-100 shadow-2xl rounded-[3.5rem] flex flex-col overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100"><ShoppingCart size={20}/></div>
            <h3 className="font-black italic text-gray-900 uppercase tracking-tighter">Carrinho</h3>
          </div>
          <span className="text-[11px] font-black bg-white border border-gray-100 text-indigo-600 px-4 py-2 rounded-2xl shadow-sm">{saleItems.length} ITENS</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/10">
          {saleItems.map((item, idx) => {
            const unitPrice = item.variationId ? (item.product.variations.find(v => v.id === item.variationId)?.price || item.product.price) : item.product.price;
            const stockLimit = item.variationId ? (item.product.variations.find(v => v.id === item.variationId)?.stock || 0) : item.product.stock;

            return (
              <div key={idx} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 group">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black truncate uppercase text-gray-900">{t.products[item.product.id] || item.product.name}</p>
                  <p className="text-[10px] text-indigo-600 font-bold mt-1">{formatPrice(unitPrice)}</p>
                </div>
                
                <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-2xl border border-gray-100">
                   <button onClick={() => updateQty(item.product.id, item.variationId, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-xl hover:text-red-600 transition-all shadow-sm"><Minus size={14}/></button>
                   <span className="w-6 text-center text-sm font-black">{item.quantity}</span>
                   <button disabled={item.quantity >= stockLimit} onClick={() => updateQty(item.product.id, item.variationId, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-xl hover:text-green-600 transition-all shadow-sm disabled:opacity-20"><Plus size={14}/></button>
                </div>

                <div className="text-right min-w-[90px]">
                   <p className="text-sm font-black text-gray-900">{(unitPrice * item.quantity * rate).toLocaleString()} {currency}</p>
                   <button onClick={() => removeItem(item.product.id, item.variationId)} className="text-[10px] font-black text-red-300 hover:text-red-500 uppercase mt-1">Remover</button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-8 bg-gray-900 text-white rounded-t-[4rem] space-y-6">
          <div className="flex gap-3">
             {[{ id: 'Dinheiro', icon: Banknote }, { id: 'TPA', icon: CreditCard }, { id: 'Wallet', icon: Wallet }].map(m => (
               <button key={m.id} onClick={() => setPaymentMethod(m.id as any)} className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-[1.5rem] border transition-all ${paymentMethod === m.id ? 'bg-indigo-600 border-indigo-500 shadow-xl scale-105' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'}`}>
                  <m.icon size={20}/>
                  <span className="text-[9px] font-black uppercase tracking-widest">{m.id}</span>
               </button>
             ))}
          </div>

          <div className="grid grid-cols-2 gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/10">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Recebido (Kz)</label>
                <input type="number" value={receivedAmount} onChange={e => setReceivedAmount(e.target.value)} className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl font-black text-2xl text-[#fed700] outline-none transition-all" placeholder="0" />
             </div>
             <div className="space-y-2 text-right">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Troco</label>
                <p className="text-3xl font-black text-green-400 tracking-tighter italic">{change.toLocaleString()} <span className="text-xs uppercase ml-1 opacity-50">{currency}</span></p>
             </div>
          </div>

          <div className="flex gap-4">
             <button onClick={() => handlePrintReceipt()} className="flex-1 py-5 bg-white/10 hover:bg-white/20 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-3 border border-white/20 active:scale-95 shadow-xl">
                <Printer size={20}/> F. RECIBO
             </button>
             <button disabled={isFinishing || saleItems.length === 0} onClick={handleFinishSale} className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95">
                {isFinishing ? <Loader2 className="animate-spin" /> : <Check size={22} className="text-[#fed700]"/>}
                {p.btn_finish}
             </button>
          </div>
        </div>
      </div>

      {varModalProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
           <div className="bg-white rounded-[3.5rem] w-full max-w-xl p-12 shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button onClick={() => setVarModalProduct(null)} className="absolute top-10 right-10 text-gray-300 hover:text-red-500 transition-colors bg-gray-50 p-2 rounded-full"><X size={24} /></button>
              <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-10 text-gray-900">Configurar Variação</h3>
              <div className="grid gap-4">
                 {varModalProduct.variations.map(v => (
                   <button 
                    key={v.id} 
                    disabled={v.stock <= 0}
                    onClick={() => addItem(varModalProduct, v.id)}
                    className={`flex items-center justify-between p-8 bg-gray-50 rounded-[2rem] border-2 border-transparent hover:border-indigo-600 hover:bg-indigo-50/30 transition-all group ${v.stock <= 0 ? 'opacity-40 grayscale cursor-not-allowed' : 'shadow-sm'}`}
                   >
                      <div className="text-left">
                         <p className="text-xl font-black uppercase text-gray-900 group-hover:text-indigo-600 transition-colors">{v.name}</p>
                         <p className={`text-[11px] font-black uppercase mt-1 ${v.stock <= 0 ? 'text-red-500' : 'text-gray-400'}`}>
                           {v.stock <= 0 ? 'Esgotado' : `Stock: ${v.stock}`}
                         </p>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="text-xl font-black text-gray-900">{formatPrice(v.price)}</span>
                      </div>
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
