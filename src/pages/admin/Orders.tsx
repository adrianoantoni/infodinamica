
import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Search, 
  Clock, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Printer,
  Edit3,
  CheckCircle2
} from 'lucide-react';
import { OrderStatus, Order } from '@/types';
import { EXCHANGE_RATES } from '@/constants';

interface OrdersProps {
  onNavigate: (page: string) => void;
}

export const Orders: React.FC<OrdersProps> = ({ onNavigate }) => {
  const { orders, updateOrderStatus, formatPrice, invoiceSettings, siteSettings, currency, setEditingOrder } = useApp();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const rate = EXCHANGE_RATES[currency];

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-amber-50 text-amber-600 border-amber-100';
      case OrderStatus.CONFIRMED: return 'bg-blue-50 text-blue-600 border-blue-100';
      case OrderStatus.SHIPPED: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case OrderStatus.DELIVERED: return 'bg-green-50 text-green-600 border-green-100';
      case OrderStatus.CANCELLED: return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const reprintInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalWithRate = order.total * rate;
    
    // Nomes dos produtos para o QR Code
    const productNames = order.items.map(i => i.name).join(', ');
    
    // Dados para o QR Code (Incluindo Itens)
    const dateStr = new Date(order.createdAt).toLocaleDateString('pt-PT');
    const qrData = encodeURIComponent(`DOC:${order.id}|NIF:${invoiceSettings.nif}|DATE:${dateStr}|TOTAL:${totalWithRate.toFixed(2)}|ITEMS:${productNames}`);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}`;

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * rate).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${(item.price * rate * item.quantity).toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>2ª VIA - ${order.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; font-size: 11px; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; color: rgba(0,0,0,0.05); pointer-events: none; z-index: -1; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; text-transform: uppercase; font-size: 9px; }
            .summary-flex { display: flex; justify-content: space-between; align-items: flex-end; }
            .qr-side { text-align: center; }
            .qr-side img { width: 100px; height: 100px; }
            .qr-side p { font-size: 8px; color: #999; margin-top: 5px; }
            .totals { width: 280px; background: #fcfcfc; padding: 20px; border-radius: 15px; border: 1px solid #eee; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .grand-total { font-size: 16px; font-weight: 800; border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; color: #4f46e5; }
            .footer { margin-top: 60px; text-align: center; color: #999; font-size: 9px; border-top: 1px dashed #ccc; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="watermark">2ª VIA</div>
          <div class="header">
            <div>${siteSettings.siteLogo ? `<img src="${siteSettings.siteLogo}" alt="${invoiceSettings.companyName}" style="max-height: 50px; margin-bottom: 10px;" />` : `<h1 style="margin:0; color:#4f46e5;">${invoiceSettings.companyName}</h1>`}<p>NIF: ${invoiceSettings.nif}<br>Tel: ${invoiceSettings.phone}</p></div>
            <div style="text-align: right"><h2>Fatura Recibo (2ª VIA)</h2><p>Data Original: ${new Date(order.createdAt).toLocaleString('pt-PT')}<br>Emissão 2ª Via: ${new Date().toLocaleString('pt-PT')}</p></div>
          </div>
          <p><strong>CLIENTE:</strong> ${order.customerName}</p>
          <table>
            <thead><tr><th>Descrição</th><th style="text-align:center;">Qtd</th><th style="text-align:right;">P. Unit</th><th style="text-align:right;">Total</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          
          <div class="summary-flex">
            <div class="qr-side">
               <img src="${qrCodeUrl}" alt="Verification QR" />
               <p>Digitalize para validar autenticidade</p>
            </div>
            <div class="totals">
              <div class="total-row grand-total"><span>TOTAL:</span><span>${(totalWithRate).toLocaleString('pt-PT', { minimumFractionDigits: 2 })} Kz</span></div>
            </div>
          </div>

          <div class="footer"><p>Processado por computador | Software Infodinamica v3.1</p></div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    onNavigate('admin-new-sale');
  };

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase italic">Gestão de Pedidos</h1>
          <p className="text-gray-500 text-sm font-medium">Histórico completo de vendas e fluxos de caixa.</p>
        </div>
        <button 
          onClick={() => { setEditingOrder(null); onNavigate('admin-new-sale'); }}
          className="flex items-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          <Plus className="h-4 w-4" /> Novo Faturamento (POS)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30">
            <div className="relative w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Pesquisar pedido..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none"
              />
            </div>
          </div>

          <div className="flex-1">
            <table className="w-full text-left">
              <thead className="bg-white border-b-2 border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Pedido</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Data</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className={`hover:bg-indigo-50/50 cursor-pointer transition-colors ${selectedOrderId === order.id ? 'bg-indigo-50' : ''}`}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <td className="px-8 py-5 font-black text-gray-900 text-xs">{order.id}</td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-700">{order.customerName}</td>
                    <td className="px-8 py-5 text-center text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-5 font-black text-gray-900 text-right">{formatPrice(order.total)}</td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-8 border-t border-gray-50 flex justify-center items-center gap-4 bg-gray-50/20">
              <button disabled={currentPage === 1} onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0,0); }} className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 disabled:opacity-20 transition-all shadow-sm"><ChevronLeft size={20} /></button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} onClick={() => { setCurrentPage(i + 1); window.scrollTo(0,0); }} className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 'bg-white border border-gray-100 text-gray-400 hover:text-indigo-600'}`}>{i + 1}</button>
                ))}
              </div>
              <button disabled={currentPage === totalPages} onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0,0); }} className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 disabled:opacity-20 transition-all shadow-sm"><ChevronRight size={20} /></button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-8 sticky top-8 animate-in slide-in-from-right-4">
              <h3 className="font-black text-gray-900 mb-8 flex items-center justify-between uppercase italic tracking-tight">
                Opções da Venda
                <button onClick={() => setSelectedOrderId(null)} className="p-2 hover:bg-gray-50 rounded-full"><XCircle size={20} className="text-gray-300" /></button>
              </h3>
              
              <div className="space-y-4 mb-8">
                <button 
                  onClick={() => reprintInvoice(selectedOrder)}
                  className="w-full py-4 bg-indigo-50 text-indigo-700 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-600 hover:text-white transition-all"
                >
                  <Printer size={16} /> Imprimir 2ª Via
                </button>
                <button 
                  onClick={() => handleEditOrder(selectedOrder)}
                  className="w-full py-4 bg-gray-50 text-gray-700 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-900 hover:text-white transition-all"
                >
                  <Edit3 size={16} /> Editar Venda
                </button>
              </div>

              <div className="space-y-6 pt-6 border-t border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Artigos da Venda</p>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <img src={item.image} className="h-10 w-10 rounded-lg border object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-indigo-600 font-bold">{item.quantity}x • {formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
                
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alterar Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => updateOrderStatus(selectedOrder.id, OrderStatus.CONFIRMED)} className="py-2.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase border border-blue-100 transition-all hover:bg-blue-600 hover:text-white">Confirmar</button>
                    <button onClick={() => updateOrderStatus(selectedOrder.id, OrderStatus.CANCELLED)} className="py-2.5 bg-red-50 text-red-700 rounded-xl text-[10px] font-black uppercase border border-red-100 transition-all hover:bg-red-600 hover:text-white">Cancelar</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 p-12 text-center h-[400px] flex flex-col justify-center">
              <Clock className="h-12 w-12 text-gray-100 mx-auto mb-6" />
              <p className="text-xs font-black text-gray-300 uppercase tracking-widest leading-relaxed">Selecione uma venda para gerir opções e 2ª via</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
