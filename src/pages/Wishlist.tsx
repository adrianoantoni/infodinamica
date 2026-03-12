
import React from 'react';
import { useApp } from '@/context/AppContext';
import { Trash2, ShoppingCart, HeartOff, CheckCircle, XCircle } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const { wishlist, products, addToCart, toggleWishlist } = useApp();
  const savedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-12 border-b pb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 uppercase tracking-tighter">My Wishlist</h2>
        <p className="text-gray-500">Manage your favorite products and add them to your cart anytime.</p>
      </div>

      {savedProducts.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <HeartOff className="h-20 w-20 text-gray-200 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Explore our catalog and click the heart icon to save products here.</p>
          <button className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">Start Shopping</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider">Remove</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider">Images</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider">Product Name</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-center">Unit Price</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-center">Stock Status</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-right">Add to Cart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {savedProducts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => toggleWishlist(p.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100">
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <h4 className="font-bold text-gray-900">{p.name}</h4>
                    <p className="text-xs text-indigo-600 font-medium">{p.brand}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-lg font-black text-gray-900">${p.price.toFixed(2)}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {p.stock > 0 ? (
                      <span className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase">
                        <CheckCircle className="h-3 w-3" /> In Stock
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase">
                        <XCircle className="h-3 w-3" /> Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      disabled={p.stock === 0}
                      onClick={() => addToCart({ productId: p.id, quantity: 1, price: p.price, name: p.name, image: p.images[0] })}
                      className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 ml-auto shadow-lg shadow-indigo-100 disabled:bg-gray-200"
                    >
                      <ShoppingCart className="h-4 w-4" /> <span>Add</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
