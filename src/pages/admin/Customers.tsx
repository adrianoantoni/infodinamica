import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Mail, Phone, ChevronLeft, ChevronRight, UserPlus, X, 
  Building2, Star, Crown, TrendingUp, ShoppingBag, Clock,
  Users as UsersIcon, ChevronDown, Award, BarChart2, Package
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useApp } from '@/context/AppContext';

type Tier = 'VIP' | 'Regular' | 'Novo';

interface EnrichedCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  nif?: string;
  address?: string;
  balance: number;
  customerType?: string;
  totalSpent: number;
  orderCount: number;
  lastPurchase?: string;
  tier: Tier;
  createdAt: string;
}

const TIER_CONFIG: Record<Tier, { label: string; color: string; icon: React.FC<any>; bg: string }> = {
  VIP:     { label: 'VIP',     color: 'text-amber-700',  icon: Crown,    bg: 'bg-amber-50 border-amber-200' },
  Regular: { label: 'Regular', color: 'text-indigo-700', icon: Star,     bg: 'bg-indigo-50 border-indigo-200' },
  Novo:    { label: 'Novo',    color: 'text-gray-600',   icon: TrendingUp, bg: 'bg-gray-50 border-gray-200' },
};

export const Customers: React.FC = () => {
  const { formatPrice, addToast, updateCustomerBalance } = useApp();
  const [customers, setCustomers] = useState<EnrichedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'top'>('all');
  const [topClients, setTopClients] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected customer detail drawer
  const [selectedCustomer, setSelectedCustomer] = useState<EnrichedCustomer | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // New customer modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', nif: '', phone: '', address: '', customerType: 'Regular' });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = useCallback(async (search = '') => {
    try {
      setLoading(true);
      const data = await apiService.getCustomers(search || undefined);
      setCustomers(data);
    } catch {
      addToast('Erro ao carregar clientes', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  useEffect(() => {
    if (activeTab === 'top' && topClients.length === 0) {
      apiService.getTopCustomers().then(setTopClients).catch(() => {});
    }
  }, [activeTab]);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
    const timer = setTimeout(() => fetchCustomers(val), 350);
    return () => clearTimeout(timer);
  };

  const openHistory = async (customer: EnrichedCustomer) => {
    setSelectedCustomer(customer);
    setHistoryLoading(true);
    try {
      const data = await apiService.getCustomerHistory(customer.id);
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiService.createCustomer(newCustomer);
      addToast('Cliente criado com sucesso!', 'success');
      setIsModalOpen(false);
      setNewCustomer({ name: '', email: '', nif: '', phone: '', address: '', customerType: 'Regular' });
      fetchCustomers();
    } catch {
      addToast('Erro ao criar cliente', 'error');
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const paginated = customers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">Gestão de Clientes</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Histórico, classificação e análise de compras por cliente.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
          <UserPlus className="h-4 w-4" /> Novo Cliente
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {[{ id: 'all', label: 'Todos os Clientes', icon: UsersIcon }, { id: 'top', label: 'Top Clientes', icon: Award }].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'all' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Customer Table */}
          <div className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col ${selectedCustomer ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
              <div className="relative w-full max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome, NIF, telefone..."
                  value={searchTerm}
                  onChange={e => handleSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 shrink-0">
                {customers.length} Registos
              </span>
            </div>

            <div className="flex-1 overflow-x-auto">
              {loading ? (
                <div className="py-20 text-center text-sm font-black text-gray-300 uppercase animate-pulse">A carregar...</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tier</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total Gasto</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Compras</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Última Compra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {paginated.map(customer => {
                      const tier = TIER_CONFIG[customer.tier] || TIER_CONFIG['Novo'];
                      const TierIcon = tier.icon;
                      return (
                        <tr
                          key={customer.id}
                          className={`hover:bg-indigo-50/30 cursor-pointer transition-colors group ${selectedCustomer?.id === customer.id ? 'bg-indigo-50' : ''}`}
                          onClick={() => openHistory(customer)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm border ${tier.bg} ${tier.color}`}>
                                {customer.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{customer.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                  {customer.phone && <><Phone size={9} /> {customer.phone}</>}
                                  {customer.phone && customer.email && <span className="mx-1">·</span>}
                                  {customer.email && <><Mail size={9} /> {customer.email}</>}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${tier.bg} ${tier.color}`}>
                              <TierIcon size={9} /> {tier.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-black text-gray-900 text-sm">{formatPrice(customer.totalSpent)}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-black text-indigo-600">{customer.orderCount}</span>
                            <span className="text-[9px] text-gray-400 ml-1">compras</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                              <Clock size={11} />
                              {customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString('pt-PT') : '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {paginated.length === 0 && !loading && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <div className="flex flex-col items-center opacity-20">
                            <UsersIcon size={48} className="mb-4" />
                            <p className="text-sm font-black uppercase">Sem clientes encontrados</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {totalPages > 1 && (
              <div className="p-6 border-t border-gray-50 flex justify-center items-center gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-20"><ChevronLeft size={16} /></button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-400 hover:border-indigo-600'}`}>{i + 1}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-20"><ChevronRight size={16} /></button>
              </div>
            )}
          </div>

          {/* Customer History Drawer */}
          {selectedCustomer && (
            <div className="xl:col-span-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-4">
              <div className="p-6 border-b border-gray-50 flex items-start justify-between">
                <div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border mb-2 ${TIER_CONFIG[selectedCustomer.tier]?.bg} ${TIER_CONFIG[selectedCustomer.tier]?.color}`}>
                    {React.createElement(TIER_CONFIG[selectedCustomer.tier]?.icon || Star, { size: 9 })} {selectedCustomer.tier}
                  </div>
                  <h3 className="font-black text-gray-900 text-base uppercase leading-tight">{selectedCustomer.name}</h3>
                  {selectedCustomer.nif && <p className="text-[10px] text-gray-400 font-bold mt-1">NIF: {selectedCustomer.nif}</p>}
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-px bg-gray-100 border-b border-gray-100">
                <div className="bg-white p-4 text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Gasto</p>
                  <p className="text-lg font-black text-gray-900">{formatPrice(selectedCustomer.totalSpent)}</p>
                </div>
                <div className="bg-white p-4 text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">N.º Compras</p>
                  <p className="text-lg font-black text-indigo-600">{selectedCustomer.orderCount}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="p-5 border-b border-gray-50 space-y-2">
                {selectedCustomer.phone && (
                  <p className="text-xs font-bold text-gray-600 flex items-center gap-2"><Phone size={12} className="text-indigo-400" /> {selectedCustomer.phone}</p>
                )}
                {selectedCustomer.email && (
                  <p className="text-xs font-bold text-gray-600 flex items-center gap-2"><Mail size={12} className="text-indigo-400" /> {selectedCustomer.email}</p>
                )}
                {selectedCustomer.balance > 0 && (
                  <p className="text-xs font-black text-green-600">💳 Saldo Wallet: {formatPrice(selectedCustomer.balance)}</p>
                )}
              </div>

              {/* Balance Management */}
              <div className="p-5 border-b border-gray-50 bg-indigo-50/30">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2 font-black italic">
                   <TrendingUp size={11} /> Gestão de Saldo (Wallet)
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      id="balance-amount"
                      type="number" 
                      placeholder="Valor..." 
                      className="w-full pl-8 pr-3 py-2.5 bg-white border border-indigo-100 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-400">Kz</span>
                  </div>
                  <button 
                    onClick={async () => {
                      const input = document.getElementById('balance-amount') as HTMLInputElement;
                      const val = parseFloat(input.value);
                      if (isNaN(val) || val <= 0) return addToast('Valor inválido', 'warning');
                      try {
                        await updateCustomerBalance(selectedCustomer.id, val, 'TOPUP');
                        input.value = '';
                        // Update the current selected customer view balance
                        setSelectedCustomer(prev => prev ? { ...prev, balance: prev.balance + val } : null);
                        // The main list update is handled by the context result in updateCustomerBalance
                      } catch(e) {}
                    }}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
                  >
                    Carregar
                  </button>
                </div>
              </div>

              {/* Purchase History */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ShoppingBag size={11} /> Histórico de Compras</p>
                  {historyLoading ? (
                    <div className="text-xs font-black text-gray-300 text-center py-8 animate-pulse">A carregar histórico...</div>
                  ) : history.length === 0 ? (
                    <div className="text-xs font-black text-gray-200 text-center py-8 flex flex-col items-center gap-2">
                      <Package size={32} className="opacity-30" />
                      Sem compras registadas
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {history.map((sale: any) => (
                        <div key={sale.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-indigo-600">{sale.invoiceNumber}</span>
                            <span className="text-[10px] text-gray-400 font-bold">{new Date(sale.date).toLocaleDateString('pt-PT')}</span>
                          </div>
                          <p className="text-sm font-black text-gray-900">{formatPrice(sale.total)}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{sale.items?.length || 0} artigo(s) • {sale.paymentMethod}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Top Clients Tab */
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-black text-gray-900 flex items-center gap-2"><BarChart2 size={16} className="text-indigo-600" /> Top 20 Melhores Clientes</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Por Volume de Compra</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">#</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tier</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total Gasto</th>
                  <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Compras</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topClients.map((c, i) => {
                  const tier = TIER_CONFIG[c.tier as Tier] || TIER_CONFIG['Novo'];
                  const TierIcon = tier.icon;
                  return (
                    <tr key={c.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-8 py-4">
                        <span className={`font-black text-lg ${i < 3 ? 'text-amber-500' : 'text-gray-300'}`}>#{i + 1}</span>
                      </td>
                      <td className="px-8 py-4">
                        <p className="font-black text-gray-900">{c.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{c.email}</p>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${tier.bg} ${tier.color}`}>
                          <TierIcon size={9} /> {tier.label}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right font-black text-gray-900">{formatPrice(c.totalSpent)}</td>
                      <td className="px-8 py-4 text-center font-black text-indigo-600">{c.orderCount}</td>
                    </tr>
                  );
                })}
                {topClients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-sm font-black text-gray-300">Sem dados suficientes para gerar o ranking.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-[3rem] w-full max-w-2xl relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900 italic uppercase">Novo Cliente</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Nome / Razão Social *</label>
                  <input required type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full px-5 py-3.5 border border-gray-100 rounded-xl font-bold bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">NIF</label>
                  <input type="text" value={newCustomer.nif} onChange={e => setNewCustomer({...newCustomer, nif: e.target.value})} className="w-full px-5 py-3.5 border border-gray-100 rounded-xl font-bold bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Telefone</label>
                  <input type="tel" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full px-5 py-3.5 border border-gray-100 rounded-xl font-bold bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">E-mail</label>
                  <input type="email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className="w-full px-5 py-3.5 border border-gray-100 rounded-xl font-bold bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Morada</label>
                  <input type="text" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} className="w-full px-5 py-3.5 border border-gray-100 rounded-xl font-bold bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-60">
                {saving ? 'A criar...' : 'Criar Cliente'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
