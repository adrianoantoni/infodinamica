
import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, Mail, MoreHorizontal, ChevronLeft, ChevronRight, UserPlus, Wallet, X, Building2, UserCircle, Users as UsersIcon } from 'lucide-react';
import { Customer } from '@/types';

export const Customers: React.FC = () => {
  const { customers, addCustomer, formatPrice } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    email: '',
    nif: '',
    phone: '',
    type: 'singular',
    balance: 0
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nif.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredCustomers.length);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const customer: Customer = {
      ...newCustomer as Customer,
      id: 'c-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    addCustomer(customer);
    setIsModalOpen(false);
    setNewCustomer({ name: '', email: '', nif: '', phone: '', type: 'singular', balance: 0 });
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">Gestão de Clientes</h1>
          <p className="text-gray-500 text-sm font-medium">Controlo de contas, saldos e histórico de faturação.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <UserPlus className="h-4 w-4" /> Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome, NIF ou email..." 
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
          </div>
          {filteredCustomers.length > 0 && (
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              A exibir <span className="text-indigo-600">{startIndex}-{endIndex}</span> de {filteredCustomers.length} registos
            </span>
          )}
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tipo</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">NIF / Identificação</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo Atual</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black shadow-inner">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase">{customer.name}</p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1 font-bold">
                          <Mail className="h-3 w-3" /> {customer.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${customer.type === 'empresa' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-700 border-gray-100'}`}>
                      {customer.type}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-mono font-bold text-gray-400">{customer.nif}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-sm font-black ${customer.balance > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {formatPrice(customer.balance)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-gray-300 hover:text-indigo-600 rounded-lg"><MoreHorizontal size={18}/></button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <UsersIcon size={48} className="mb-4" />
                      <p className="text-sm font-black uppercase">Sem resultados</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-50 flex justify-center items-center gap-2 bg-gray-50/20">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                    currentPage === i + 1 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'bg-white border border-gray-200 text-gray-400 hover:border-indigo-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-20 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[3rem] w-full max-w-2xl relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900 italic uppercase">Novo Registo</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-6">
              <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl">
                <button type="button" onClick={() => setNewCustomer({...newCustomer, type: 'singular'})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${newCustomer.type === 'singular' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>Singular</button>
                <button type="button" onClick={() => setNewCustomer({...newCustomer, type: 'empresa'})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${newCustomer.type === 'empresa' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>Empresa</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Nome / Razão Social</label>
                  <input required type="text" onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full px-5 py-3.5 border border-gray-100 rounded-xl font-bold bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">NIF</label>
                  <input required type="text" onChange={e => setNewCustomer({...newCustomer, nif: e.target.value})} className="w-full px-5 py-3.5 border border-gray-100 rounded-xl font-bold bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">E-mail</label>
                  <input required type="email" onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className="w-full px-5 py-3.5 border border-gray-100 rounded-xl font-bold bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">Criar Conta</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
