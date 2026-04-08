import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Package, ShoppingBag, Wallet, Clock, 
  ChevronRight, MapPin, Settings, LogOut,
  Star, Truck, CreditCard, CheckCircle2,
  Box, ShieldCheck, XCircle, Upload, AlertCircle, Info, User as UserIcon, Printer
} from 'lucide-react';
import { OrderStatus, PaymentProof, Order } from '@/types';
import { apiService } from '@/services/api';
import { printDocument } from '@/utils/documentTemplate';

interface Props {
  onNavigate: (page: string) => void;
}

type TabType = 'orders' | 'wallet' | 'profile' | 'addresses';

export const CustomerDashboard: React.FC<Props> = ({ onNavigate }) => {
  const { orders, fetchCustomerOrders, user, formatPrice, logout, addToast, siteSettings, invoiceSettings } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'FATURA' | 'PROFORMA'>('ALL');
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.customer?.phone || '',
    address: user?.customer?.address || '',
    nif: user?.customer?.nif || '',
  });

  useEffect(() => {
    if (user?.customer?.id) {
       fetchCustomerOrders(user.customer.id);
    }
  }, [user?.customer?.id, fetchCustomerOrders]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.customer?.phone || '',
        address: user.customer?.address || '',
        nif: user.customer?.nif || '',
      });
    }
  }, [user]);

  const userOrders = orders.filter(o => {
    const isOwner = o.customerId === user?.customer?.id || o.customerId === user?.id;
    if (!isOwner) return false;
    if (orderFilter === 'ALL') return true;
    return o.docType === orderFilter;
  });

  const getStatusStyle = (status: string) => {
    switch(status) {
      case OrderStatus.DELIVERED: return 'bg-green-50 text-green-700 border-green-100';
      case OrderStatus.PENDING: return 'bg-amber-50 text-amber-700 border-amber-100';
      case OrderStatus.CANCELLED: return 'bg-red-50 text-red-700 border-red-100';
      case OrderStatus.EM_VERIFICACAO: return 'bg-blue-50 text-blue-700 border-blue-100';
      case OrderStatus.APROVADO: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    }
  };

  const statusSteps = [
    { id: OrderStatus.PENDING, label: 'Pedido Recebido', icon: Clock },
    { id: OrderStatus.EM_VERIFICACAO, label: 'Em Verificação', icon: ShieldCheck },
    { id: OrderStatus.APROVADO, label: 'Pagamento Aprovado', icon: CheckCircle2 },
    { id: OrderStatus.SHIPPED, label: 'Em Trânsito', icon: Truck },
    { id: OrderStatus.DELIVERED, label: 'Entregue', icon: CheckCircle2 },
  ];

  const getActiveStepIndex = (status: OrderStatus) => {
    if (status === OrderStatus.CANCELLED) return -1;
    return statusSteps.findIndex(s => s.id === status);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.updateProfile(profileForm);
      addToast('Perfil atualizado com sucesso!');
    } catch (error) {
      addToast('Erro ao atualizar perfil', 'error');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentFile || !paymentAmount) return;

    setIsSubmitting(true);
    try {
      await apiService.submitPayment({
        saleId: selectedSaleId || '',
        amount: parseFloat(paymentAmount),
        notes: selectedSaleId ? `Pagamento da encomenda ${selectedSaleId}` : 'Carregamento de Saldo',
        receipt: paymentFile
      });
      addToast('Comprovativo submetido para validação administrativa.');
      setShowPaymentModal(false);
      setPaymentFile(null);
      setPaymentAmount('');
    } catch (error) {
      addToast('Erro ao submeter comprovativo', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = (order: Order) => {
    printDocument(order, siteSettings, invoiceSettings);
  };

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-8 sm:py-16 mx-auto max-w-[1800px]">
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 p-8 text-white">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">Submeter Pagamento</h3>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-2">Validação Administrativa Nexus</p>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Montante (KZ)</label>
                <input 
                  type="number" 
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-indigo-500 transition-all font-bold"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Comprovativo Bancário (Max: 5MB)</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={(e) => setPaymentFile(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required
                  />
                  <div className={`border-2 border-dashed rounded-[2rem] p-8 text-center transition-all ${paymentFile ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    {paymentFile ? (
                      <div className="flex items-center justify-center gap-3 text-green-700 font-bold">
                        <CheckCircle2 size={24} />
                        <span className="text-xs uppercase">{paymentFile.name}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload size={32} className="mx-auto text-gray-300" />
                        <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Clique ou arraste (PDF, JPG, PNG)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
                >
                  {isSubmitting ? 'A Enviar...' : 'Confirmar Envio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-[280px] shrink-0 space-y-6">
           <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-indigo-500/5 text-center">
              <div className="w-24 h-24 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-xl shadow-indigo-100">
                 {user?.name?.charAt(0) || 'U'}
              </div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter">{user?.name}</h2>
              <p className="text-gray-400 text-xs font-bold uppercase mt-1 tracking-widest">{user?.email}</p>
              <div className="mt-6 pt-6 border-t border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo Atual</p>
                <p className="text-2xl font-black tracking-tighter text-indigo-600 italic">{formatPrice(user?.customer?.balance || 0)}</p>
              </div>
           </div>

           <nav className="bg-white p-3 rounded-[2rem] border border-gray-100 shadow-xl shadow-indigo-500/5 flex flex-col gap-1">
              {[
                { id: 'orders', icon: Package, label: 'Meus Pedidos' },
                { id: 'wallet', icon: Wallet, label: 'Minha Carteira' },
                { id: 'profile', icon: UserIcon, label: 'Perfil / Conta' },
                { id: 'addresses', icon: MapPin, label: 'Endereços' },
              ].map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                   <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                   </div>
                   <ChevronRight size={14} className={activeTab === item.id ? 'text-white' : 'text-gray-300'} />
                </button>
              ))}
              <button 
                onClick={() => { logout(); onNavigate('home'); }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all mt-4"
              >
                 <LogOut size={18} />
                 <span className="text-xs font-black uppercase tracking-widest">Sair da Conta</span>
              </button>
           </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-8">
           
            {activeTab === 'orders' && (
             <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-gray-900 p-6 md:p-8 rounded-[2rem] text-white relative overflow-hidden group shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Wallet className="absolute -right-4 -top-4 w-24 h-24 text-white/5" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nexus Wallet</p>
                      <p className="text-3xl font-black tracking-tighter text-[#fed700] italic">{formatPrice(user?.customer?.balance || 0)}</p>
                      <button 
                        onClick={() => setActiveTab('wallet')}
                        className="mt-4 text-[9px] font-black uppercase tracking-widest text-[#fed700] hover:underline"
                      >
                        Gerir Carteira →
                      </button>
                   </div>
                   <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-indigo-500/5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Pedidos</p>
                      <p className="text-3xl font-black tracking-tighter text-gray-900 italic">{userOrders.length}</p>
                   </div>
                   <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-indigo-500/5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pontos Fidelidade</p>
                      <p className="text-3xl font-black tracking-tighter text-indigo-600 italic">{user?.customer?.points || 0} Pts</p>
                   </div>
                </div>

                {/* Orders List */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-indigo-500/5 overflow-hidden">
                   <div className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <Clock className="text-indigo-600" /> Histórico de Compras
                      </h3>
                      <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                         <button 
                           onClick={() => setOrderFilter('ALL')}
                           className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${orderFilter === 'ALL' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                         >
                           Tudo
                         </button>
                         <button 
                           onClick={() => setOrderFilter('FATURA')}
                           className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${orderFilter === 'FATURA' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                         >
                           Recibos
                         </button>
                         <button 
                           onClick={() => setOrderFilter('PROFORMA')}
                           className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${orderFilter === 'PROFORMA' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                         >
                           Proformas
                         </button>
                      </div>
                   </div>
                   <div className="divide-y divide-gray-50">
                      {userOrders.map((order) => {
                        const activeIndex = getActiveStepIndex(order.status as any);
                        const isExpanded = expandedOrderId === order.id;
                        const orderRawStatus = order.status as string;
                        const isPending = orderRawStatus === 'Pending' || orderRawStatus === 'PENDING' || orderRawStatus === OrderStatus.PENDING;
                        const isVerifying = orderRawStatus === 'EM VERIFICAÇÃO' || orderRawStatus === OrderStatus.EM_VERIFICACAO;
                        const isApproved = order.docType === 'FATURA'; // Strictly only approved if converted to FATURA
                        const isProforma = order.docType === 'PROFORMA';
                        const showUploadButton = isProforma && !isVerifying;
                        const canPrint = true; // Always allow printing the CURRENT document type

                        return (
                          <div key={order.id} className="hover:bg-gray-50/20 transition-all border-b border-gray-50 last:border-0">
                             <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
                               <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-4">
                                     <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Pedido #{order.invoiceNumber || order.id}</span>
                                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(order.status)}`}>{order.status}</span>
                                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${order.docType === "PROFORMA" ? "bg-amber-500 text-white border-amber-600" : "bg-indigo-600 text-white border-indigo-700"}`}>{order.docType === "PROFORMA" ? "PROFORMA" : "RECIBO"}</span>
                                  </div>
                                  <div className="flex -space-x-4 mb-6">
                                     {order.items.slice(0, 4).map((item, i) => (
                                       <div key={i} className="w-14 h-14 rounded-2xl border-4 border-white overflow-hidden shadow-sm bg-gray-100">
                                          <img src={item.image} className="w-full h-full object-cover" />
                                       </div>
                                     ))}
                                     {order.items.length > 4 && (
                                       <div className="w-14 h-14 rounded-2xl border-4 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600">
                                         +{order.items.length - 4}
                                       </div>
                                     )}
                                  </div>
                                  <div className="flex items-center gap-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                     <span className="flex items-center gap-1.5"><CreditCard size={14}/> {order.paymentMethod}</span>
                                     <span className="flex items-center gap-1.5"><Truck size={14}/> {order.shippingAddress}</span>
                                  </div>
                               </div>
                               <div className="text-right flex flex-col justify-between items-end gap-4 w-full md:w-auto">
                                  <div className="text-right">
                                     <p className="text-xs text-gray-400 font-bold uppercase mb-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                     <p className="text-2xl font-black text-gray-900 italic tracking-tighter">{formatPrice(order.total)}</p>
                                  </div>
                                  <div className="flex gap-2 w-full md:w-auto">
                                    {showUploadButton && (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedSaleId(order.id);
                                          setPaymentAmount(order.total.toString());
                                          setShowPaymentModal(true);
                                        }}
                                        className="flex-1 md:flex-none px-6 py-3 bg-[#fed700] text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 shadow-xl shadow-yellow-100 transition-all flex items-center gap-2"
                                      >
                                        Submeter Comprovativo <Upload size={14} />
                                      </button>
                                    )}
                                    {isVerifying && (
                                      <span className="flex-1 md:flex-none px-6 py-3 bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-center cursor-not-allowed">
                                        Em Verificação
                                      </span>
                                    )}
                                    {canPrint && (
                                      <button 
                                          onClick={() => handlePrint(order)}
                                          className={`flex-1 md:flex-none px-6 py-3 border rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all flex items-center gap-2 ${isApproved ? 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700' : 'bg-white text-gray-900 border-gray-100 hover:bg-gray-50'}`}
                                      >
                                        {isApproved ? 'Imprimir Fatura-Recibo' : 'Imprimir Proforma'} <Printer size={14} />
                                      </button>
                                    )}
                                    <button 
                                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                        className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2"
                                    >
                                      {isExpanded ? 'Ver Menos' : 'Rastrear'} <ChevronRight size={14} className={isExpanded ? 'rotate-90' : ''}/>
                                    </button>
                                  </div>
                               </div>
                             </div>

                             {/* Order Timeline Section */}
                             {isExpanded && (
                               <div className="px-8 pb-12 pt-4 animate-in slide-in-from-top-4 duration-300">
                                  <div className="bg-gray-50 rounded-[2rem] p-10 border border-gray-100">
                                     <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-10 flex items-center gap-2">
                                       <Box size={14}/> Seguimento Logístico
                                     </h4>
                                     
                                     {order.status === OrderStatus.CANCELLED ? (
                                       <div className="flex items-center gap-4 text-red-600">
                                          <XCircle size={32}/>
                                          <div>
                                             <p className="font-black uppercase text-sm">Pedido Cancelado</p>
                                             <p className="text-xs font-bold text-red-400">Esta encomenda foi cancelada. Entre em contacto com o suporte para mais informações.</p>
                                          </div>
                                       </div>
                                     ) : (
                                       <div className="relative">
                                          {/* Timeline Line */}
                                          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
                                          <div 
                                             className="absolute left-6 top-0 w-1 bg-indigo-600 rounded-full transition-all duration-1000"
                                             style={{ height: `${(activeIndex / (statusSteps.length - 1)) * 100}%` }}
                                          ></div>

                                          <div className="space-y-12 relative">
                                             {statusSteps.map((step, idx) => {
                                               const isDone = idx <= activeIndex;
                                               const isCurrent = idx === activeIndex;
                                               const StepIcon = step.icon;

                                               return (
                                                 <div key={step.id} className="flex items-center gap-8 group">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-4 border-white shadow-lg relative z-10 ${isDone ? 'bg-indigo-600 text-white scale-110' : 'bg-gray-100 text-gray-400'}`}>
                                                       <StepIcon size={20} className={isCurrent ? 'animate-pulse' : ''} />
                                                    </div>
                                                    <div>
                                                       <p className={`font-black uppercase text-xs tracking-widest ${isDone ? 'text-gray-900' : 'text-gray-300'}`}>
                                                         {step.label}
                                                       </p>
                                                       {isCurrent && (
                                                         <p className="text-[10px] text-indigo-600 font-bold uppercase mt-1">Status Atual</p>
                                                       )}
                                                       {isDone && !isCurrent && (
                                                         <p className="text-[10px] text-green-500 font-bold uppercase mt-1">Concluído</p>
                                                       )}
                                                    </div>
                                                 </div>
                                               );
                                             })}
                                          </div>
                                       </div>
                                     )}
                                  </div>
                               </div>
                             )}
                          </div>
                        );
                      })}
                      {userOrders.length === 0 && (
                        <div className="p-20 text-center space-y-6">
                           <ShoppingBag className="h-12 w-12 text-gray-200 mx-auto" />
                           <p className="text-gray-400 font-medium italic">Ainda não realizou nenhuma compra.</p>
                           <button onClick={() => onNavigate('home')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95">Começar a Comprar</button>
                        </div>
                      )}
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'wallet' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
               <div className="bg-indigo-600 text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100 flex flex-col md:flex-row justify-between items-center gap-8 overflow-hidden relative">
                  <Wallet className="absolute -right-10 -top-10 w-48 h-48 text-white/5 rotate-12" />
                  <div className="relative z-10">
                     <p className="text-indigo-200 font-black uppercase tracking-widest text-[10px] mb-2">Balanço Disponível Nexus Wallet</p>
                     <p className="text-4xl md:text-5xl font-black italic tracking-tighter">{formatPrice(user?.customer?.balance || 0)}</p>
                     <p className="text-indigo-300 text-[10px] font-bold uppercase mt-4">Poupe nas transações usando a sua carteira interna.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedSaleId(null);
                      setPaymentAmount('');
                      setShowPaymentModal(true);
                    }}
                    className="relative z-10 px-10 py-5 bg-[#fed700] text-gray-900 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-yellow-400 hover:scale-105 transition-all shadow-xl shadow-indigo-700/50 flex items-center gap-3"
                  >
                    <Upload size={18} /> Carregar Saldo
                  </button>
               </div>

               <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-xl shadow-indigo-500/5">
                  <h3 className="text-lg font-black uppercase tracking-tighter italic mb-8 flex items-center gap-3">
                    <Info className="text-indigo-600" /> Como Funciona?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                     <div className="space-y-4 text-center">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto font-black text-xl">1</div>
                        <h4 className="font-black uppercase text-[10px] tracking-widest text-gray-900">Faça o Depósito</h4>
                        <p className="text-xs text-gray-500 font-medium">Transfira o valor para o nosso IBAN BAI disponível em "Contactos".</p>
                     </div>
                     <div className="space-y-4 text-center">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto font-black text-xl">2</div>
                        <h4 className="font-black uppercase text-[10px] tracking-widest text-gray-900">Envie o Comprovativo</h4>
                        <p className="text-xs text-gray-500 font-medium">Submeta a foto do talão aqui no painel da carteira.</p>
                     </div>
                     <div className="space-y-4 text-center">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto font-black text-xl">3</div>
                        <h4 className="font-black uppercase text-[10px] tracking-widest text-gray-900">Saldo Atualizado</h4>
                        <p className="text-xs text-gray-500 font-medium">Após verificação administrativa, o saldo ficará disponível para compras.</p>
                     </div>
                  </div>
               </div>
             </div>
           )}

           {activeTab === 'profile' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-indigo-500/5 overflow-hidden">
                   <div className="p-8 md:p-12 border-b border-gray-50 bg-gray-50/30">
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <Settings className="text-indigo-600" /> Configurações de Conta
                      </h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2 ml-9">Gira os seus dados de faturação e acesso</p>
                   </div>
                   <div className="p-8 md:p-12">
                      <form onSubmit={handleProfileUpdate} className="space-y-8 max-w-2xl">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nome Completo</label>
                               <input 
                                  type="text" 
                                  value={profileForm.name}
                                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-indigo-500 transition-all font-bold"
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Email Principal</label>
                               <input 
                                  type="email" 
                                  value={profileForm.email}
                                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-indigo-500 transition-all font-bold"
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Contacto Móvel</label>
                               <input 
                                  type="text" 
                                  value={profileForm.phone}
                                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                                  placeholder="+244"
                                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-indigo-500 transition-all font-bold"
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">NIF / Identidade</label>
                               <input 
                                  type="text" 
                                  value={profileForm.nif}
                                  onChange={(e) => setProfileForm({...profileForm, nif: e.target.value})}
                                  className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-indigo-500 transition-all font-bold"
                               />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Morada de Faturação</label>
                            <textarea 
                               rows={3}
                               value={profileForm.address}
                               onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                               className="w-full bg-gray-50 border-none rounded-3xl p-4 text-sm focus:ring-2 ring-indigo-500 transition-all font-bold"
                               placeholder="Ex: Luanda, Viana, Estrada Principal..."
                            />
                         </div>
                         <button 
                            type="submit"
                            className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all transform hover:scale-105 active:scale-95"
                         >
                            Guardar Alterações
                         </button>
                      </form>
                      
                      <div className="mt-16 pt-16 border-t border-gray-50">
                         <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                               <h4 className="text-red-900 font-black uppercase text-xs tracking-widest mb-1 italic">Segurança da Conta</h4>
                               <p className="text-red-500 text-[10px] font-bold uppercase">Mantenha a sua senha atualizada regularmente.</p>
                            </div>
                            <button className="px-8 py-3 bg-white text-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all">Alterar Senha</button>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'addresses' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-20 text-center bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-indigo-500/5">
                <MapPin className="h-16 w-16 text-gray-100 mx-auto mb-6" />
                <h4 className="text-xl font-black italic uppercase tracking-tighter italic">Gestão de Moradas</h4>
                <p className="text-gray-400 font-medium italic mt-4">Funcionalidade em desenvolvimento para o Nexus v2.</p>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};
