
import React, { useMemo, useState } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Package,
  ChevronRight,
  TrendingUp,
  Target,
  Sparkles,
  Loader2,
  BrainCircuit
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

const data = [
  { name: 'Seg', sales: 4000 },
  { name: 'Ter', sales: 3000 },
  { name: 'Qua', sales: 5000 },
  { name: 'Qui', sales: 2780 },
  { name: 'Sex', sales: 1890 },
  { name: 'Sab', sales: 4390 },
  { name: 'Dom', sales: 3490 },
];

const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe', '#fed700', '#242424', '#f87171', '#34d399'];

export const Dashboard: React.FC = () => {
  const { orders, products, t, formatPrice, addToast } = useApp();
  const d = t.admin.dashboard;
  
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const totalRevenue = orders.reduce((acc, o) => acc + (o.status !== 'Cancelled' ? o.total : 0), 0);

  // AI Insights State
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Cálculo de Performance por Categoria
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    orders.filter(o => o.status !== 'Cancelled').forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const cat = product?.category || 'Outros';
        stats[cat] = (stats[cat] || 0) + (item.price * item.quantity);
      });
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [orders, products]);

  const generateAIInsights = async () => {
    setIsGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise o seguinte estado da loja: Total Revenue: ${totalRevenue}, Produtos com Stock Baixo: ${lowStockProducts.length}. 
      Categorias Performance: ${JSON.stringify(categoryStats)}. 
      Gere um insight estratégico curto (máximo 3 frases) sobre o que o gestor deve fazer agora para maximizar lucro ou evitar rupturas. Use tom executivo.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      if (response.text) {
        setAiInsight(response.text);
      }
    } catch (error) {
      addToast('Não foi possível gerar insights de IA agora.', 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase italic">Centro de Comando</h1>
          <p className="text-gray-500 text-sm font-medium">Análise em tempo real do desempenho da sua plataforma.</p>
        </div>
        <button 
          onClick={generateAIInsights}
          disabled={isGeneratingAI}
          className="bg-gray-900 text-white px-6 py-3 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-50"
        >
          {isGeneratingAI ? <Loader2 className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4 text-[#fed700]" />}
          Nexus AI Insights
        </button>
      </div>

      {aiInsight && (
        <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in slide-in-from-top-4 duration-500">
           <div className="absolute -right-10 -bottom-10 opacity-10"><BrainCircuit size={200}/></div>
           <div className="relative z-10 flex items-start gap-6">
              <div className="p-4 bg-white/20 rounded-2xl"><Sparkles className="text-[#fed700]"/></div>
              <div className="flex-1">
                 <h4 className="font-black uppercase italic text-xs tracking-widest mb-2 opacity-80">Recomendação Estratégica AI</h4>
                 <p className="text-lg font-bold leading-relaxed">{aiInsight}</p>
                 <button onClick={() => setAiInsight(null)} className="mt-4 text-[10px] font-black uppercase tracking-widest border-b border-white/40 pb-1 hover:text-[#fed700] transition-colors">Dispensar Insight</button>
              </div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-indigo-500/5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{d.revenue}</p>
          <p className="text-3xl font-black text-gray-900 tracking-tighter">{formatPrice(totalRevenue)}</p>
          <span className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-2 uppercase tracking-tighter">
            <ArrowUpRight className="h-3 w-3" /> +12.4% vs mês anterior
          </span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-indigo-500/5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{d.orders_count}</p>
          <p className="text-3xl font-black text-gray-900 tracking-tighter">{orders.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-indigo-500/5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{d.active_products}</p>
          <p className="text-3xl font-black text-gray-900 tracking-tighter">{products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border-l-8 border-l-red-500 border border-gray-100 shadow-xl shadow-indigo-500/5">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{d.critical_stock}</p>
          <p className="text-3xl font-black text-red-600 tracking-tighter">{lowStockProducts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5">
          <h3 className="font-black text-gray-900 mb-8 uppercase tracking-tighter italic flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-600" /> Tendência de Facturação
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fill="#4f46e510" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance por Categoria */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5 flex flex-col">
          <h3 className="font-black text-gray-900 mb-4 uppercase tracking-tighter italic flex items-center gap-2">
            <Target size={18} className="text-indigo-600" /> Vendas por Categoria
          </h3>
          <div className="flex-1 min-h-[300px]">
            {categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => formatPrice(val)} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 italic text-xs">
                Sem dados de vendas suficientes.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5">
          <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-tighter italic">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> {d.rupture_risk}
          </h3>
          <div className="space-y-3">
            {lowStockProducts.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                <div>
                  <p className="text-xs font-black text-gray-900 uppercase truncate max-w-[120px]">{p.name}</p>
                  <p className="text-[10px] text-red-600 font-bold">STOCK: {p.stock} / MIN: {p.minStock}</p>
                </div>
                <Package className="h-5 w-5 text-red-400" />
              </div>
            ))}
            {lowStockProducts.length === 0 && <p className="text-xs text-gray-400 italic">Todos os itens com stock saudável.</p>}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-500/5 lg:col-span-2">
          <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-tighter italic">
            <Clock className="h-4 w-4 text-indigo-500" /> {d.pending_orders}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingOrders.slice(0, 4).map(o => (
              <div key={o.id} className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100 hover:bg-white transition-colors cursor-pointer border-dashed">
                <div>
                  <p className="text-xs font-black text-gray-900 uppercase truncate max-w-[150px]">{o.customerName}</p>
                  <p className="text-[10px] text-indigo-600 font-bold">{formatPrice(o.total)} • {o.items.length} items</p>
                </div>
                <ChevronRight className="h-5 w-5 text-indigo-400" />
              </div>
            ))}
            {pendingOrders.length === 0 && <p className="col-span-2 text-xs text-gray-400 italic">Nenhum pedido aguardando aprovação.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
