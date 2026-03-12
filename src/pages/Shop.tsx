
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ShoppingCart, Heart, Star, Filter, PackageX, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { CategoryNavigation } from '@/components/layout/CategoryNavigation';
import { ENHANCED_CATEGORIES } from '@/constants';

interface ShopProps {
  onProductClick: (id: string) => void;
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
  const [currentPage, setCurrentPage] = useState(1);
  
  // Mantendo 12 produtos por página conforme solicitado anteriormente
  const itemsPerPage = 12;

  useEffect(() => {
    setSelectedCategory(initialCategory || null);
    setSelectedSubCategory(null);
    setSelectedItem(null);
    setCurrentPage(1);
  }, [initialCategory]);

  const getTranslatedProductName = (product: Product) => {
    return t.products[product.id] || product.name;
  };

  const getTranslatedCategoryName = (categoryName: string) => {
    const cat = ENHANCED_CATEGORIES.find(c => c.name === categoryName);
    if (cat) return t.categories[cat.slug] || cat.name;
    return categoryName;
  };

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (searchTerm) {
      const s = searchTerm.toLowerCase().trim();
      list = list.filter(p => 
        getTranslatedProductName(p).toLowerCase().includes(s) || 
        getTranslatedCategoryName(p.category).toLowerCase().includes(s)
      );
    }
    
    // Filtro de Nível 1: Categoria
    if (selectedCategory) {
      list = list.filter(p => {
        const pCat = getTranslatedCategoryName(p.category).toLowerCase().trim();
        const sCat = selectedCategory.toLowerCase().trim();
        const pCatRaw = p.category.toLowerCase().trim();
        return pCat === sCat || pCatRaw === sCat;
      });
    }

    // Filtro de Nível 2: Sub-categoria
    if (selectedSubCategory) {
      list = list.filter(p => p.subCategory?.toLowerCase().trim() === selectedSubCategory.toLowerCase().trim());
    }

    // Filtro de Nível 3: Item Específico
    if (selectedItem) {
      list = list.filter(p => p.specificItem?.toLowerCase().trim() === selectedItem.toLowerCase().trim());
    }

    if (isDealsOnly) {
      list = list.filter(p => p.featured || p.rating >= 4.5);
    }

    list.sort((a, b) => {
      if (sortBy === t.shop.price_asc) return a.price - b.price;
      if (sortBy === t.shop.price_desc) return b.price - a.price;
      if (sortBy === t.shop.best_rated) return b.rating - a.rating;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return list;
  }, [products, selectedCategory, selectedSubCategory, selectedItem, isDealsOnly, searchTerm, sortBy, t]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const activeFilterName = useMemo(() => {
    if (searchTerm) return `${t.header.search_btn}: "${searchTerm}"`;
    if (isDealsOnly) return t.header.nav.deals;
    if (selectedItem) return selectedItem;
    if (selectedSubCategory) return selectedSubCategory;
    if (selectedCategory) return selectedCategory;
    return t.shop.no_results.includes('Found') ? 'All Products' : 'Todos os Produtos';
  }, [selectedCategory, selectedSubCategory, selectedItem, isDealsOnly, searchTerm, t]);

  const handleAddToCartWithValidation = (product: Product) => {
    const existingInCart = cart.find(item => item.productId === product.id);
    const currentQtyInCart = existingInCart ? existingInCart.quantity : 0;

    if (currentQtyInCart + 1 > product.stock) {
      alert(`Quantidade insuficiente em stock.\nStock disponível: ${product.stock}`);
      return;
    }

    addToCart({ 
      ...product, 
      productId: product.id, 
      quantity: 1, 
      name: getTranslatedProductName(product),
      image: product.images[0] 
    });
  };

  return (
    <div className="max-w-[1900px] mx-auto px-0 lg:px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
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

        <div className="flex-1 px-4 lg:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm gap-6">
            <div className="flex flex-col">
              <span className="text-[14px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">{t.shop.viewing}</span>
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                {activeFilterName}
                <span className="ml-4 text-[16px] font-bold text-gray-400">({filteredProducts.length} {t.shop.items})</span>
              </h2>
            </div>
            
            <div className="flex items-center gap-6 bg-gray-50 px-8 py-4 rounded-3xl border border-gray-100">
              <span className="text-[14px] font-black text-gray-400 uppercase tracking-widest">{t.shop.sort_by}:</span>
              <select 
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="text-lg border-none bg-transparent font-black text-indigo-700 focus:ring-0 cursor-pointer uppercase tracking-widest p-0 pr-10 outline-none"
              >
                <option>{t.shop.recent}</option>
                <option>{t.shop.price_asc}</option>
                <option>{t.shop.price_desc}</option>
                <option>{t.shop.best_rated}</option>
              </select>
            </div>
          </div>

          {paginatedProducts.length === 0 ? (
            <div className="bg-white rounded-[4rem] border-4 border-dashed border-gray-100 p-24 text-center">
              <PackageX className="h-20 w-20 text-gray-200 mx-auto mb-8" />
              <h3 className="text-3xl font-black text-gray-900 mb-2">{t.shop.no_results}</h3>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="group bg-white rounded-[3rem] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all flex flex-col hover:-translate-y-2">
                    <div className="relative aspect-square overflow-hidden cursor-pointer bg-gray-50" onClick={() => onProductClick(product.id)}>
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <button className="absolute top-6 right-6 p-4 bg-white/95 rounded-2xl text-gray-400 hover:text-red-500 shadow-xl"><Heart className="h-6 w-6" /></button>
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px]">
                          <span className="bg-red-600 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">{t.shop.no_stock}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[13px] font-black text-indigo-800 uppercase tracking-widest bg-indigo-50 px-4 py-1.5 rounded-xl">{getTranslatedCategoryName(product.category)}</span>
                        <div className="flex items-center gap-1.5 text-[16px] text-yellow-500 font-black"><Star className="h-4 w-4 fill-current" /><span>{product.rating}</span></div>
                      </div>
                      <h3 className="text-[20px] font-bold text-gray-800 mb-6 line-clamp-2 leading-tight">{getTranslatedProductName(product)}</h3>
                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-3xl font-black text-gray-900 tracking-tighter">{formatPrice(product.price)}</span>
                          <span className={`text-[10px] font-bold uppercase mt-1 ${product.stock <= 5 ? 'text-red-500' : 'text-gray-400'}`}>{t.shop.stock}: {product.stock} un.</span>
                        </div>
                        <button 
                          disabled={product.stock === 0}
                          onClick={() => handleAddToCartWithValidation(product)} 
                          className="p-5 bg-gray-900 text-white rounded-[1.5rem] hover:bg-indigo-600 shadow-xl transition-all disabled:opacity-20 disabled:grayscale"
                        >
                          <ShoppingCart size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Controles de Paginação Restaurados com Números */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-6 py-12 border-t border-gray-50 mt-8">
                  <div className="flex items-center gap-3">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                      className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl text-[14px] font-black text-gray-600 hover:bg-[#fed700] hover:text-gray-900 hover:border-[#fed700] disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm group"
                    >
                      <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => { setCurrentPage(i + 1); window.scrollTo(0, 0); }}
                          className={`w-14 h-14 rounded-2xl text-[16px] font-black transition-all ${
                            currentPage === i + 1 
                              ? 'bg-[#fed700] text-gray-900 shadow-xl shadow-yellow-100 scale-110' 
                              : 'bg-white border-2 border-gray-100 text-gray-400 hover:border-[#fed700] hover:text-[#fed700]'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
                      className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl text-[14px] font-black text-gray-600 hover:bg-[#fed700] hover:text-gray-900 hover:border-[#fed700] disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm group"
                    >
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
