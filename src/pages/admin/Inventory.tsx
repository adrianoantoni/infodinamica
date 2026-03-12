
import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Search, History, ArrowUpRight, ArrowDownRight, 
  Package, User, Clock, AlertTriangle, X, Save,
  MinusCircle, PlusCircle, RefreshCw, Layers
} from 'lucide-react';
import { MovementType, Product } from '@/types';

export const Inventory: React.FC = () => {
  const { products, stockMovements, addStockMovement, formatPrice, t, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustData, setAdjustData] = useState<{quantity: number, type: MovementType, reason: string, variationId?: string}>({ 
    quantity: 0, 
    type: MovementType.ENTRY, 
    reason: '',
    variationId: undefined 
  });

  const i = t.admin.inventory;
  const itemsPerPage = 10;

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const translatedName = t.products[p.id] || p.name;
      return translatedName.toLowerCase().includes(searchTerm.toLowerCase()) || 
             p.id.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [products, searchTerm, t]);

  const filteredHistory = useMemo(() => {
    return stockMovements.filter(m => {
      const p = products.find(prod => prod.id === m.productId);
      const name = p ? (t.products[p.id] || p.name) : '';
      return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             m.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
             m.user.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [stockMovements, products, searchTerm, t]);

  const handleApplyAdjustment = () => {
    if (!adjustingProduct || adjustData.quantity <= 0 || !adjustData.reason) {
      addToast('Preencha todos os campos corretamente.', 'warning');
      return;
    }

    if (adjustingProduct.variations.length > 0 && !adjustData.variationId) {
      addToast('Por favor, selecione qual variação deseja ajustar.', 'warning');
      return;
    }

    addStockMovement({
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
  };

  return (
    <div className="p-8 space-y-8">
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

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
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
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100"><ArrowUpRight size={14}/> Entradas</div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100"><ArrowDownRight size={14}/> Saídas</div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-x-auto">
          {activeTab === 'current' ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Produto</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Referência</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Stock Atual</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(product => (
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
                    <td className="px-8 py-5 text-center text-[10px] font-mono font-bold text-gray-400 uppercase">{product.id}</td>
                    <td className="px-8 py-5 text-center">
                      <div className="inline-flex flex-col items-center">
                         <span className={`text-xl font-black ${product.stock <= product.minStock ? 'text-red-600' : 'text-gray-900'}`}>{product.stock}</span>
                         {product.stock <= product.minStock && <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter flex items-center gap-1"><AlertTriangle size={8}/> Stock Crítico</span>}
                      </div>
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
                ))}
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
                   const varInfo = p?.variations.find(v => v.id === m.variationId);
                   return (
                     <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-gray-500 font-bold text-xs">
                             <Clock size={12} /> {new Date(m.date).toLocaleString()}
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <p className="text-xs font-black text-gray-800">{p ? (t.products[p.id] || p.name) : 'Produto Removido'}</p>
                          {varInfo && <p className="text-[10px] text-indigo-500 font-bold">Opção: {varInfo.name}</p>}
                       </td>
                       <td className="px-8 py-5 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                            m.type === MovementType.ENTRY ? 'bg-green-50 text-green-700 border-green-100' :
                            m.type === MovementType.EXIT ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            {m.type === MovementType.ENTRY ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                            {m.type}
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
      </div>

      {/* Adjust Stock Modal - Evoluído para suportar Variações */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
                 <h3 className="text-xl font-black italic uppercase italic">Ajuste de Stock Profissional</h3>
                 <button onClick={() => setAdjustingProduct(null)} className="p-2 hover:bg-white rounded-full"><X/></button>
              </div>
              <div className="p-10 space-y-6">
                 <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <img src={adjustingProduct.images[0]} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                       <p className="text-sm font-black">{t.products[adjustingProduct.id] || adjustingProduct.name}</p>
                       <p className="text-xs font-bold text-gray-400">Total Global: {adjustingProduct.stock} un.</p>
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
                    </select>
                 </div>

                 <button 
                   onClick={handleApplyAdjustment}
                   className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 mt-4"
                 >
                   <Save size={18}/> Validar e Actualizar
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
