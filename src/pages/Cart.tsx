
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Trash2, ShoppingBag, ArrowLeft, ArrowRight, Printer, 
  Minus, Plus, Truck, CreditCard, ShieldCheck, CheckCircle2,
  Wallet, Banknote, Globe
} from 'lucide-react';
import { EXCHANGE_RATES } from '@/constants';

export const Cart: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { cart, removeFromCart, updateCartQuantity, placeOrder, invoiceSettings, siteSettings, formatPrice, products, currency } = useApp();
  
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment'>('cart');
  const [shippingMethod, setShippingMethod] = useState<'express' | 'pickup'>('express');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'wallet' | 'multicaixa'>('multicaixa');
  const [clientName, setClientName] = useState('');
  const [clientNif, setClientNif] = useState('');

  const rate = EXCHANGE_RATES[currency];
  const applyTax = invoiceSettings.taxEnabled;
  const currentTaxRate = invoiceSettings.taxRate;
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxAmount = 0;
  const shippingFee = 0;
  const grandTotal = subtotal;

  const handleFinish = () => {
    placeOrder({ 
      total: grandTotal, 
      customerId: clientNif || 'c-guest',
      customerName: clientName || 'Cliente Direto',
      shippingAddress: shippingMethod === 'express' ? 'Morada Registada' : 'Levantamento Nexus Hub',
      paymentMethod: paymentMethod.toUpperCase()
    });
    onNavigate('checkout-success');
  };

  const handlePrintProforma = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rate = EXCHANGE_RATES[currency];
    const totalInAOA = grandTotal * rate;
    const ivaRate = 14;
    const ivaAmount = totalInAOA * (ivaRate / 100);
    const totalIliquido = totalInAOA - ivaAmount;
    
    const dateStr = new Date().toLocaleDateString('pt-AO');
    const timeStr = new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
    const orderRef = `PP SXPKW${Math.floor(Math.random() * 900000) + 100000}/${new Date().getFullYear().toString().slice(-2)}`;
    
    const itemsHtml = cart.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: left;">
          ${item.name.toUpperCase()}<br>
          <span style="font-size: 8px; color: #666; font-style: italic;">IVA - Regime de exclusão</span>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * rate).toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">0,00</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">0,00</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${(item.price * rate * item.quantity).toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Factura Proforma - ${orderRef}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 40px; 
              color: #333; 
              line-height: 1.3; 
              font-size: 10px; 
              margin: 0; 
              background: #fff;
            }
            .page { max-width: 800px; margin: 0 auto; }
            
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            
            .company-info { width: 45%; }
            .company-info img { max-height: 80px; margin-bottom: 15px; }
            .company-name { font-size: 16px; font-weight: 700; color: #111; margin: 0 0 5px 0; }
            .company-details { font-size: 11px; color: #444; }
            .detail-row { display: flex; align-items: center; margin-bottom: 3px; }
            .detail-icon { width: 14px; margin-right: 8px; opacity: 0.7; }

            .doc-info-box { 
              width: 45%; 
              border: 1px solid #e5e7eb; 
              border-radius: 8px; 
              padding: 20px;
              background: #fff;
            }
            .doc-type { font-size: 20px; font-weight: 700; margin: 0 0 10px 0; text-transform: uppercase; color: #111; }
            .doc-ref { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 15px; }
            .info-grid { font-size: 10px; color: #666; }
            .info-grid div { margin-bottom: 4px; }
            .info-grid strong { color: #333; }

            .client-section { margin-bottom: 30px; display: flex; justify-content: flex-end; }
            .client-box { 
              width: 45%; 
              padding: 20px; 
              border: 1px solid #e5e7eb; 
              border-radius: 8px;
            }
            .client-name { font-size: 14px; font-weight: 700; margin: 0 0 8px 0; }
            .client-detail { margin-bottom: 3px; color: #555; }

            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .items-table th { 
              text-align: left; 
              padding: 10px 8px; 
              border-top: 2px solid #333; 
              border-bottom: 1px solid #333; 
              font-weight: 700; 
              text-transform: uppercase;
              font-size: 9px;
            }
            .items-table td { padding: 8px; font-size: 10px; border-bottom: 1px solid #eee; }
            .text-right { text-align: right !important; }
            .text-center { text-align: center !important; }

            .summary-section { display: flex; justify-content: space-between; page-break-inside: avoid; margin-bottom: 100px; }
            
            .tax-table { width: 50%; border-collapse: collapse; }
            .tax-table th { text-align: left; font-size: 9px; border-bottom: 1px solid #333; padding: 5px; }
            .tax-table td { font-size: 9px; padding: 5px; border-bottom: 1px solid #eee; }

            .totals-table { width: 35%; border-collapse: collapse; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
            .total-row.grand-total { 
              border-top: 2px solid #333; 
              border-bottom: none; 
              padding-top: 10px; 
              margin-top: 10px; 
              font-weight: 700; 
              font-size: 12px;
            }

            .bank-footer { 
              position: fixed; 
              bottom: 40px; 
              left: 40px; 
              right: 40px; 
              border-top: 1px solid #eee; 
              padding-top: 15px;
              font-size: 9px;
              color: #666;
            }
            .bank-footer p { margin: 2px 0; }

            @media print {
              body { padding: 0; }
              .bank-footer { position: fixed; bottom: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              <div class="company-info">
                <img src="${invoiceSettings.logo}" alt="Infodinâmica">
                <h2 class="company-name">${invoiceSettings.companyName}</h2>
                <div class="company-details">
                  <div class="detail-row">NIF: ${invoiceSettings.nif}</div>
                  <div class="detail-row">Luanda, Luanda, Luanda, Angola</div>
                  <div class="detail-row">Tel: ${invoiceSettings.phone}</div>
                  <div class="detail-row">E-mail: infodinamica036@gmail.com</div>
                </div>
              </div>
              
              <div class="doc-info-box">
                <h1 class="doc-type">PROFORMA</h1>
                <p class="doc-ref">${orderRef}</p>
                <div class="info-grid">
                  <div>Estado: <strong>Normal / Original</strong></div>
                  <div>Operador: <strong>${invoiceSettings.representativeName}</strong></div>
                  <div>Data de emissão: <strong>${dateStr} ${timeStr}</strong></div>
                </div>
              </div>
            </div>

            <div class="client-section">
              <div class="client-box">
                <h3 class="client-name">${clientName || 'Consumidor Final'}</h3>
                <div class="client-detail">NIF: ${clientNif || '999999999'}</div>
                <div class="client-detail">Angola, Luanda</div>
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 45%;">Artigo / Descrição</th>
                  <th class="text-center">Quant</th>
                  <th class="text-right">P. Unit.</th>
                  <th class="text-right">Desc.</th>
                  <th class="text-right">Taxa (%)</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="summary-section">
              <table class="tax-table">
                <thead>
                  <tr>
                    <th>Taxa (%)</th>
                    <th>Designação</th>
                    <th class="text-right">Base Incidência</th>
                    <th class="text-right">Valor Imp.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>0,00</td>
                    <td>IVA</td>
                    <td class="text-right">${totalInAOA.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</td>
                    <td class="text-right">0,00</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" style="padding-top: 15px; font-weight: 600;">
                      ** Este documento não serve de factura.<br>
                      Válido até ${new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-AO')}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div class="totals-table">
                <div class="total-row">
                  <span>Total Ilíquido:</span>
                  <span>${totalInAOA.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="total-row">
                  <span>Descontos comerciais:</span>
                  <span>0,00</span>
                </div>
                <div class="total-row">
                  <span>Descontos financeiros:</span>
                  <span>0,00</span>
                </div>
                <div class="total-row">
                  <span>Total Impostos:</span>
                  <span>0,00</span>
                </div>
                <div class="total-row grand-total">
                  <span>TOTAL A PAGAR:</span>
                  <span>${totalInAOA.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div class="bank-footer">
              <p>CONTA BAI: 2599796831.10.001 IBAN: ${invoiceSettings.iban}</p>
              <p>uTzu-Processado por programa validado nº 271/AGT/2020 - GME Sílica. | Pág. 1 / 1</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 1000);
  };
  const getAvailableStock = (productId: string, variationId?: string) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return 0;
    if (variationId) return p.variations.find(v => v.id === variationId)?.stock || 0;
    return p.stock;
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <ShoppingBag className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic">Seu Carrinho está Vazio</h2>
        <button onClick={() => onNavigate('home')} className="inline-flex items-center gap-2 bg-[#fed700] text-gray-900 px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#242424] hover:text-white transition-all shadow-xl shadow-yellow-100">
          <ArrowLeft className="h-4 w-4" /> Começar a Comprar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 md:py-16">
      <div className="flex justify-center mb-16">
        <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-3xl border border-gray-100 shadow-inner">
          <button onClick={() => setStep('cart')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${step === 'cart' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}>01. Carrinho</button>
          <div className="w-8 h-px bg-gray-200"></div>
          <button onClick={() => subtotal > 0 && setStep('shipping')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${step === 'shipping' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}>02. Entrega</button>
          <div className="w-8 h-px bg-gray-200"></div>
          <button onClick={() => subtotal > 0 && step === 'shipping' && setStep('payment')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${step === 'payment' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}>03. Pagamento</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-8">
          {step === 'cart' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8">Artigos Selecionados</h3>
              {cart.map((item, idx) => {
                const stock = getAvailableStock(item.productId, item.variationId);
                return (
                  <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex gap-6 items-center">
                    <img src={item.image} className="w-24 h-24 rounded-2xl object-cover border" />
                    <div className="flex-1">
                      <h4 className="font-black text-gray-900 text-lg uppercase italic tracking-tighter leading-tight">{item.name}</h4>
                      <p className="text-indigo-600 font-black mt-1">{formatPrice(item.price)}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Disponível: {stock} un.</p>
                    </div>
                    <div className="flex items-center border-2 border-gray-100 rounded-xl bg-gray-50 overflow-hidden">
                      <button onClick={() => updateCartQuantity(item.productId, Math.max(1, item.quantity - 1), item.variationId)} className="px-4 py-2 hover:bg-gray-100 font-black">-</button>
                      <span className="w-8 text-center font-black">{item.quantity}</span>
                      <button 
                        disabled={item.quantity >= stock}
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1, item.variationId)} 
                        className="px-4 py-2 hover:bg-gray-100 font-black disabled:opacity-30 disabled:cursor-not-allowed"
                      >+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.productId, item.variationId)} className="p-3 text-red-100 hover:text-red-500 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {step === 'shipping' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Escolha o Método de Entrega</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <button 
                  onClick={() => setShippingMethod('express')}
                  className={`p-10 rounded-[3rem] border-2 text-left transition-all ${shippingMethod === 'express' ? 'border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50 shadow-xl' : 'border-gray-100 hover:border-gray-200'}`}
                 >
                    <div className="w-14 h-14 bg-white border border-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><Truck className="text-indigo-600" /></div>
                    <p className="text-xl font-black text-gray-900 uppercase italic">Entrega Expressa</p>
                    <p className="text-sm text-gray-500 font-medium mt-2 leading-relaxed">Receba em casa em até 48 horas úteis para todo o país.</p>
                    <p className="mt-6 font-black text-indigo-600">+ {formatPrice(2500 / rate)}</p>
                 </button>

                 <button 
                  onClick={() => setShippingMethod('pickup')}
                  className={`p-10 rounded-[3rem] border-2 text-left transition-all ${shippingMethod === 'pickup' ? 'border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50 shadow-xl' : 'border-gray-100 hover:border-gray-200'}`}
                 >
                    <div className="w-14 h-14 bg-white border border-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm"><ShoppingBag className="text-indigo-600" /></div>
                    <p className="text-xl font-black text-gray-900 uppercase italic">Levantamento Hub</p>
                    <p className="text-sm text-gray-500 font-medium mt-2 leading-relaxed">Levante gratuitamente no nosso ponto central em Talatona.</p>
                    <p className="mt-6 font-black text-green-600">GRÁTIS</p>
                 </button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
               <h3 className="text-2xl font-black italic uppercase tracking-tighter">Forma de Pagamento</h3>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'multicaixa', name: 'Multicaixa Express', icon: Banknote },
                    { id: 'stripe', name: 'Cartão de Crédito', icon: CreditCard },
                    { id: 'paypal', name: 'PayPal Global', icon: Globe },
                    { id: 'wallet', name: 'Nexus Wallet', icon: Wallet },
                  ].map(m => (
                    <button 
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`flex items-center gap-4 p-6 rounded-3xl border-2 transition-all ${paymentMethod === m.id ? 'border-indigo-600 bg-indigo-50/50 shadow-lg' : 'border-gray-100 hover:bg-gray-50'}`}
                    >
                       <div className="w-10 h-10 bg-white border rounded-xl flex items-center justify-center text-indigo-600"><m.icon size={20}/></div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{m.name}</span>
                    </button>
                  ))}
               </div>
               
               <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white flex items-center gap-6">
                  <div className="p-4 bg-white/10 rounded-2xl"><ShieldCheck size={32} className="text-[#fed700]" /></div>
                  <div>
                    <p className="font-black italic uppercase">Transação Blindada</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">Seus dados bancários nunca são armazenados nos nossos servidores.</p>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[#242424] text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden sticky top-8">
            <h3 className="text-2xl font-black mb-8 tracking-tighter uppercase italic">Resumo Final</h3>
            
            {/* Customer Details for Proforma */}
            <div className="space-y-3 mb-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">Nome do Cliente / Empresa</label>
                <input 
                  type="text" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Omnem Intellegenda"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-medium focus:outline-none focus:border-[#fed700] transition-colors placeholder:text-gray-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-1">NIF</label>
                <input 
                  type="text" 
                  value={clientNif}
                  onChange={(e) => setClientNif(e.target.value)}
                  placeholder="Ex: 5402142009"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-medium focus:outline-none focus:border-[#fed700] transition-colors placeholder:text-gray-600"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[10px] font-black uppercase text-gray-400">Subtotal</span>
                <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
              </div>

              <div className="pt-6 flex justify-between items-end">
                <span className="text-xs font-black uppercase text-gray-300">Total a Pagar</span>
                <span className="text-4xl font-black tracking-tighter text-[#fed700] italic">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {step === 'cart' && (
              <div className="space-y-4 mt-12">
                <button 
                  onClick={() => setStep('shipping')}
                  className="w-full bg-[#fed700] text-gray-900 py-6 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-xl"
                >
                  Próximo Passo <ArrowRight className="inline-block ml-2 h-4 w-4" />
                </button>
                <button 
                  onClick={handlePrintProforma}
                  className="w-full bg-white/10 text-white py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-white/20 transition-all border border-white/20"
                >
                  <Printer size={16} /> Imprimir Proforma
                </button>
              </div>
            )}

            {step === 'shipping' && (
              <div className="flex gap-4 mt-12">
                <button onClick={() => setStep('cart')} className="px-6 bg-white/10 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest"><ArrowLeft size={18}/></button>
                <button 
                  onClick={() => setStep('payment')}
                  className="flex-1 bg-[#fed700] text-gray-900 py-6 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all"
                >
                  Continuar
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="flex gap-4 mt-12">
                <button onClick={() => setStep('shipping')} className="px-6 bg-white/10 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest"><ArrowLeft size={18}/></button>
                <button 
                  onClick={handleFinish}
                  className="flex-1 bg-green-500 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-green-600 transition-all shadow-xl shadow-green-900/20"
                >
                  Pagar Agora
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
