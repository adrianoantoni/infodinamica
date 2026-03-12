
import React, { useState } from 'react';
import { Building, Landmark, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const Settings: React.FC = () => {
  const { invoiceSettings, updateInvoiceSettings } = useApp();
  const [localSettings, setLocalSettings] = useState(invoiceSettings);

  const handleSave = () => {
    updateInvoiceSettings(localSettings);
    alert('Configurações autoritativas guardadas. Todas as faturas agora seguirão esta regra.');
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Configurações Mestres</h1>
          <p className="text-gray-500 text-sm font-medium">Controlo centralizado de faturação e identidade fiscal.</p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => setLocalSettings(invoiceSettings)} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest">Descartar</button>
           <button onClick={handleSave} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Guardar Regras</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Company Profile */}
        <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5 p-8">
          <h3 className="font-black text-gray-900 mb-8 flex items-center gap-3 uppercase italic tracking-tight">
            <Building className="text-indigo-600" /> Perfil da Empresa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nome Legal da Entidade</label>
              <input type="text" value={localSettings.companyName} onChange={e => setLocalSettings({...localSettings, companyName: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">NIF (Número de Identificação Fiscal)</label>
              <input type="text" value={localSettings.nif} onChange={e => setLocalSettings({...localSettings, nif: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none" />
            </div>
          </div>
        </section>

        {/* Bank Data */}
        <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5 p-8">
          <div className="flex items-center justify-between mb-8">
             <h3 className="font-black text-gray-900 flex items-center gap-3 uppercase italic tracking-tight">
               <Landmark className="text-indigo-600" /> Coordenadas Bancárias
             </h3>
             <AlertCircle size={18} className="text-amber-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Instituição Bancária</label>
              <input type="text" value={localSettings.bankName} onChange={e => setLocalSettings({...localSettings, bankName: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">IBAN</label>
              <input type="text" value={localSettings.iban} onChange={e => setLocalSettings({...localSettings, iban: e.target.value})} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
