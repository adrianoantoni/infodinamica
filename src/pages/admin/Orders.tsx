import React, { useState, useMemo, useEffect } from 'react';
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
  CheckCircle2,
  FileText,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { OrderStatus, Order } from '@/types';
import { EXCHANGE_RATES } from '@/constants';
import { printDocument } from '@/utils/documentTemplate';

interface OrdersProps {
  onNavigate: (page: string) => void;
}

export const Orders: React.FC<OrdersProps> = ({ onNavigate }) => {
  const { updateOrderStatus, formatPrice, invoiceSettings, siteSettings, currency, setEditingOrder, fetchOrders } = useApp();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 8; // we can increase this now that it is paginated

  const rate = EXCHANGE_RATES[currency];

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      const params: any = { page: currentPage, limit: itemsPerPage };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const result = await fetchOrders(params);
      setOrders(result.sales as any[]);
      setTotalPages(result.totalPages);
      setIsLoading(false);
    };
    
    // Add debounce for search term
    const timeoutId = setTimeout(() => {
      loadOrders();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, startDate, endDate, currentPage]);

  const getStatusColor = (status: OrderStatus | string) => {
    switch (status) {
      case OrderStatus.PENDING: 
      case 'Pending':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case OrderStatus.CONFIRMED: 
      case 'Confirmed':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'EM VERIFICAÇÃO':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'APROVADO':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case OrderStatus.SHIPPED: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case OrderStatus.DELIVERED: return 'bg-green-50 text-green-600 border-green-100';
      case OrderStatus.CANCELLED: return 'bg-red-50 text-red-600 border-red-100';
      case 'Completed': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const reprintInvoice = (order: Order, isProforma = false) => {
    const taxRate = invoiceSettings.taxEnabled ? (invoiceSettings.taxRate / 100) : 0;
    const saleData = {
      ...order,
      invoiceNumber: order.invoiceNumber || order.id,
      docType: isProforma ? 'PROFORMA' : (order.docType || 'FATURA'),
      date: order.createdAt,
      total: order.total,
      tax: order.tax || (order.total * taxRate),
      discount: order.discount || 0,
      items: order.items.map((i: any) => ({
        name: i.product?.name || i.name || 'Artigo sem nome',
        quantity: i.quantity,
        price: i.price,
        variationId: i.variationId
      }))
    };
    printDocument(saleData, siteSettings, invoiceSettings, rate);
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
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Pesquisar pedido..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none"
              />
            </div>
            <div>
              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none appearance-none"
              >
                <option value="">Todos os Status</option>
                <option value="Completed">Concluídos</option>
                <option value="Pending">Pendentes</option>
                <option value="EM VERIFICAÇÃO">Em Verificação</option>
                <option value="APROVADO">Aprovados</option>
                <option value="Canceled">Cancelados</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="date"
                value={startDate}
                placeholder="Início"
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none"
              />
              <span className="text-gray-400 font-bold">-</span>
              <input 
                type="date"
                value={endDate}
                placeholder="Fim"
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 relative">
            {isLoading && (
               <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                 <div className="animate-spin text-indigo-600 rounded-full border-4 border-indigo-600 border-t-transparent w-8 h-8"></div>
               </div>
            )}
            <table className="w-full text-left">
              <thead className="bg-white border-b-2 border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Pedido</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Data</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Pagamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.length === 0 && !isLoading ? (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400 font-bold">Nenhum pedido encontrado.</td></tr>
                ) : (
                  orders.map((order) => (
                    <tr 
                      key={order.id} 
                      className={`hover:bg-indigo-50/50 cursor-pointer transition-colors ${selectedOrderId === order.id ? 'bg-indigo-50' : ''}`}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <td className="px-8 py-5 font-black text-gray-900 text-xs">
                        {(order as any).invoiceNumber || order.id}
                        {(order as any).docType === 'PROFORMA' && (
                          <span className="ml-2 text-[8px] bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-black uppercase">Proforma</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-700">{order.customerName}</td>
                      <td className="px-8 py-5 text-center text-xs text-gray-400">{new Date((order as any).createdAt || (order as any).date).toLocaleDateString()}</td>
                      <td className="px-8 py-5 font-black text-gray-900 text-right">{formatPrice(order.total)}</td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        {(order as any).paymentProofs?.length > 0 ? (
                          <div className="flex flex-col items-center gap-1">
                             <ShieldCheck className="h-4 w-4 text-emerald-500" />
                             <span className="text-[8px] font-black text-emerald-600 uppercase">Submetido</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 opacity-20">
                             <Clock className="h-4 w-4 text-gray-400" />
                             <span className="text-[8px] font-black text-gray-400 uppercase">Pendente</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
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
              
              <div className="space-y-3 mb-8">
                <button 
                  onClick={() => reprintInvoice(selectedOrder)}
                  className="w-full py-4 bg-indigo-50 text-indigo-700 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-600 hover:text-white transition-all"
                >
                  <Printer size={16} /> Reimprimir Fatura (2ª Via)
                </button>
                <button 
                  onClick={() => reprintInvoice(selectedOrder, true)}
                  className="w-full py-4 bg-amber-50 text-amber-700 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-amber-100 flex items-center justify-center gap-3 hover:bg-amber-500 hover:text-white transition-all"
                >
                  <FileText size={16} /> Gerar Proforma
                </button>
                <button 
                  onClick={() => {
                    const printData = { ...selectedOrder, docType: 'DELIVERY_NOTE' };
                    printDocument(printData, siteSettings, invoiceSettings, rate);
                  }}
                  className="w-full py-4 bg-emerald-50 text-emerald-700 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-emerald-100 flex items-center justify-center gap-3 hover:bg-emerald-600 hover:text-white transition-all"
                >
                  <Truck size={16} /> Nota de Entrega
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
                {selectedOrder.items.map((item: any, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <img src={item.image || item.product?.images?.[0]} className="h-10 w-10 rounded-lg border object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-800 truncate">{item.product?.name || item.name || 'Artigo sem nome'}</p>
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
