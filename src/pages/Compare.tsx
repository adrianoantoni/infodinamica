
import React from 'react';
import { useApp } from '@/context/AppContext';
import { X, ShoppingCart, Star, Zap, Trash2 } from 'lucide-react';

export const Compare: React.FC = () => {
  const { compareList, products, toggleCompare, addToCart } = useApp();
  const comparedItems = products.filter(p => compareList.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-12 border-b pb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 uppercase tracking-tighter">Compare Products</h2>
        <p className="text-gray-500">Analyze the differences and choose the best one for you.</p>
      </div>

      {comparedItems.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
           <Zap className="h-20 w-20 text-gray-200 mx-auto mb-6" />
           <h3 className="text-xl font-bold text-gray-900 mb-2">Comparison list is empty</h3>
           <p className="text-gray-500">Add at least two products to compare them here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="p-8 w-64 text-left font-black text-lg uppercase tracking-widest border-r border-white/10">Features</th>
                {comparedItems.map(item => (
                  <th key={item.id} className="p-8 w-80 min-w-[320px] relative text-center">
                    <button 
                      onClick={() => toggleCompare(item.id)}
                      className="absolute top-4 right-4 p-2 text-white/50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <div className="aspect-square w-48 h-48 rounded-2xl overflow-hidden mx-auto bg-white mb-6 border-4 border-white shadow-lg">
                      <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-bold text-white h-12 line-clamp-2 px-4 mb-4">{item.name}</h4>
                    <button 
                      onClick={() => addToCart({ productId: item.id, quantity: 1, price: item.price, name: item.name, image: item.images[0] })}
                      className="inline-flex items-center gap-2 bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-400 transition-all shadow-lg"
                    >
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="group">
                <td className="p-8 bg-gray-50 font-bold text-gray-900 border-r group-hover:bg-indigo-50 transition-colors">Unit Price</td>
                {comparedItems.map(item => (
                  <td key={item.id} className="p-8 text-center text-xl font-black text-indigo-600">${item.price.toFixed(2)}</td>
                ))}
              </tr>
              <tr className="group">
                <td className="p-8 bg-gray-50 font-bold text-gray-900 border-r group-hover:bg-indigo-50 transition-colors">Manufacturer</td>
                {comparedItems.map(item => (
                  <td key={item.id} className="p-8 text-center text-sm font-bold text-gray-700">{item.brand}</td>
                ))}
              </tr>
              <tr className="group">
                <td className="p-8 bg-gray-50 font-bold text-gray-900 border-r group-hover:bg-indigo-50 transition-colors">Category</td>
                {comparedItems.map(item => (
                  <td key={item.id} className="p-8 text-center text-sm font-medium text-gray-600">{item.category}</td>
                ))}
              </tr>
              <tr className="group">
                <td className="p-8 bg-gray-50 font-bold text-gray-900 border-r group-hover:bg-indigo-50 transition-colors">Performance</td>
                {comparedItems.map(item => (
                  <td key={item.id} className="p-8 text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold">
                       <Star className="h-5 w-5 fill-current" />
                       <span className="text-gray-900 text-lg">{item.rating}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase mt-1">Based on {item.reviewsCount} reviews</p>
                  </td>
                ))}
              </tr>
              <tr className="group">
                <td className="p-8 bg-gray-50 font-bold text-gray-900 border-r group-hover:bg-indigo-50 transition-colors">Description</td>
                {comparedItems.map(item => (
                  <td key={item.id} className="p-8 text-center text-xs text-gray-500 leading-relaxed italic max-w-xs">{item.description}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
