
import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  RefreshCw, 
  Link as LinkIcon, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Power,
  Activity,
  ShoppingBag,
  Info,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export const Marketplaces: React.FC = () => {
  const { 
    isMLConnected, 
    toggleMLConnection, 
    products, 
    marketplaceLogs, 
    linkProductToML, 
    syncAllToML,
    fetchMLOrders 
  } = useApp();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSync = async () => {
    setIsSyncing(true);
    await syncAllToML();
    setIsSyncing(false);
  };

  const handleFetchOrders = async () => {
    setIsFetching(true);
    await fetchMLOrders();
    setIsFetching(false);
  };

  const linkedProducts = products.filter(p => p.mercadolivreId);
  const unlinkedProducts = products.filter(p => !p.mercadolivreId);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  }, [products, currentPage]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketplaces Integration</h1>
          <p className="text-gray-500 text-sm mt-1">Connect your store with global marketplaces to expand your reach and automate stock.</p>
        </div>
        <button 
          onClick={toggleMLConnection}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${
            isMLConnected 
              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
          }`}
        >
          <Power className="h-4 w-4" />
          {isMLConnected ? 'Disconnect Mercado Livre' : 'Connect Mercado Livre'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Connection Status Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
                <img src="https://http2.mlstatic.com/frontend-assets/ui-navigation/5.18.9/mercadolibre/logo__small.png" alt="ML" className="h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Mercado Livre</h3>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isMLConnected ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <span className="text-xs font-medium text-gray-500">{isMLConnected ? 'Operational' : 'Disconnected'}</span>
                </div>
              </div>
            </div>

            {isMLConnected ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Linked Products</p>
                    <p className="text-xl font-bold text-gray-900">{linkedProducts.length}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">API Status</p>
                    <p className="text-sm font-bold text-green-600">Active</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync All Stock'}
                  </button>
                  <button 
                    onClick={handleFetchOrders}
                    disabled={isFetching}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white text-indigo-600 border border-indigo-100 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all disabled:opacity-50"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {isFetching ? 'Importing...' : 'Fetch External Orders'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Enable the integration to start synchronizing your products and orders.</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600" /> Recent Activity
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {marketplaceLogs.length === 0 ? (
                <p className="text-xs text-center text-gray-400 py-10 italic">No activity recorded yet.</p>
              ) : (
                marketplaceLogs.map((log) => (
                  <div key={log.id} className="flex gap-3 text-xs border-l-2 pl-3 pb-4 border-gray-100 last:pb-0 relative">
                    <div className={`absolute -left-[5px] top-0 w-2 h-2 rounded-full ${
                      log.type === 'success' ? 'bg-green-500' : log.type === 'error' ? 'bg-red-500' : 'bg-indigo-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-0.5">{log.message}</p>
                      <p className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Product Sync Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900">Products Listing Management</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-100">
                  {linkedProducts.length} Linked
                </span>
                <span className="px-3 py-1 bg-gray-50 text-gray-700 text-[10px] font-bold rounded-full border border-gray-100">
                  {unlinkedProducts.length} Available
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {paginatedProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <img src={product.images[0]} className="h-12 w-12 rounded-lg object-cover border" alt="" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">{product.name}</h4>
                    <p className="text-xs text-gray-500">Internal ID: {product.id} • Stock: {product.stock}</p>
                  </div>
                  
                  <div className="text-right flex items-center gap-3">
                    {product.mercadolivreId ? (
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-green-600 font-bold text-[10px] uppercase">
                          <CheckCircle2 className="h-3 w-3" /> Synchronized
                        </div>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          {product.mercadolivreId} <ExternalLink className="h-2 w-2" />
                        </p>
                      </div>
                    ) : (
                      <button 
                        onClick={() => linkProductToML(product.id)}
                        disabled={!isMLConnected}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                        Link to ML
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 pt-6 border-t border-gray-50 flex justify-center items-center gap-3">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-2 border border-gray-100 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-20 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${
                        currentPage === i + 1 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-white border border-gray-100 text-gray-400 hover:border-indigo-600 hover:text-indigo-600'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-2 border border-gray-100 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-20 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex gap-4">
             <div className="p-3 bg-blue-100 rounded-xl h-fit">
                <Info className="h-6 w-6 text-blue-600" />
             </div>
             <div>
                <h4 className="font-bold text-blue-900 mb-1">Did you know?</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Bidirectional stock synchronization ensures that when a product is sold on Mercado Livre, your internal stock is reduced automatically, preventing over-selling across platforms.
                </p>
                <button className="mt-4 flex items-center gap-1 text-sm font-bold text-blue-800 hover:underline">
                  View full integration documentation <ChevronRight className="h-4 w-4" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
