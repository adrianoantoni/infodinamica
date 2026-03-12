
import React, { useState } from 'react';
import { Tag, Ticket, Image as ImageIcon, Plus, Trash2, Calendar, Percent } from 'lucide-react';

export const Marketing: React.FC = () => {
  const [coupons] = useState([
    { id: '1', code: 'WELCOME10', type: 'Percentage', value: '10%', usage: '45/100', status: 'Active' },
    { id: '2', code: 'BLACKFRIDAY', type: 'Fixed', value: '$50.00', usage: '12/50', status: 'Scheduled' },
  ]);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketing & Promotions</h1>
        <p className="text-gray-500 text-sm">Create discount rules and manage store banners.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coupons Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-indigo-600" /> Discount Coupons
            </h3>
            <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
              <Plus className="h-3 w-3" /> New Coupon
            </button>
          </div>
          <div className="p-6 space-y-4">
            {coupons.map(coupon => (
              <div key={coupon.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Percent className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{coupon.code}</p>
                    <p className="text-xs text-gray-500">{coupon.type} • {coupon.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${coupon.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {coupon.status}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">Used: {coupon.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Banners Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-indigo-600" /> Active Banners
            </h3>
            <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
              <Plus className="h-3 w-3" /> Upload Banner
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="aspect-[21/9] bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
               <ImageIcon className="h-8 w-8 mb-2" />
               <p className="text-xs">Main Hero Banner (Desktop)</p>
               <p className="text-[10px]">1920x600px</p>
            </div>
            <div className="aspect-[21/9] bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
               <ImageIcon className="h-8 w-8 mb-2" />
               <p className="text-xs">Seasonal Promotion (Mobile)</p>
               <p className="text-[10px]">800x400px</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
