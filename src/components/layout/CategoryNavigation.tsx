
import React, { useState } from 'react';
import { ENHANCED_CATEGORIES, EnhancedCategory, SubCategory } from '@/constants';
import * as Icons from 'lucide-react';
import { ChevronRight, ChevronLeft, Heart, ShoppingCart, Box, Menu, PanelLeftClose } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface CategoryNavigationProps {
  onSelect: (category: string | null, sub?: string | null, item?: string | null) => void;
  onNavigate: (page: string) => void;
  isMobile?: boolean;
}

export const CategoryNavigation: React.FC<CategoryNavigationProps> = ({ onSelect, onNavigate, isMobile }) => {
  const { t } = useApp();
  const [level, setLevel] = useState(0); // 0: Main, 1: Sub, 2: Items
  const [activeCategory, setActiveCategory] = useState<EnhancedCategory | null>(null);
  const [activeSub, setActiveSub] = useState<SubCategory | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryName = (category: EnhancedCategory) => {
    return t.categories[category.slug] || category.name;
  };

  const handleCategoryClick = (category: EnhancedCategory) => {
    onSelect(category.name);
    if (category.subCategories && category.subCategories.length > 0) {
      setActiveCategory(category);
      setLevel(1);
    }
  };

  const handleSubClick = (sub: SubCategory) => {
    onSelect(activeCategory!.name, sub.name);
    if (sub.items && sub.items.length > 0) {
      setActiveSub(sub);
      setLevel(2);
    }
  };

  const goBack = () => {
    if (level === 2) {
      setLevel(1);
      setActiveSub(null);
      onSelect(activeCategory!.name);
    } else if (level === 1) {
      setLevel(0);
      setActiveCategory(null);
      onSelect(null);
    }
  };

  const handleReset = () => {
    setLevel(0);
    setActiveCategory(null);
    setActiveSub(null);
    onSelect(null);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div 
      className={`bg-white ${isMobile ? 'w-full h-full rounded-none' : 'border border-gray-100 rounded-[2rem] shadow-2xl shadow-indigo-500/5'} overflow-hidden flex flex-col transition-all duration-500 ease-in-out ${
        isCollapsed && !isMobile ? 'w-20' : !isMobile ? 'w-[280px]' : ''
      }`}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* Header Estilo Imagem */}
      <div className={`bg-[#fcfdfe] p-3 flex items-center gap-3 transition-all ${isCollapsed && !isMobile ? 'justify-center' : 'pb-2'}`}>
        {(!isCollapsed || isMobile) && level > 0 && (
          <button type="button" onClick={goBack} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-gray-100 bg-white shadow-sm">
            <ChevronLeft size={14} className="text-gray-900" />
          </button>
        )}
        
        {(!isCollapsed || isMobile) ? (
          <button 
            type="button"
            onClick={handleReset}
            className="text-[14px] font-black text-gray-900 truncate hover:text-indigo-600 transition-colors uppercase tracking-tight flex-1 text-left"
          >
            {level === 0 ? t.header.nav.categories : level === 1 ? getCategoryName(activeCategory!) : activeSub?.name}
          </button>
        ) : null}

        {!isMobile && (
          <button 
            type="button"
            onClick={toggleCollapse}
            className={`p-2 rounded-xl transition-all ${
              isCollapsed 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                : 'hover:bg-gray-100 text-gray-400'
            }`}
            title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            {isCollapsed ? <Menu size={18} /> : <Icons.PanelLeftClose size={18} />}
          </button>
        )}
      </div>

      {/* Lista Principal Estilo Imagem */}
      <div className={`flex-1 overflow-y-auto ${isMobile ? 'max-h-full' : 'max-h-[500px]'} custom-scrollbar overflow-x-hidden`}>
        {level === 0 && (
          <div className="divide-y divide-gray-50/50">
            {ENHANCED_CATEGORIES.map((cat) => {
              const IconComponent = (Icons as any)[cat.iconName] || Box;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={`w-full flex items-center transition-all group ${
                    isCollapsed && !isMobile ? 'justify-center p-2.5' : 'justify-between p-3 px-6 hover:bg-indigo-50/30'
                  }`}
                  title={isCollapsed && !isMobile ? getCategoryName(cat) : ""}
                >
                  <div className={`flex items-center ${(isCollapsed && !isMobile) ? 'gap-0' : 'gap-5'}`}>
                    <div className={`text-indigo-600 bg-[#edf2ff] rounded-xl group-hover:scale-105 transition-transform shadow-sm flex items-center justify-center ${
                      (isCollapsed && !isMobile) ? 'p-2 w-9 h-9' : 'p-2 w-10 h-10'
                    }`}>
                      <IconComponent size={(isCollapsed && !isMobile) ? 18 : 20} />
                    </div>
                    {(!isCollapsed || isMobile) && (
                      <span className="text-[14px] font-bold text-gray-700 group-hover:text-gray-900 transition-colors truncate max-w-[200px]">
                        {getCategoryName(cat)}
                      </span>
                    )}
                  </div>
                  {(!isCollapsed || isMobile) && (
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {!isCollapsed && level === 1 && activeCategory && (
          <div className="divide-y divide-gray-50">
            <button
              type="button"
              onClick={() => { onSelect(getCategoryName(activeCategory)); }}
              className="w-full text-left p-2 px-6 text-[9px] font-black text-indigo-600 hover:bg-indigo-50/50 transition-colors uppercase tracking-[0.1em]"
            >
              {t.shop.viewing} {getCategoryName(activeCategory)}
            </button>
            {activeCategory.subCategories?.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => handleSubClick(sub)}
                className="w-full flex items-center justify-between p-2 px-6 hover:bg-gray-50 transition-colors group"
              >
                <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">{sub.name}</span>
                <ChevronRight size={14} className="text-gray-300" />
              </button>
            ))}
          </div>
        )}

        {!isCollapsed && level === 2 && activeSub && (
          <div className="divide-y divide-gray-50">
            <button
              type="button"
              onClick={() => onSelect(getCategoryName(activeCategory!), activeSub.name)}
              className="w-full text-left p-2 px-6 text-[9px] font-black text-indigo-600 hover:bg-indigo-50/50 transition-colors uppercase tracking-[0.1em]"
            >
              {t.shop.viewing} {activeSub.name}
            </button>
            {activeSub.items?.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelect(getCategoryName(activeCategory!), activeSub.name, item)}
                className="w-full text-left p-2 px-8 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors hover:text-indigo-600"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Wishlist e Cart Estilo Imagem */}
      <div className={`bg-white border-t border-gray-50 mt-auto transition-all ${isCollapsed ? 'p-2' : ''}`}>
        <div className={`divide-y divide-gray-50 ${isCollapsed ? 'space-y-2 divide-y-0' : ''}`}>
          <button 
            type="button"
            onClick={() => onNavigate('wishlist')}
            className={`w-full flex items-center transition-all group ${
              isCollapsed ? 'justify-center p-2 rounded-2xl hover:bg-red-50' : 'justify-between p-2 px-6 hover:bg-red-50/30'
            }`}
            title={isCollapsed ? t.header.wishlist : ""}
          >
            <div className={`flex items-center ${isCollapsed ? 'gap-0' : 'gap-5'} text-gray-800 group-hover:text-red-600`}>
              <div className={`bg-red-50/50 rounded-xl group-hover:scale-110 transition-transform flex items-center justify-center ${
                isCollapsed ? 'p-2' : 'p-2'
              }`}>
                <Heart size={isCollapsed ? 18 : 20} className="text-red-500 fill-transparent group-hover:fill-red-500 transition-all" />
              </div>
              {!isCollapsed && <span className="text-[13px] font-bold">{t.header.wishlist}</span>}
            </div>
            {!isCollapsed && (
              <ChevronRight size={16} className="text-gray-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
            )}
          </button>
          
          <button 
            type="button"
            onClick={() => onNavigate('cart')}
            className={`w-full flex items-center transition-all group ${
              isCollapsed ? 'justify-center p-2 rounded-2xl hover:bg-indigo-50' : 'justify-between p-2 px-6 hover:bg-indigo-50/30'
            }`}
            title={isCollapsed ? t.header.cart : ""}
          >
            <div className={`flex items-center ${isCollapsed ? 'gap-0' : 'gap-5'} text-gray-800 group-hover:text-indigo-600`}>
              <div className={`bg-indigo-50/50 rounded-xl group-hover:scale-110 transition-transform flex items-center justify-center ${
                isCollapsed ? 'p-2' : 'p-2'
              }`}>
                <ShoppingCart size={isCollapsed ? 18 : 20} className="text-indigo-600" />
              </div>
              {!isCollapsed && <span className="text-[13px] font-bold">{t.header.cart}</span>}
            </div>
            {!isCollapsed && (
              <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
