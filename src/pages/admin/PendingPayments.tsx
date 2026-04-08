import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { apiService } from '@/services/api';
import { PaymentProof, OrderStatus } from '@/types';
import { 
  CheckCircle2, XCircle, Clock, Eye, 
  ExternalLink, ArrowUpRight, Search, 
  Filter, Wallet, CreditCard, User, AlertCircle
} from 'lucide-react';

export const PendingPayments: React.FC = () => {
  const { formatPrice, addToast } = useApp();
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPendingPayments();
      setPayments(data);
    } catch (error) {
      addToast('Erro ao carregar pagamentos pendentes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedPayment) return;
    
    setActionLoading(true);
    try {
      await apiService.verifyPayment(selectedPayment.id, status, adminNotes);
      addToast(status === 'APPROVED' ? 'Pagamento aprovado!' : 'Pagamento rejeitado.');
      setSelectedPayment(null);
      setAdminNotes('');
      fetchPayments();
    } catch (error) {
      addToast('Erro ao processar verificação', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <CreditCard className="text-indigo-600" /> Validação de Pagamentos
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Revise e aprove os comprovativos enviados pelos clientes</p>
        </div>
        <div className="bg-amber-50 text-amber-700 px-6 py-3 rounded-2xl border border-amber-100 flex items-center gap-3 shadow-sm">
          <Clock size={16} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest">{payments.length} Pendentes para Revisão</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payments List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="p-20 text-center bg-white rounded-[3rem] border border-gray-100 italic text-gray-400">
              A carregar pagamentos...
            </div>
          ) : payments.length === 0 ? (
            <div className="p-20 text-center bg-white rounded-[3rem] border border-gray-100 space-y-4">
              <CheckCircle2 size={48} className="mx-auto text-green-100" />
              <p className="text-gray-400 font-medium italic">Tudo em dia! Não há pagamentos pendentes.</p>
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-indigo-500/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest italic">
                      <th className="p-6">Data Envio</th>
                      <th className="p-6">Cliente</th>
                      <th className="p-6">Referência</th>
                      <th className="p-6">Montante</th>
                      <th className="p-6 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.map((p) => (
                      <tr 
                        key={p.id} 
                        className={`hover:bg-indigo-50/10 cursor-pointer transition-colors ${selectedPayment?.id === p.id ? 'bg-indigo-50/30' : ''}`}
                        onClick={() => setSelectedPayment(p)}
                      >
                        <td className="p-6">
                          <p className="text-xs font-bold text-gray-900">{new Date(p.createdAt).toLocaleDateString()}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-[10px] font-black">
                                {p.customer.name.charAt(0)}
                              </div>
                              <p className="text-xs font-black uppercase tracking-tight text-gray-900">{p.customer.name}</p>
                           </div>
                        </td>
                        <td className="p-6">
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                            {p.sale?.invoiceNumber || (p.saleId ? `ENC #${p.saleId.slice(-4)}` : 'Nexus Wallet')}
                          </span>
                        </td>
                        <td className="p-6">
                          <p className="text-sm font-black text-indigo-600 italic">{formatPrice(p.amount)}</p>
                        </td>
                        <td className="p-6 text-right">
                          <button className="p-2 hover:bg-white rounded-full transition-all text-indigo-600 shadow-sm border border-transparent hover:border-gray-100">
                             <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Verification Detail */}
        <div className="lg:col-span-1">
          {selectedPayment ? (
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-indigo-500/10 overflow-hidden sticky top-8 animate-in slide-in-from-right-4 duration-300">
               <div className="bg-indigo-600 p-8 text-white">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter italic">Detalhe da Prova</h3>
                  <p className="text-[10px] text-indigo-200 font-bold uppercase mt-1 tracking-widest">Revisão do Comprovativo Bancário</p>
               </div>
               
               <div className="p-8 space-y-8">
                  {/* Proof Image */}
                  <div className="relative group cursor-zoom-in h-48 border border-gray-100 rounded-3xl overflow-hidden bg-gray-50 flex items-center justify-center shadow-inner">
                     {selectedPayment.receiptImage.toLowerCase().endsWith('.pdf') ? (
                       <div className="text-center">
                         <div className="w-16 h-16 bg-white shadow-sm rounded-2xl mx-auto flex items-center justify-center text-red-500 mb-3 border border-red-50">
                           <ExternalLink size={24} />
                         </div>
                         <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Comprovativo em PDF</p>
                         <a 
                           href={selectedPayment.receiptImage} 
                           target="_blank" 
                           rel="noreferrer"
                           className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                         >
                           Abrir Documento Seguro
                         </a>
                       </div>
                     ) : (
                       <>
                         <img 
                            src={selectedPayment.receiptImage} 
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" 
                            alt="Comprovativo"
                         />
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                            <a 
                              href={selectedPayment.receiptImage} 
                              target="_blank" 
                              rel="noreferrer"
                              className="bg-white text-gray-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:scale-105 transition-transform"
                            >
                              Ver Original <ExternalLink size={14}/>
                            </a>
                         </div>
                       </>
                     )}
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Valor Declarado</span>
                        <span className="text-lg font-black text-indigo-600 italic tracking-tighter">{formatPrice(selectedPayment.amount)}</span>
                     </div>
                     <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tipo de Operação</span>
                        <span className="text-[10px] font-black text-gray-900 uppercase">
                           {selectedPayment.saleId ? 'Pagamento de Pedido' : 'Recarga de Carteira'}
                        </span>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Notas Administrativas (Opcional)</label>
                     <textarea 
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Ex: Valor recebido no extrato do dia 03..."
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 ring-indigo-500 transition-all shadow-inner"
                        rows={3}
                     />
                  </div>

                  <div className="flex gap-4">
                     <button 
                        onClick={() => handleVerify('REJECTED')}
                        disabled={actionLoading}
                        className="flex-1 px-4 py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 border border-red-100 transition-all flex items-center justify-center gap-2"
                     >
                        <XCircle size={16}/> Rejeitar
                     </button>
                     <button 
                        onClick={() => handleVerify('APPROVED')}
                        disabled={actionLoading}
                        className="flex-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                     >
                        <CheckCircle2 size={16}/> {selectedPayment.saleId ? 'Aprovar Encomenda' : 'Creditar Carteira'}
                     </button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-[3rem] border border-gray-100 border-dashed space-y-6">
               <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200">
                  <CreditCard size={32} />
               </div>
               <p className="text-gray-400 text-sm font-medium italic max-w-[200px]">Selecione um pagamento da lista para analisar o comprovativo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
