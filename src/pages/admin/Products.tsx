
import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Plus, 
  Search, 
  Trash2, 
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Link as LinkIcon,
  AlertCircle,
  Sparkles,
  Loader2,
  Layers,
  DollarSign,
  Box
} from 'lucide-react';
import { Product, ProductVariation } from '@/types';
import { GoogleGenAI } from "@google/genai";

export const Products: React.FC = () => {
  const { products, addProduct, deleteProduct, formatPrice, t, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  const itemsPerPage = 5;

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'Informática',
    brand: '',
    description: '',
    stock: 0,
    minStock: 5,
    images: [],
    variations: []
  });

  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [tempVariation, setTempVariation] = useState<Partial<ProductVariation>>({ name: '', sku: '', price: 0, stock: 0 });

  const generateAIDescription = async () => {
    if (!newProduct.name || newProduct.name.length < 3) {
      addToast('Introduza o nome do produto primeiro.', 'warning');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Escreva uma descrição curta, profissional e persuasiva para um e-commerce sobre o seguinte produto: ${newProduct.name} da marca ${newProduct.brand || 'Nexus'}. Foque em benefícios técnicos e qualidade. Máximo 3 parágrafos.`,
      });
      
      if (response.text) {
        setNewProduct(prev => ({ ...prev, description: response.text }));
        addToast('Descrição gerada com IA!', 'success');
      }
    } catch (error) {
      addToast('Erro ao contactar a IA. Verifique a ligação.', 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const addImageUrl = () => {
    if (currentImageUrl.trim()) {
      setNewProduct(prev => ({
        ...prev,
        images: [...(prev.images || []), currentImageUrl.trim()]
      }));
      setCurrentImageUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const addVariation = () => {
    if (!tempVariation.name || !tempVariation.sku) {
      addToast('Preencha o nome e SKU da variação.', 'warning');
      return;
    }
    const variation: ProductVariation = {
      ...tempVariation as ProductVariation,
      id: 'v-' + Date.now()
    };
    setNewProduct(prev => ({
      ...prev,
      variations: [...(prev.variations || []), variation],
      // O stock total é a soma das variações se elas existirem
      stock: (prev.variations || []).reduce((acc, v) => acc + v.stock, 0) + variation.stock
    }));
    setTempVariation({ name: '', sku: '', price: 0, stock: 0 });
  };

  const removeVariation = (id: string) => {
    setNewProduct(prev => {
      const filtered = (prev.variations || []).filter(v => v.id !== id);
      return {
        ...prev,
        variations: filtered,
        stock: filtered.reduce((acc, v) => acc + v.stock, 0)
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.images || newProduct.images.length === 0) {
      addToast('Adicione pelo menos uma imagem.', 'error');
      return;
    }

    const product: Product = {
      ...newProduct as Product,
      id: 'p-' + Date.now(),
      rating: 0,
      reviewsCount: 0,
      featured: false,
      createdAt: new Date().toISOString(),
      variations: newProduct.variations || []
    };
    addProduct(product);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewProduct({ 
      name: '', 
      price: 0, 
      category: 'Informática', 
      brand: '',
      description: '',
      stock: 0, 
      minStock: 5, 
      images: [],
      variations: []
    });
    setCurrentImageUrl('');
    setTempVariation({ name: '', sku: '', price: 0, stock: 0 });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase italic">Catálogo de Artigos</h1>
          <p className="text-gray-500 text-sm font-medium">Gestão centralizada do stock e catálogo.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Novo Artigo
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-6 border-b border-gray-50 bg-gray-50/20">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Pesquisar produto..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3.5 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 font-bold bg-white outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Produto</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Categoria</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Preço</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Stock</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl border overflow-hidden shadow-sm relative group/img bg-gray-100">
                         <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                         {product.images.length > 1 && (
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                              <span className="text-[8px] text-white font-black">+{product.images.length - 1}</span>
                           </div>
                         )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">{t.products[product.id] || product.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center text-[10px] font-black uppercase text-gray-500">{product.category}</td>
                  <td className="px-8 py-5 text-center text-sm font-black text-gray-900">{formatPrice(product.price)}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${product.stock > product.minStock ? 'text-green-600 border-green-100 bg-green-50' : 'text-red-600 border-red-100 bg-red-50 animate-pulse'}`}>
                      {product.stock} un.
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-3 text-gray-300 hover:text-red-600 rounded-xl transition-all" onClick={() => deleteProduct(product.id)}>
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-8 border-t border-gray-100 flex justify-center items-center gap-3 bg-gray-50/20">
            <button 
              disabled={currentPage === 1}
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); }}
              className="p-3 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-20 shadow-sm transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => { setCurrentPage(i + 1); }}
                  className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 'bg-white border border-gray-100 text-gray-400 hover:border-indigo-600 hover:text-indigo-600'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); }}
              className="p-3 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-20 shadow-sm transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[3rem] w-full max-w-6xl relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
            <div className="px-10 py-8 border-b bg-gray-50/50 flex justify-between items-center flex-shrink-0">
              <div>
                <h2 className="text-xl font-black uppercase italic">Painel de Cadastro Avançado</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Configure variações e optimize o seu inventário</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X className="h-6 w-6" /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Basic Info (Col 1) */}
                <div className="space-y-6">
                  <h3 className="text-[11px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
                    <Box size={14}/> Informação Base
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 block">Nome do Produto</label>
                      <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-5 py-4 border border-gray-100 rounded-2xl font-bold bg-gray-50/30 outline-none focus:ring-4 focus:ring-indigo-500/10" placeholder="Ex: Monitor UltraNexus 4K" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 block">Marca</label>
                        <input required type="text" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} className="w-full px-5 py-4 border border-gray-100 rounded-2xl font-bold bg-gray-50/30 outline-none focus:ring-4 focus:ring-indigo-500/10" placeholder="Ex: Nexus" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 block">Categoria</label>
                        <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-5 py-4 border border-gray-100 rounded-2xl font-bold bg-gray-50/30 outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none">
                           <option>Informática</option>
                           <option>Escritório</option>
                           <option>Electrodomésticos</option>
                           <option>Segurança</option>
                           <option>Telemóveis</option>
                           <option>Energia</option>
                           <option>Imagem e Som</option>
                           <option>Jogos, Consolas e Desporto</option>
                           <option>Beleza e Saúde</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 block">Preço Base</label>
                        <input required type="number" step="0.01" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} className="w-full px-5 py-4 border border-gray-100 rounded-2xl font-black bg-gray-50/30 outline-none focus:ring-4 focus:ring-indigo-500/10" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 block">Stock Global</label>
                        <input required type="number" value={newProduct.stock || ''} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="w-full px-5 py-4 border border-gray-100 rounded-2xl font-black bg-gray-50/30 outline-none focus:ring-4 focus:ring-indigo-500/10" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-2 mb-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Descrição do Produto</label>
                        <button 
                          type="button"
                          onClick={generateAIDescription}
                          disabled={isGeneratingAI}
                          className="flex items-center gap-1.5 text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors uppercase tracking-widest disabled:opacity-50"
                        >
                          {isGeneratingAI ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                          Gerar com IA
                        </button>
                      </div>
                      <textarea 
                        rows={6} 
                        value={newProduct.description} 
                        onChange={e => setNewProduct({...newProduct, description: e.target.value})} 
                        className="w-full px-5 py-4 border border-gray-100 rounded-2xl font-medium bg-gray-50/30 outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none text-sm leading-relaxed" 
                        placeholder="Descreva as características principais..."
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Variations & SKUs (Col 2) */}
                <div className="space-y-6">
                  <h3 className="text-[11px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
                    <Layers size={14}/> Variações & SKUs
                  </h3>
                  
                  <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Nome (Ex: XL / Preto)" value={tempVariation.name} onChange={e => setTempVariation({...tempVariation, name: e.target.value})} className="px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold" />
                        <input type="text" placeholder="SKU Único" value={tempVariation.sku} onChange={e => setTempVariation({...tempVariation, sku: e.target.value})} className="px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                           <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={12}/>
                           <input type="number" placeholder="Preço" value={tempVariation.price || ''} onChange={e => setTempVariation({...tempVariation, price: parseFloat(e.target.value)})} className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-xs font-bold" />
                        </div>
                        <div className="relative">
                           <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={12}/>
                           <input type="number" placeholder="Stock" value={tempVariation.stock || ''} onChange={e => setTempVariation({...tempVariation, stock: parseInt(e.target.value)})} className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-xs font-bold" />
                        </div>
                     </div>
                     <button type="button" onClick={addVariation} className="w-full py-3 bg-white text-indigo-600 border-2 border-indigo-100 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                        Adicionar Opção
                     </button>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                     {newProduct.variations?.map((v, i) => (
                       <div key={v.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm animate-in slide-in-from-top-2">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600"><Layers size={14}/></div>
                             <div>
                                <p className="text-xs font-black uppercase tracking-tighter">{v.name}</p>
                                <p className="text-[9px] text-gray-400 font-mono">SKU: {v.sku} • Stock: {v.stock}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <span className="text-xs font-black text-gray-900">{formatPrice(v.price)}</span>
                             <button type="button" onClick={() => removeVariation(v.id)} className="text-red-200 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                          </div>
                       </div>
                     ))}
                     {(!newProduct.variations || newProduct.variations.length === 0) && (
                       <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sem variações definidas</p>
                       </div>
                     )}
                  </div>
                </div>

                {/* Media & Finalize (Col 3) */}
                <div className="space-y-6">
                   <h3 className="text-[11px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
                    <ImageIcon size={14}/> Galeria & Capa
                   </h3>
                   
                   <div className="p-6 bg-indigo-50/30 rounded-[2rem] border border-indigo-100">
                      <div className="flex gap-2">
                         <div className="relative flex-1">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={14} />
                            <input 
                               type="text" 
                               value={currentImageUrl}
                               onChange={(e) => setCurrentImageUrl(e.target.value)}
                               className="w-full pl-10 pr-4 py-3 bg-white border border-indigo-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                               placeholder="URL da Imagem..."
                               onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                            />
                         </div>
                         <button 
                            type="button"
                            onClick={addImageUrl}
                            className="px-4 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                         >
                            Add
                         </button>
                      </div>

                      <div className="mt-6 grid grid-cols-3 gap-3 min-h-[160px]">
                         {newProduct.images && newProduct.images.length > 0 ? (
                            newProduct.images.map((img, idx) => (
                               <div key={idx} className="relative aspect-square rounded-2xl border-2 border-white shadow-md overflow-hidden group">
                                  <img src={img} className="w-full h-full object-cover" alt="" />
                                  <button 
                                     type="button"
                                     onClick={() => removeImageUrl(idx)}
                                     className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                     <Trash2 size={12} />
                                  </button>
                                  {idx === 0 && (
                                     <div className="absolute bottom-0 left-0 right-0 bg-indigo-600/90 text-[8px] text-white font-black text-center py-1 uppercase">Capa</div>
                                  )}
                               </div>
                            ))
                         ) : (
                            <div className="col-span-3 border-2 border-dashed border-indigo-200 rounded-[2rem] flex flex-col items-center justify-center text-indigo-300 p-8">
                               <ImageIcon size={32} className="mb-2 opacity-50" />
                               <p className="text-[10px] font-bold uppercase tracking-widest text-center">Nenhuma imagem</p>
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="p-6 bg-amber-50/50 rounded-[2rem] border border-amber-100 flex gap-4">
                      <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
                      <p className="text-[10px] text-amber-800 leading-relaxed font-bold italic">
                        Ao salvar, o stock global será a soma de todas as variações criadas.
                      </p>
                   </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <button type="submit" className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 text-sm">
                  Validar e Publicar no Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
