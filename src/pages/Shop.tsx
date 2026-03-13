
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ShoppingCart, Heart, Star, Filter, PackageX, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { CategoryNavigation } from '@/components/layout/CategoryNavigation';
import { ENHANCED_CATEGORIES } from '@/constants';

interface ShopProps {
  onProductClick: (id: string) => void;
  onNavigate?: (path: string) => void;
  initialCategory?: string;
  isDealsOnly?: boolean;
  searchTerm?: string;
}

export const Shop: React.FC<ShopProps> = ({ onProductClick, onNavigate, initialCategory, isDealsOnly, searchTerm = '' }) => {
  const { products, cart, addToCart, formatPrice, t } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState(t.shop.recent);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setSelectedCategory(initialCategory || null);
    setSelectedSubCategory(null);
    setSelectedItem(null);
    setCurrentPage(1);
  }, [initialCategory]);

  const getTranslatedCategoryName = (catId: string) => {
    return t.categories[catId] || catId;
  };

  const handleAddToCartWithValidation = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || ''
    });
    // addToast is handled by addToCart internally, no need to duplicate
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (isDealsOnly) result = result.filter(p => p.featured);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }
    if (selectedCategory) {
      const categoryTree = ENHANCED_CATEGORIES.find(c => c.name === selectedCategory || c.slug === selectedCategory || t.categories[c.slug] === selectedCategory || c.id === selectedCategory);
      if (categoryTree) {
        result = result.filter(p => 
          p.category === categoryTree.slug || 
          p.category === categoryTree.id || 
          p.category === categoryTree.name ||
          t.categories[p.category] === selectedCategory ||
          getTranslatedCategoryName(p.category) === selectedCategory
        );
      } else {
        result = result.filter(p => p.category === selectedCategory);
      }
    }
    if (selectedSubCategory) result = result.filter(p => p.subCategory === selectedSubCategory);
    if (selectedItem) result = result.filter(p => p.specificItem === selectedItem);

    if (sortBy === t.shop.price_asc) result.sort((a, b) => a.price - b.price);
    else if (sortBy === t.shop.price_desc) result.sort((a, b) => b.price - a.price);
    else if (sortBy === t.shop.best_rated) result.sort((a, b) => b.rating - a.rating);
    else result.sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime());

    return result;
  }, [products, selectedCategory, selectedSubCategory, selectedItem, isDealsOnly, searchTerm, sortBy, t]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const activeFilterName = selectedItem || selectedSubCategory || (selectedCategory ? getTranslatedCategoryName(selectedCategory) : null) || t.shop.all_products;

  return (
    <div className="max-w-[1900px] mx-auto px-0 lg:px-4 py-2 md:py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-auto flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            <CategoryNavigation 
              onSelect={(cat, sub, item) => { 
                setSelectedCategory(cat); 
                setSelectedSubCategory(sub || null);
                setSelectedItem(item || null);
                setCurrentPage(1); 
              }} 
              onNavigate={(p) => onNavigate ? onNavigate(p) : console.log(p)} 
            />
          </div>
        </aside>

        {/* Mobile Category Drawer */}
        {isCategoryDrawerOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCategoryDrawerOpen(false)}></div>
            <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-xs bg-white animate-in slide-in-from-left duration-300 flex flex-col">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#fed700]">
                <h2 className="text-lg font-black text-gray-900 tracking-tight uppercase">{t.header.nav.categories}</h2>
                <button onClick={() => setIsCategoryDrawerOpen(false)} className="p-2 bg-white/60 rounded-full active:bg-white transition-colors">
                  <X size={20}/>
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <CategoryNavigation 
                  isMobile
                  onSelect={(cat, sub, item) => { 
                    setSelectedCategory(cat); 
                    setSelectedSubCategory(sub || null);
                    setSelectedItem(item || null);
                    setCurrentPage(1); 
                    if (item || (!sub && cat)) setIsCategoryDrawerOpen(false);
                  }} 
                  onNavigate={(p) => { onNavigate ? onNavigate(p) : console.log(p); setIsCategoryDrawerOpen(false); }} 
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 px-2 sm:px-4 lg:px-0">
          {/* Mobile filter header bar */}
          <div className="lg:hidden flex items-center gap-2 mb-3">
            <button 
              onClick={() => setIsCategoryDrawerOpen(true)}
              className="flex items-center gap-2 bg-[#fed700] py-2.5 px-4 rounded-xl shadow-sm text-xs font-black text-gray-900 uppercase tracking-wider active:scale-95 transition-transform"
            >
              <Filter size={15} className="text-gray-900" />
              {t.header.nav.categories}
            </button>
            {selectedCategory && (
              <span className="text-xs bg-indigo-600 text-white px-3 py-2 rounded-xl font-black truncate max-w-[160px]">
                {getTranslatedCategoryName(selectedCategory)}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 bg-white p-3 px-4 rounded-2xl border border-gray-100 shadow-sm gap-3">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-0.5">{t.shop.viewing}</span>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                {activeFilterName}
                <span className="ml-2 text-[11px] font-bold text-gray-400">({filteredProducts.length} {t.shop.items})</span>
              </h2>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 w-full sm:w-auto">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">{t.shop.sort_by}:</span>
              <select 
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="text-xs border-none bg-transparent font-black text-indigo-700 focus:ring-0 cursor-pointer uppercase tracking-widest p-0 outline-none flex-1 min-w-0"
              >
                <option>{t.shop.recent}</option>
                <option>{t.shop.price_asc}</option>
                <option>{t.shop.price_desc}</option>
                <option>{t.shop.best_rated}</option>
              </select>
            </div>
          </div>

          {paginatedProducts.length === 0 ? (
            <div className="bg-white rounded-[2rem] border-4 border-dashed border-gray-100 p-12 text-center">
              <PackageX className="h-16 w-16 text-gray-200 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-gray-900 mb-2">{t.shop.no_results}</h3>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Product Grid – 2 cols on all mobile, 3+ on larger */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                {paginatedProducts.map((product) => (
                   <div key={product.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all flex flex-col">
                    <div className="relative aspect-square overflow-hidden cursor-pointer bg-gray-50" onClick={() => onProductClick(product.id)}>
                     <img 
                        src={product.images?.[0] || ''} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <button className="absolute top-1.5 right-1.5 p-1.5 bg-white/95 rounded-lg text-gray-400 hover:text-red-500 shadow-md">
                        <Heart className="h-3.5 w-3.5" />
                      </button>
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px]">
                          <span className="bg-red-600 text-white px-2 py-1 rounded-md font-black text-[8px] uppercase tracking-widest shadow-lg">{t.shop.no_stock}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 sm:p-3 flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[7px] sm:text-[8px] font-black text-indigo-800 uppercase tracking-wide bg-indigo-50 px-1.5 py-0.5 rounded-md truncate max-w-[65%]">{getTranslatedCategoryName(product.category)}</span>
                        <div className="flex items-center gap-0.5 text-[10px] text-yellow-500 font-black"><Star className="h-2 w-2 fill-current" /><span>{product.rating}</span></div>
                      </div>
                      <h3 className="text-[10px] sm:text-[11px] font-bold text-gray-800 mb-2 line-clamp-2 leading-tight min-h-[28px]">{product.name}</h3>
                      <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-[11px] sm:text-sm font-black text-gray-900 tracking-tighter leading-tight">{formatPrice(product.price)}</span>
                          <span className={`text-[7px] font-bold uppercase mt-0.5 ${product.stock <= 5 ? 'text-red-500' : 'text-gray-400'}`}>{t.shop.stock}: {product.stock}</span>
                        </div>
                        <button 
                          disabled={product.stock === 0}
                          onClick={() => handleAddToCartWithValidation(product)} 
                          className="p-2 bg-gray-900 text-white rounded-lg hover:bg-indigo-600 shadow-md transition-all disabled:opacity-20 disabled:grayscale active:scale-95"
                        >
                          <ShoppingCart size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 py-8 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                      className="flex items-center gap-1 px-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-xs font-black text-gray-600 hover:bg-[#fed700] hover:border-[#fed700] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="flex gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => { setCurrentPage(i + 1); window.scrollTo(0, 0); }}
                          className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                            currentPage === i + 1 
                              ? 'bg-[#fed700] text-gray-900 shadow-lg shadow-yellow-100 scale-110' 
                              : 'bg-white border-2 border-gray-100 text-gray-400 hover:border-[#fed700]'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
                      className="flex items-center gap-1 px-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-xs font-black text-gray-600 hover:bg-[#fed700] hover:border-[#fed700] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky FAB for categories on small screens */}
      <div className="fixed bottom-6 right-4 z-50 lg:hidden">
        <button
          onClick={() => setIsCategoryDrawerOpen(true)}
          className="flex items-center gap-2 bg-[#242424] text-white py-3 px-5 rounded-full shadow-2xl shadow-black/30 font-black text-xs uppercase tracking-wider active:scale-95 transition-transform"
        >
          <Filter size={16} />
          {t.header.nav.categories}
        </button>
      </div>
    </div>
  );
};
