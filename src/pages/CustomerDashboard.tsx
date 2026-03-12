
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Package, ShoppingBag, Wallet, Clock, 
  ChevronRight, MapPin, Settings, LogOut,
  Star, Truck, CreditCard, CheckCircle2,
  Box, ShieldCheck, XCircle
} from 'lucide-react';
import { OrderStatus } from '@/types';

interface Props {
  onNavigate: (page: string) => void;
}

export const CustomerDashboard: React.FC<Props> = ({ onNavigate }) => {
  const { orders, customers, formatPrice, logout } = useApp();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Simular utilizador atual (João Silva)
  const user = customers[0]; 
  const userOrders = orders.filter(o => o.customerId === 'c-guest' || o.customerId === user.id);

  const getStatusStyle = (status: string) => {
    switch(status) {
      case OrderStatus.DELIVERED: return 'bg-green-50 text-green-700 border-green-100';
      case OrderStatus.PENDING: return 'bg-amber-50 text-amber-700 border-amber-100';
      case OrderStatus.CANCELLED: return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    }
  };

  const statusSteps = [
    { id: OrderStatus.PENDING, label: 'Pedido Recebido', icon: Clock },
    { id: OrderStatus.CONFIRMED, label: 'Pagamento Confirmado', icon: ShieldCheck },
    { id: OrderStatus.SHIPPED, label: 'Em Trânsito', icon: Truck },
    { id: OrderStatus.DELIVERED, label: 'Entregue', icon: CheckCircle2 },
  ];

  const getActiveStepIndex = (status: OrderStatus) => {
    if (status === OrderStatus.CANCELLED) return -1;
    return statusSteps.findIndex(s => s.id === status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-8">
           <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-indigo-500/5 text-center">
              <div className="w-24 h-24 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-xl shadow-indigo-100">
                 {user.name.charAt(0)}
              </div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter">{user.name}</h2>
              <p className="text-gray-400 text-xs font-bold uppercase mt-1 tracking-widest">{user.email}</p>
           </div>

           <nav className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5 flex flex-col gap-2">
              {[
                { icon: Package, label: 'Meus Pedidos', active: true },
                { icon: Wallet, label: 'Minha Carteira', active: false },
                { icon: MapPin, label: 'Endereços', active: false },
                { icon: Settings, label: 'Definições', active: false },
              ].map((item, i) => (
                <button key={i} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${item.active ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>
                   <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                   </div>
                   <ChevronRight size={14} className={item.active ? 'text-white' : 'text-gray-300'} />
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
        <div className="lg:col-span-3 space-y-8">
           {/* Summary Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
                 <Wallet className="absolute -right-4 -top-4 w-24 h-24 text-white/5" />
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Saldo Nexus Wallet</p>
                 <p className="text-3xl font-black tracking-tighter text-[#fed700] italic">{formatPrice(user.balance)}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Encomendas</p>
                 <p className="text-3xl font-black tracking-tighter text-gray-900 italic">{userOrders.length}</p>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nexus Rewards</p>
                 <p className="text-3xl font-black tracking-tighter text-indigo-600 italic">450 Pts</p>
              </div>
           </div>

           {/* Orders List */}
           <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-indigo-500/5 overflow-hidden">
              <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                 <h3 className="text-xl font-black italic uppercase tracking-tighter italic flex items-center gap-3">
                   <Clock className="text-indigo-600" /> Histórico de Compras
                 </h3>
              </div>
              <div className="divide-y divide-gray-50">
                 {userOrders.map((order) => {
                   const activeIndex = getActiveStepIndex(order.status);
                   const isExpanded = expandedOrderId === order.id;

                   return (
                     <div key={order.id} className="hover:bg-gray-50/20 transition-all">
                        <div className="p-8 flex flex-col md:flex-row gap-8 items-center">
                          <div className="flex-1">
                             <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Pedido #{order.id}</span>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(order.status)}`}>{order.status}</span>
                             </div>
                             <div className="flex -space-x-4 mb-6">
                                {order.items.slice(0, 4).map((item, i) => (
                                  <div key={i} className="w-14 h-14 rounded-2xl border-4 border-white overflow-hidden shadow-sm">
                                     <img src={item.image} className="w-full h-full object-cover" />
                                  </div>
                                ))}
                             </div>
                             <div className="flex items-center gap-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                <span className="flex items-center gap-1.5"><CreditCard size={14}/> {order.paymentMethod}</span>
                                <span className="flex items-center gap-1.5"><Truck size={14}/> {order.shippingAddress}</span>
                             </div>
                          </div>
                          <div className="text-right flex flex-col justify-between items-end gap-4">
                             <div className="text-right">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                <p className="text-2xl font-black text-gray-900 italic tracking-tighter">{formatPrice(order.total)}</p>
                             </div>
                             <button 
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2"
                             >
                               {isExpanded ? 'Ocultar Detalhes' : 'Ver Seguimento'} <ChevronRight size={14} className={isExpanded ? 'rotate-90' : ''}/>
                             </button>
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
                                        <p className="text-xs font-bold text-red-400">Esta encomenda foi cancelada e o valor estornado.</p>
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
                      <button onClick={() => onNavigate('home')} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100">Começar a Comprar</button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
