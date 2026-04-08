import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Search, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  User as UserIcon,
  Clock,
  ExternalLink,
  Filter
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { apiService } from '@/services/api';

export const AuditLog: React.FC = () => {
  const { addToast } = useApp();
  const [logs, setLogs] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 15 };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const [logsData, usersData] = await Promise.all([
        apiService.getAuditLogs(params),
        apiService.getOnlineUsers()
      ]);

      setLogs(logsData.logs);
      setTotalPages(logsData.totalPages);
      setOnlineUsers(usersData);
    } catch (error) {
      addToast('Erro ao carregar dados de auditoria', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Poll for online users every 30 seconds
    const interval = setInterval(async () => {
      try {
        const users = await apiService.getOnlineUsers();
        setOnlineUsers(users);
      } catch (e) {}
    }, 30000);
    return () => clearInterval(interval);
  }, [currentPage, startDate, endDate]);

  const getActionColor = (action: string) => {
    if (action.includes('Criação')) return 'text-green-600 bg-green-50';
    if (action.includes('Remoção')) return 'text-red-600 bg-red-50';
    if (action.includes('Atualização')) return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
            <ShieldCheck className="text-indigo-600" /> Auditoria do Sistema
          </h1>
          <p className="text-gray-500 text-sm font-medium">Monitorização de operações e sessões administrativas.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="flex -space-x-2">
              {onlineUsers.slice(0, 3).map((u, i) => (
                <div key={u.id} className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-600 uppercase">
                  {u.name.charAt(0)}
                </div>
              ))}
              {onlineUsers.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                  +{onlineUsers.length - 3}
                </div>
              )}
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Online Agora</p>
              <p className="text-sm font-black text-green-600">{onlineUsers.length} Utilizadores</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filtros e Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl space-y-6">
            <div className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-widest pb-2 border-b border-gray-50">
              <Filter size={14} className="text-indigo-600" /> Filtros Avançados
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data de Início</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data de Fim</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={() => { setStartDate(''); setEndDate(''); setCurrentPage(1); }}
                className="w-full py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
              >
                Limpar Período
              </button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-[2rem] p-6 text-white shadow-2xl overflow-hidden relative group">
            <Activity className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 group-hover:rotate-12 transition-transform duration-700" />
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Sessões Ativas</p>
            <div className="space-y-4 relative z-10">
              {onlineUsers.map(user => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">{user.name}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{user.role}</p>
                  </div>
                </div>
              ))}
              {onlineUsers.length === 0 && (
                <p className="text-xs text-gray-500 font-medium italic">Nenhuma sessão ativa...</p>
              )}
            </div>
          </div>
        </div>

        {/* Histórico de Logs */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl flex flex-col min-h-[600px] overflow-hidden">
          <div className="flex-1 overflow-auto relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            )}
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilizador</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Ação</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Detalhes</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-gray-400 font-medium italic">Nenhum evento registado para este período.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <UserIcon size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{log.user?.name || 'Sistema'}</p>
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{log.user?.role || 'AUTO'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs text-gray-600 font-medium max-w-xs truncate" title={log.description}>
                          {log.description}
                        </p>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex flex-col items-end">
                          <p className="text-xs font-black text-gray-900 tabular-nums">
                            {new Date(log.createdAt).toLocaleDateString('pt-PT')}
                          </p>
                          <p className="text-[10px] text-gray-400 font-black tabular-nums">
                            {new Date(log.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="p-8 border-t border-gray-50 bg-gray-50/20 flex items-center justify-between">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Página <span className="text-indigo-600">{currentPage}</span> de {totalPages}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
