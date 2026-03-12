
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { Download, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight, ChevronDown, Table as TableIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const salesDataMock = [
  { month: 'Jan', sales: 45000, orders: 120, year: 2024 },
  { month: 'Feb', sales: 52000, orders: 145, year: 2024 },
  { month: 'Mar', sales: 48000, orders: 132, year: 2024 },
  { month: 'Apr', sales: 61000, orders: 178, year: 2024 },
  { month: 'May', sales: 55000, orders: 155, year: 2024 },
  { month: 'Jun', sales: 67000, orders: 190, year: 2024 },
  { month: 'Jul', sales: 72000, orders: 210, year: 2024 },
  { month: 'Aug', sales: 69000, orders: 205, year: 2024 },
  { month: 'Sep', sales: 75000, orders: 230, year: 2024 },
  { month: 'Oct', sales: 82000, orders: 245, year: 2024 },
  { month: 'Nov', sales: 95000, orders: 280, year: 2024 },
  { month: 'Dec', sales: 110000, orders: 320, year: 2024 },
  { month: 'Jan', sales: 38000, orders: 100, year: 2023 },
  { month: 'Feb', sales: 41000, orders: 110, year: 2023 },
  { month: 'Mar', sales: 43000, orders: 115, year: 2023 },
];

const categoryData = [
  { name: 'Electronics', value: 45 },
  { name: 'Fashion', value: 25 },
  { name: 'Home', value: 20 },
  { name: 'Others', value: 10 },
];

const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff'];

export const Reports: React.FC = () => {
  const { formatPrice } = useApp();
  const [selectedYear, setSelectedYear] = useState(2024);
  
  const filteredSalesData = useMemo(() => {
    return salesDataMock.filter(d => d.year === selectedYear);
  }, [selectedYear]);

  const totalAnnualRevenue = useMemo(() => {
    return filteredSalesData.reduce((acc, d) => acc + d.sales, 0);
  }, [filteredSalesData]);

  const totalAnnualOrders = useMemo(() => {
    return filteredSalesData.reduce((acc, d) => acc + d.orders, 0);
  }, [filteredSalesData]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-500 text-sm">Comprehensive performance metrics and sales forecasting.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-black text-gray-900 shadow-sm">
              <Calendar className="h-4 w-4 text-indigo-600" /> {selectedYear} <ChevronDown size={14} />
            </button>
            <div className="absolute top-full right-0 mt-2 bg-white border rounded-xl shadow-xl hidden group-hover:block z-50 overflow-hidden min-w-[120px]">
              {[2024, 2023, 2022].map(year => (
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
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100">
            <Download className="h-4 w-4" /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total {selectedYear} Revenue</p>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(totalAnnualRevenue)}</p>
          <span className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-2">
            <ArrowUpRight className="h-3 w-3" /> Annual Performance
          </span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{totalAnnualOrders}</p>
          <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3" /> Conversion Tracking
          </span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Avg Ticket ({selectedYear})</p>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(totalAnnualOrders > 0 ? totalAnnualRevenue / totalAnnualOrders : 0)}</p>
          <span className="text-[10px] text-gray-400 font-bold mt-2">Per Successful Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center justify-between">
            Monthly Sales Trend
            <span className="text-[10px] text-gray-400 font-black tracking-widest uppercase">Values in Currency</span>
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredSalesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => formatPrice(value)}
                />
                <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={4} dot={{ r: 6, fill: '#4f46e5', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
             <h3 className="font-bold text-gray-900 flex items-center gap-2">
               <TableIcon className="h-4 w-4 text-indigo-600" /> Monthly Sales Breakdown
             </h3>
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedYear}</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-80 custom-scrollbar">
             <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 sticky top-0">
                   <tr>
                      <th className="px-6 py-3 font-bold uppercase tracking-widest text-[10px]">Month</th>
                      <th className="px-6 py-3 font-bold uppercase tracking-widest text-[10px]">Orders</th>
                      <th className="px-6 py-3 font-bold uppercase tracking-widest text-[10px] text-right">Revenue</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {filteredSalesData.map(d => (
                     <tr key={d.month} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-black text-gray-700">{d.month}</td>
                        <td className="px-6 py-4 font-bold text-indigo-600">{d.orders}</td>
                        <td className="px-6 py-4 font-black text-gray-900 text-right">{formatPrice(d.sales)}</td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
};
