import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';

import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface TaxRate {
  id: string;
  year: number;
  percentage: number;
  isActive: boolean;
}

export const Taxes: React.FC = () => {
  const { userRole, addToast } = useApp();
  const [taxes, setTaxes] = useState<TaxRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxRate | null>(null);

  // Form
  const [year, setYear] = useState(new Date().getFullYear());
  const [percentage, setPercentage] = useState(14);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchTaxes();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('nexus_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  // @ts-ignore
  const API_URL = import.meta.env.VITE_API_URL || '/api';

  const fetchTaxes = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/taxes`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Falha ao carregar taxas');
      const data = await res.json();
      setTaxes(data);
    } catch (error) {
      addToast('Erro ao carregar taxas de IVA', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (tax?: TaxRate) => {
    if (tax) {
      setEditingTax(tax);
      setYear(tax.year);
      setPercentage(tax.percentage);
      setIsActive(tax.isActive);
    } else {
      setEditingTax(null);
      setYear(new Date().getFullYear());
      setPercentage(14);
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTax) {
        const res = await fetch(`${API_URL}/taxes/${editingTax.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ percentage, isActive })
        });
        if (!res.ok) throw new Error('Falha ao atualizar taxa');
        addToast('Taxa atualizada com sucesso', 'success');
      } else {
        const res = await fetch(`${API_URL}/taxes`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ year, percentage, isActive })
        });
        if (!res.ok) throw new Error('Falha ao criar taxa');
        addToast('Taxa criada com sucesso', 'success');
      }
      setIsModalOpen(false);
      fetchTaxes();
    } catch (error) {
      addToast('Erro ao gravar taxa', 'error');
    }
  };

  if (!['admin'].includes(userRole?.toLowerCase() || '')) {
    return <div className="p-8 text-center text-gray-500">Acesso negado. Apenas administradores podem configurar o IVA.</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Taxas de IVA</h1>
          <p className="text-gray-500 mt-1">Configure as percentagens de IVA anuais para efeitos de faturação e SAF-T.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#242424] hover:bg-black text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-black/10 flex items-center gap-2"
        >
          <Plus size={16} />
          Nova Taxa
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 font-black tracking-widest">Ano Fiscal</th>
                  <th className="px-6 py-4 font-black tracking-widest">Percentagem (%)</th>
                  <th className="px-6 py-4 font-black tracking-widest">Estado</th>
                  <th className="px-6 py-4 font-black tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {taxes.map((tax) => (
                  <tr key={tax.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{tax.year}</td>
                    <td className="px-6 py-4 text-gray-900">{tax.percentage}%</td>
                    <td className="px-6 py-4">
                      {tax.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700">
                          <CheckCircle2 size={12} />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500">
                          <XCircle size={12} />
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenModal(tax)} className="text-blue-600 hover:text-blue-800 p-2">
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {taxes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      Nenhuma taxa configurada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">
              {editingTax ? 'Editar Taxa' : 'Nova Taxa'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ano Fiscal</label>
                <input 
                  type="number" 
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  disabled={!!editingTax}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Percentagem de IVA (%)</label>
                <input 
                  type="number"
                  step="0.1" 
                  value={percentage}
                  onChange={(e) => setPercentage(parseFloat(e.target.value))}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 accent-yellow-400 rounded cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">Taxa em Vigor</label>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="bg-[#242424] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10"
                >
                  Gravar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
