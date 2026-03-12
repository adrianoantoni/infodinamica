
import React, { useState } from 'react';
import { Home, Image as ImageIcon, Globe, Edit3, CheckCircle2, Save, Layout, Palette } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const HomeManagement: React.FC = () => {
  const { siteSettings, updateSiteSettings, invoiceSettings, updateInvoiceSettings } = useApp();
  const [localSite, setLocalSite] = useState(siteSettings);
  const [localInvoice, setLocalInvoice] = useState(invoiceSettings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateSiteSettings(localSite);
    updateInvoiceSettings(localInvoice);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase italic">Gestão da Home</h1>
          <p className="text-gray-500 text-sm">Controle a identidade visual e informações básicas do seu storefront.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {isSaved ? 'Configurações Guardadas' : 'Guardar Alterações'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Identidade do Site */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5 space-y-8">
          <div className="flex items-center gap-3 pb-6 border-b border-gray-50">
             <Layout className="text-indigo-600" />
             <h3 className="font-black text-gray-900 uppercase italic tracking-tight">Identidade Visual</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nome do Site</label>
              <input 
                type="text" 
                value={localSite.siteName}
                onChange={e => setLocalSite({...localSite, siteName: e.target.value})}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">URL da Logomarca</label>
              <div className="flex gap-4 items-center">
                 <input 
                    type="text" 
                    value={localSite.siteLogo}
                    onChange={e => setLocalSite({...localSite, siteLogo: e.target.value})}
                    placeholder="Deixe vazio para usar texto"
                    className="flex-1 px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                 />
                 <div className="h-16 w-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center p-2 shadow-inner">
                    {localSite.siteLogo ? (
                      <img src={localSite.siteLogo} alt="Preview" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <ImageIcon className="text-gray-200" />
                    )}
                 </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Slogan / Breve Descrição</label>
              <textarea 
                rows={3}
                value={localSite.siteDescription}
                onChange={e => setLocalSite({...localSite, siteDescription: e.target.value})}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none"
              />
            </div>
          </div>
        </section>

        {/* Informações de Contacto Globais */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5 space-y-8">
          <div className="flex items-center gap-3 pb-6 border-b border-gray-50">
             <Globe className="text-indigo-600" />
             <h3 className="font-black text-gray-900 uppercase italic tracking-tight">Contactos e Morada</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Telefone Público</label>
              <input 
                type="text" 
                value={localInvoice.phone}
                onChange={e => setLocalInvoice({...localInvoice, phone: e.target.value})}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Endereço Público</label>
              <input 
                type="text" 
                value={localInvoice.address}
                onChange={e => setLocalInvoice({...localInvoice, address: e.target.value})}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none"
              />
            </div>
          </div>

          <div className="mt-8 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
             <h4 className="text-xs font-black text-indigo-700 uppercase mb-2 flex items-center gap-2">
                <Palette size={14} /> Personalização Estilo Imagem
             </h4>
             <p className="text-[11px] text-indigo-600 leading-relaxed italic">
               Estes dados são utilizados automaticamente no topo do site e no rodapé para manter a consistência com a imagem da marca.
             </p>
          </div>
        </section>
      </div>

      <div className="bg-indigo-900 p-12 rounded-[3.5rem] text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
               <h3 className="text-2xl font-black italic uppercase tracking-tight mb-2">Multi-idioma Ativo</h3>
               <p className="text-indigo-200 text-sm leading-relaxed">
                 O sistema agora suporta Português, Inglês, Espanhol e Francês de forma nativa em todas as secções da loja e do carrinho.
               </p>
            </div>
            <div className="flex flex-wrap gap-4">
               {['PT', 'EN', 'ES', 'FR'].map(lang => (
                 <div key={lang} className="w-12 h-12 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center font-black text-xs shadow-lg">
                   {lang}
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};
