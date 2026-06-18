import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Download, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight, ChevronDown, Table as TableIcon, Box, ShoppingCart, DollarSign } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { apiService } from '@/services/api';

const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff', '#a5b4fc', '#6366f1'];

export const Reports: React.FC = () => {
  const { formatPrice, addToast } = useApp();
  const [filterType, setFilterType] = useState<'year' | 'custom'>('year');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  
  const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0, avgTicket: 0 });
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [selectedYear, filterType, startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterType === 'year') {
        params.year = selectedYear;
      } else {
        if (!startDate || !endDate) return;
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const data = await apiService.getReports(params);
      setSummary(data.summary);
      setSalesTrend(data.salesTrend);
      setCategoryData(data.categoryData);
      setTopProducts(data.topProducts);
    } catch (error) {
      addToast('Erro ao carregar os relatórios analíticos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportSAFT = async () => {
    try {
      addToast('A gerar ficheiro SAF-T. Aguarde...', 'info');
      const token = localStorage.getItem('nexus_token');
      // @ts-ignore
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${API_URL}/saft/export`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) throw new Error('Falha ao exportar SAF-T');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SAFT_AO_${new Date().getFullYear()}_${(new Date().getMonth()+1).toString().padStart(2, '0')}.xml`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      addToast('Ficheiro SAF-T exportado com sucesso.', 'success');
    } catch (error) {
      addToast('Erro ao exportar ficheiro SAF-T', 'error');
    }
  };

  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Analítico</h1>
          <p className="text-gray-500 text-sm">Métricas de performance financeiras e vendas do sistema.</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex bg-gray-100 p-1 rounded-xl">
             <button 
                onClick={() => setFilterType('year')}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterType === 'year' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
             >
                Anual
             </button>
             <button 
                onClick={() => setFilterType('custom')}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterType === 'custom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
             >
                Personalizado
             </button>
          </div>

          {filterType === 'year' ? (
            <div className="relative group">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-black text-gray-900 shadow-sm">
                <Calendar className="h-4 w-4 text-indigo-600" /> {selectedYear} <ChevronDown size={14} />
              </button>
              <div className="absolute top-full right-0 mt-2 bg-white border rounded-xl shadow-xl hidden group-hover:block z-50 overflow-hidden min-w-[120px]">
                {availableYears.map(year => (
                  <button 
                    key={year} 
                    onClick={() => setSelectedYear(year)}
                    className={`w-full text-left px-6 py-3 text-sm font-bold hover:bg-gray-50 ${selectedYear === year ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'}`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none"
              />
              <span className="text-gray-400 font-bold">-</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none"
              />
            </div>
          )}
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all">
            <Download className="h-4 w-4" /> {filterType === 'year' ? 'Exportar Ano' : 'Exportar Período'}
          </button>
          
          <button onClick={handleExportSAFT} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">
            <Download className="h-4 w-4 text-indigo-300" /> SAF-T (AO)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center p-8 text-gray-400 font-bold animate-pulse">A calcular estatísticas agregadas...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-2"><DollarSign size={14} className="text-green-500" /> Receita Total ({selectedYear})</p>
              <p className="text-3xl font-black text-gray-900">{formatPrice(summary.totalRevenue)}</p>
              <span className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-3">
                <ArrowUpRight className="h-3 w-3" /> Baseado no Histórico Concluído
              </span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-2"><ShoppingCart size={14} className="text-indigo-500" /> Vendas Efetivas</p>
              <p className="text-3xl font-black text-gray-900">{summary.totalOrders}</p>
              <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 mt-3">
                <TrendingUp className="h-3 w-3" /> Volume Anual
              </span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-2"><Box size={14} className="text-orange-500" /> Ticket Médio ({selectedYear})</p>
              <p className="text-3xl font-black text-gray-900">{formatPrice(summary.avgTicket)}</p>
              <span className="text-[10px] text-gray-400 font-bold mt-3 block">Média de gasto por carrinho</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Line Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center justify-between">
                Evolução Financeira
                <span className="text-[10px] text-gray-400 font-black tracking-widest uppercase">Valores Líquidos</span>
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9ca3af', fontWeight: 'bold'}} tickFormatter={(k) => (k/1000).toFixed(0) + 'k'}/>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => formatPrice(value)}
                    />
                    <Line type="basis" dataKey="sales" name="Receita" stroke="#4f46e5" strokeWidth={4} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Pie Chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <h3 className="font-bold text-gray-900 mb-6">Misto de Categorias Vendidas</h3>
              <div className="flex-1 min-h-[300px]">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '10px', border: 'none' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm font-bold text-gray-400">Sem dados para processar o gráfico.</div>
                )}
              </div>
            </div>

            {/* Top Products Lists */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col col-span-1 lg:col-span-2">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <TableIcon className="h-4 w-4 text-indigo-600" /> TOP-10 Produtos Mais Vendidos
                </h3>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedYear}</span>
              </div>
              <div className="flex-1 overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-500 sticky top-0">
                      <tr>
                          <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px]">Produto (Modelo)</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Unid. Vendidas</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Receita Gerada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {topProducts.length > 0 ? topProducts.map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-3">
                              <span className="w-6 text-center text-gray-400 font-black">#{i + 1}</span> {p.name}
                            </td>
                            <td className="px-6 py-4 font-black text-indigo-600 text-right">{p.quantity} <span className="text-[10px] font-normal text-gray-400">unid.</span></td>
                            <td className="px-6 py-4 font-black text-green-600 text-right">{formatPrice(p.revenue)}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-bold">Sem histórico compatível com os filtros fornecidos.</td>
                        </tr>
                      )}
                    </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
