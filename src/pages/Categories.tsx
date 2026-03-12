
import React, { useState } from 'react';
import { ENHANCED_CATEGORIES, EnhancedCategory, SubCategory } from '@/constants';
import * as Icons from 'lucide-react';
import { ChevronRight, ChevronLeft, X, Heart, ShoppingCart } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface CategoriesProps {
  onCategorySelect: (categoryName: string) => void;
  onNavigate?: (page: string) => void;
}

export const Categories: React.FC<CategoriesProps> = ({ onCategorySelect, onNavigate }) => {
  const { t } = useApp();
  const [level, setLevel] = useState(0); // 0: Main, 1: Sub, 2: Items
  const [activeCategory, setActiveCategory] = useState<EnhancedCategory | null>(null);
  const [activeSub, setActiveSub] = useState<SubCategory | null>(null);

  const getCategoryName = (cat: EnhancedCategory) => {
    return t.categories[cat.slug] || cat.name;
  };

  const handleCategoryClick = (cat: EnhancedCategory) => {
    if (cat.subCategories && cat.subCategories.length > 0) {
      setActiveCategory(cat);
      setLevel(1);
    } else {
      onCategorySelect(getCategoryName(cat));
    }
  };

  const handleSubClick = (sub: SubCategory) => {
    if (sub.items && sub.items.length > 0) {
      setActiveSub(sub);
      setLevel(2);
    } else {
      onCategorySelect(activeCategory ? getCategoryName(activeCategory) : '');
    }
  };

  const goBack = () => {
    if (level === 2) setLevel(1);
    else if (level === 1) setLevel(0);
  };

  const reset = () => {
    setLevel(0);
    setActiveCategory(null);
    setActiveSub(null);
  };

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-white shadow-lg overflow-hidden flex flex-col">
      {/* Header Fixo */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          {level > 0 && (
            <button onClick={goBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={24} className="text-gray-500" />
            </button>
          )}
          <h2 className="text-xl font-bold text-gray-700 tracking-tight">
            {level === 0 ? 'Todos os Produtos' : level === 1 ? (activeCategory ? getCategoryName(activeCategory) : '') : activeSub?.name}
          </h2>
        </div>
        <button onClick={reset} className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Nível 0: Lista Principal */}
        {level === 0 && (
          <div className="divide-y divide-gray-50">
            {ENHANCED_CATEGORIES.map((cat) => {
              const IconComponent = (Icons as any)[cat.iconName] || Icons.Box;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-indigo-500 group-hover:scale-110 transition-transform">
                      <IconComponent size={24} />
                    </div>
                    <span className="text-[15px] font-medium text-gray-600">{getCategoryName(cat)}</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-300" />
                </button>
              );
            })}
          </div>
        )}

        {/* Nível 1: Subcategorias */}
        {level === 1 && activeCategory && (
          <div className="divide-y divide-gray-50">
            {activeCategory.subCategories?.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSubClick(sub)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-100 transition-colors"
              >
                <span className="text-[15px] font-medium text-gray-600">{sub.name}</span>
                <ChevronRight size={20} className="text-gray-300" />
              </button>
            ))}
            <button
              onClick={() => onCategorySelect(getCategoryName(activeCategory))}
              className="w-full text-left p-5 text-indigo-600 font-bold text-sm bg-gray-50 hover:bg-indigo-50"
            >
              Ver todos os produtos
            </button>
          </div>
        )}

        {/* Nível 2: Itens de 3º nível */}
        {level === 2 && activeSub && (
          <div className="divide-y divide-gray-50">
            {activeSub.items?.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onCategorySelect(activeCategory ? getCategoryName(activeCategory) : '')}
                className="w-full text-left p-5 text-[15px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => onCategorySelect(activeCategory ? getCategoryName(activeCategory) : '')}
              className="w-full text-left p-5 text-indigo-600 font-bold text-sm bg-gray-50 hover:bg-indigo-50"
            >
              Ver todos os produtos
            </button>
          </div>
        )}
      </div>

      {/* Seção Minha Conta (Sempre visível no fundo) */}
      <div className="bg-white border-t border-gray-100">
        <div className="p-4 bg-gray-50">
           <h3 className="text-indigo-600 font-bold text-lg">Minha Conta</h3>
        </div>
        <div className="divide-y divide-gray-50">
          <button 
            onClick={() => onNavigate?.('wishlist')}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4 text-gray-600">
              <Heart size={24} className="text-indigo-500" />
              <span className="text-[15px] font-medium">Lista de Desejos</span>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </button>
          <button 
            onClick={() => onNavigate?.('cart')}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4 text-gray-600">
              <ShoppingCart size={24} className="text-indigo-500" />
              <span className="text-[15px] font-medium">Carrinho de Compras</span>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
