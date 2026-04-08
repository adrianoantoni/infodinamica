
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Search, History, ArrowUpRight, ArrowDownRight, 
  Package, User, Clock, AlertTriangle, X, Save,
  MinusCircle, PlusCircle, Layers, TrendingDown,
  Activity, BarChart3, Filter, RefreshCw, Loader2
} from 'lucide-react';
import { MovementType, Product } from '@/types';

export const Inventory: React.FC = () => {
  const { products, stockMovements, stockMovementsTotal, addStockMovement, fetchStockMovements, formatPrice, t, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'ENTRY' | 'EXIT'>('ALL');
  const [adjustData, setAdjustData] = useState<{quantity: number, type: MovementType, reason: string, variationId?: string}>({ 
    quantity: 0, 
    type: MovementType.ENTRY, 
    reason: '',
    variationId: undefined 
  });

  const i = t.admin.inventory;
  const itemsPerPage = 10;

  // Refresh movements on tab switch
  useEffect(() => {
    if (activeTab === 'history') {
      fetchStockMovements();
    }
  }, [activeTab, fetchStockMovements]);

  // Summary stats
  const lowStockProducts = useMemo(() => products.filter(p => p.stock <= p.minStock), [products]);
  const totalStock = useMemo(() => products.reduce((acc, p) => acc + p.stock, 0), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const translatedName = t.products[p.id] || p.name;
      return translatedName.toLowerCase().includes(searchTerm.toLowerCase()) || 
             p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             p.id.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [products, searchTerm, t]);

  const filteredHistory = useMemo(() => {
    let movements = stockMovements;
    
    if (historyFilter !== 'ALL') {
      const filterType = historyFilter === 'ENTRY' ? MovementType.ENTRY : MovementType.EXIT;
      movements = movements.filter(m => m.type === filterType);
    }

    if (searchTerm) {
      movements = movements.filter(m => {
        const p = products.find(prod => prod.id === m.productId);
        const name = p ? (t.products[p.id] || p.name) : '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               m.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
               m.user.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return movements;
  }, [stockMovements, products, searchTerm, historyFilter, t]);

  const handleApplyAdjustment = async () => {
    if (!adjustingProduct || adjustData.quantity <= 0 || !adjustData.reason) {
      addToast('Preencha todos os campos corretamente.', 'warning');
      return;
    }

    if (adjustingProduct.variations.length > 0 && !adjustData.variationId) {
      addToast('Por favor, selecione qual variação deseja ajustar.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await addStockMovement({
        productId: adjustingProduct.id,
        variationId: adjustData.variationId,
        quantity: adjustData.quantity,
        type: adjustData.type,
        reason: adjustData.reason,
        user: 'Administrador'
      });

      addToast(`Ajuste de ${adjustData.quantity} un. aplicado com sucesso!`, 'success');
      setAdjustingProduct(null);
      setAdjustData({ quantity: 0, type: MovementType.ENTRY, reason: '', variationId: undefined });
    } catch {
      // Error is already handled by addStockMovement
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockStatusColor = (product: Product) => {
    if (product.stock === 0) return { bg: 'bg-red-100', text: 'text-red-700', label: 'Esgotado', border: 'border-red-200' };
    if (product.stock <= product.minStock) return { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Crítico', border: 'border-amber-200' };
    if (product.stock <= product.minStock * 2) return { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Baixo', border: 'border-yellow-200' };
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Normal', border: 'border-emerald-200' };
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">{i.title}</h1>
          <p className="text-gray-500 text-sm font-medium">Controlo absoluto de entradas, saídas e quebras.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
           <button onClick={() => { setActiveTab('current'); setCurrentPage(1); }} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'current' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}>{i.current}</button>
           <button onClick={() => { setActiveTab('history'); setCurrentPage(1); }} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400'}`}>{i.history}</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-indigo-500/5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Produtos</p>
            <div className="p-2 bg-indigo-50 rounded-xl"><Package size={16} className="text-indigo-600" /></div>
          </div>
          <p className="text-3xl font-black text-gray-900 tracking-tighter">{products.length}</p>
          <p className="text-[10px] text-gray-400 font-bold mt-1">{totalStock} unidades em stock</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border-l-4 border-l-red-500 border border-gray-100 shadow-xl shadow-red-500/5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Crítico</p>
            <div className="p-2 bg-red-50 rounded-xl"><AlertTriangle size={16} className="text-red-600" /></div>
          </div>
          <p className="text-3xl font-black text-red-600 tracking-tighter">{lowStockProducts.length}</p>
          <p className="text-[10px] text-red-400 font-bold mt-1">produtos abaixo do mínimo</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-green-500/5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Movimentações</p>
            <div className="p-2 bg-green-50 rounded-xl"><Activity size={16} className="text-green-600" /></div>
          </div>
          <p className="text-3xl font-black text-gray-900 tracking-tighter">{stockMovementsTotal}</p>
          <p className="text-[10px] text-gray-400 font-bold mt-1">registos no histórico</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-amber-500/5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Esgotados</p>
            <div className="p-2 bg-amber-50 rounded-xl"><TrendingDown size={16} className="text-amber-600" /></div>
          </div>
          <p className="text-3xl font-black text-gray-900 tracking-tighter">{products.filter(p => p.stock === 0).length}</p>
          <p className="text-[10px] text-gray-400 font-bold mt-1">sem unidades disponíveis</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/20 gap-4">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder={activeTab === 'current' ? i.search_placeholder : "Pesquisar no histórico..."} 
              value={searchTerm} 
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all" 
            />
          </div>
          {activeTab === 'history' && (
            <div className="flex gap-2 flex-shrink-0">
              <button 
                onClick={() => { setHistoryFilter('ALL'); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${historyFilter === 'ALL' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
              >
                <Filter size={12}/> Todos
              </button>
              <button 
                onClick={() => { setHistoryFilter('ENTRY'); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${historyFilter === 'ENTRY' ? 'bg-green-600 text-white border-green-600 shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-green-200'}`}
              >
                <ArrowUpRight size={12}/> Entradas
              </button>
              <button 
                onClick={() => { setHistoryFilter('EXIT'); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${historyFilter === 'EXIT' ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-red-200'}`}
              >
                <ArrowDownRight size={12}/> Saídas
              </button>
              <button 
                onClick={() => fetchStockMovements()}
                className="p-2.5 rounded-xl border border-gray-100 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                title="Atualizar"
              >
                <RefreshCw size={14}/>
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-x-auto">
          {activeTab === 'current' ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Produto</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">SKU</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Stock Atual</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Mín.</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estado</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(product => {
                  const status = getStockStatusColor(product);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img src={product.images[0]} className="h-12 w-12 rounded-xl border object-cover shadow-sm" />
                          <div>
                            <p className="text-sm font-black text-gray-900">{t.products[product.id] || product.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center text-[10px] font-mono font-bold text-gray-400 uppercase">{product.sku || '—'}</td>
                      <td className="px-8 py-5 text-center">
                        <span className={`text-xl font-black ${product.stock <= product.minStock ? 'text-red-600' : 'text-gray-900'}`}>{product.stock}</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-xs font-bold text-gray-400">{product.minStock}</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border ${status.bg} ${status.text} ${status.border}`}>
                          {product.stock <= product.minStock && <AlertTriangle size={10}/>}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => {
                            setAdjustingProduct(product);
                            setAdjustData(prev => ({ ...prev, variationId: product.variations[0]?.id }));
                          }}
                          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                        >
                          Ajustar
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr><td colSpan={6} className="py-20 text-center text-gray-400 italic font-medium">Nenhum produto encontrado.</td></tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
               <thead className="bg-gray-50/50 border-b">
                 <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data / Hora</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Produto</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tipo</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qtd</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Motivo / User</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(m => {
                   const p = products.find(prod => prod.id === m.productId);
                   return (
                     <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-gray-500 font-bold text-xs">
                             <Clock size={12} /> {new Date(m.date).toLocaleString('pt-PT')}
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <p className="text-xs font-black text-gray-800">{p ? (t.products[p.id] || p.name) : 'Produto Removido'}</p>
                       </td>
                       <td className="px-8 py-5 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                            m.type === MovementType.ENTRY ? 'bg-green-50 text-green-700 border-green-100' :
                            m.type === MovementType.EXIT ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            {m.type === MovementType.ENTRY ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                            {m.type === MovementType.ENTRY ? 'Entrada' : m.type === MovementType.EXIT ? 'Saída' : 'Ajuste'}
                          </span>
                       </td>
                       <td className="px-8 py-5 text-center">
                          <span className="text-sm font-black">{m.quantity} un.</span>
                       </td>
                       <td className="px-8 py-5">
                          <div className="space-y-1">
                             <p className="text-[10px] font-black uppercase text-gray-900 leading-tight">{m.reason}</p>
                             <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase"><User size={10}/> {m.user}</div>
                          </div>
                       </td>
                     </tr>
                   );
                 })}
                 {filteredHistory.length === 0 && (
                   <tr><td colSpan={5} className="py-20 text-center text-gray-400 italic font-medium">Nenhum movimento registado.</td></tr>
                 )}
               </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {(() => {
          const totalItems = activeTab === 'current' ? filteredProducts.length : filteredHistory.length;
          const totalPages = Math.ceil(totalItems / itemsPerPage);
          if (totalPages <= 1) return null;
          return (
            <div className="p-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
              </p>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Adjust Stock Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
                 <h3 className="text-xl font-black italic uppercase">Ajuste de Stock</h3>
                 <button onClick={() => setAdjustingProduct(null)} className="p-2 hover:bg-white rounded-full"><X/></button>
              </div>
              <div className="p-10 space-y-6">
                 <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <img src={adjustingProduct.images[0]} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                       <p className="text-sm font-black">{t.products[adjustingProduct.id] || adjustingProduct.name}</p>
                       <p className="text-xs font-bold text-gray-400">Stock Atual: <span className={adjustingProduct.stock <= adjustingProduct.minStock ? 'text-red-600' : 'text-green-600'}>{adjustingProduct.stock} un.</span></p>
                       {adjustingProduct.sku && <p className="text-[10px] font-mono text-gray-400 mt-0.5">SKU: {adjustingProduct.sku}</p>}
                    </div>
                 </div>

                 {adjustingProduct.variations.length > 0 && (
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                        <Layers size={12}/> Seleccionar Opção / SKU
                      </label>
                      <select 
                        value={adjustData.variationId}
                        onChange={e => setAdjustData({...adjustData, variationId: e.target.value})}
                        className="w-full px-5 py-4 border border-gray-100 rounded-xl font-bold bg-gray-50 outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none"
                      >
                        {adjustingProduct.variations.map(v => (
                          <option key={v.id} value={v.id}>{v.name} (Atual: {v.stock} un.)</option>
                        ))}
                      </select>
                   </div>
                 )}

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Tipo de Fluxo</label>
                       <div className="flex p-1 bg-gray-100 rounded-xl">
                          <button 
                            onClick={() => setAdjustData({...adjustData, type: MovementType.ENTRY})}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${adjustData.type === MovementType.ENTRY ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400'}`}
                          >
                             <PlusCircle size={14}/> Entrada
                          </button>
                          <button 
                            onClick={() => setAdjustData({...adjustData, type: MovementType.EXIT})}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-black uppercase transition-all ${adjustData.type === MovementType.EXIT ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
                          >
                             <MinusCircle size={14}/> Saída
                          </button>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Qtd de Acerto</label>
                       <input 
                         type="number" 
                         value={adjustData.quantity || ''} 
                         onChange={e => setAdjustData({...adjustData, quantity: parseInt(e.target.value)})}
                         className="w-full px-5 py-4 border border-gray-100 rounded-xl font-black bg-gray-50 outline-none focus:ring-4 focus:ring-indigo-500/10" 
                         placeholder="0"
                         min={1}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Justificação do Ajuste</label>
                    <select 
                      value={adjustData.reason}
                      onChange={e => setAdjustData({...adjustData, reason: e.target.value})}
                      className="w-full px-5 py-4 border border-gray-100 rounded-xl font-bold bg-gray-50 outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none"
                    >
                       <option value="">Escolher motivo...</option>
                       <option value="Correção de Inventário Físico">Correção de Inventário Físico</option>
                       <option value="Entrada de Stock de Fornecedor">Entrada de Stock de Fornecedor</option>
                       <option value="Quebra / Artigo Danificado">Quebra / Artigo Danificado</option>
                       <option value="Devolução Processada">Devolução Processada</option>
                       <option value="Brinde ou Amostra Grátis">Brinde ou Amostra Grátis</option>
                       <option value="Transferência entre Armazéns">Transferência entre Armazéns</option>
                    </select>
                 </div>

                 <button 
                   onClick={handleApplyAdjustment}
                   disabled={isSubmitting}
                   className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
                 >
                   {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} 
                   {isSubmitting ? 'A Processar...' : 'Validar e Actualizar'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
