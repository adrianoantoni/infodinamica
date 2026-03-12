
import React, { useState } from 'react';
import { Search, Heart, ShoppingCart, User, ChevronDown, Menu, Globe, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Language, Currency } from '@/types';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, searchTerm, onSearchChange }) => {
  const { cart, wishlist, isLoggedIn, language, currency, setLanguage, setCurrency, formatPrice, t, siteSettings, invoiceSettings } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const getLanguageLabel = (lang: Language) => {
    switch (lang) {
      case 'pt': return 'Português';
      case 'en': return 'English';
      case 'es': return 'Español';
      case 'fr': return 'Français';
      default: return 'Language';
    }
  };

  return (
    <header className="w-full">
      {/* 1. Top Bar */}
      <div className="bg-[#f8f9f9] border-b border-gray-200 py-3 text-[14px] text-[#242424]">
        <div className="max-w-[1850px] mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="text-gray-400 font-bold">{t.header.support}:</span>
            <a href={`tel:${invoiceSettings.phone}`} className="font-black hover:text-[#fed700] transition-colors">{invoiceSettings.phone}</a>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {/* Currency Selector */}
            <div className="relative group flex items-center gap-2 cursor-pointer hover:text-[#fed700] font-black">
              <span>{currency}</span> <ChevronDown size={14} />
              <div className="absolute top-full right-0 bg-white shadow-2xl rounded-xl border border-gray-100 hidden group-hover:block z-[60] py-2 w-32 overflow-hidden">
                {(['USD', 'EUR', 'AOA'] as Currency[]).map(cur => (
                  <button 
                    key={cur}
                    onClick={() => setCurrency(cur)}
                    className={`w-full text-left px-5 py-2.5 hover:bg-gray-50 transition-colors text-xs font-black ${currency === cur ? 'text-indigo-600' : 'text-gray-700'}`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div className="relative group flex items-center gap-2 cursor-pointer hover:text-[#fed700] font-black">
              <span>{getLanguageLabel(language)}</span> <ChevronDown size={14} />
              <div className="absolute top-full right-0 bg-white shadow-2xl rounded-xl border border-gray-100 hidden group-hover:block z-[60] py-2 w-40 overflow-hidden">
                <button onClick={() => setLanguage('pt')} className="w-full text-left px-5 py-2.5 hover:bg-gray-50 text-xs font-black">Português</button>
                <button onClick={() => setLanguage('en')} className="w-full text-left px-5 py-2.5 hover:bg-gray-50 text-xs font-black">English</button>
                <button onClick={() => setLanguage('es')} className="w-full text-left px-5 py-2.5 hover:bg-gray-50 text-xs font-black">Español</button>
                <button onClick={() => setLanguage('fr')} className="w-full text-left px-5 py-2.5 hover:bg-gray-50 text-xs font-black">Français</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Header */}
      <div className="bg-white py-6 border-b border-gray-100">
        <div className="max-w-[1850px] mx-auto px-4 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-shrink-0 cursor-pointer" onClick={() => onNavigate('home')}>
            {siteSettings.siteLogo ? (
              <img src={siteSettings.siteLogo} alt={siteSettings.siteName} className="h-12 md:h-16 w-auto object-contain" />
            ) : (
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#242424]">
                {siteSettings.siteName}
              </h1>
            )}
          </div>

          <div className="flex-1 w-full max-w-5xl">
            <div className="flex border-2 border-gray-200 rounded-2xl overflow-hidden focus-within:border-[#fed700] h-16 shadow-sm bg-gray-50/50">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.header.search_placeholder} 
                className="flex-1 px-8 py-2 outline-none text-[18px] md:text-[20px] font-bold bg-transparent placeholder:text-gray-400"
              />
              <button className="bg-[#fed700] px-8 md:px-10 py-2 hover:bg-[#333] hover:text-white transition-all flex items-center gap-3 font-black uppercase text-xs tracking-widest">
                <Search size={24} />
                <span className="hidden sm:inline">{t.header.search_btn}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6 lg:ml-auto">
            <button onClick={() => onNavigate('compare')} className="relative group text-[#242424] hover:text-[#fed700] transition-colors">
              <div className="flex flex-col items-center">
                <Globe size={28} />
                <span className="text-[12px] font-black mt-1.5 uppercase hidden md:block tracking-widest">{t.header.compare}</span>
              </div>
            </button>

            <button onClick={() => onNavigate('wishlist')} className="relative group text-[#242424] hover:text-[#fed700] transition-colors">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Heart size={28} />
                  {wishlist.length > 0 && <span className="absolute -top-2 -right-2 bg-[#fed700] text-gray-900 text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">{wishlist.length}</span>}
                </div>
                <span className="text-[12px] font-black mt-1.5 uppercase hidden md:block tracking-widest">{t.header.wishlist}</span>
              </div>
            </button>

            <button onClick={() => onNavigate('cart')} className="relative group text-[#242424] hover:text-[#fed700] transition-colors">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <ShoppingCart size={28} />
                  {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#fed700] text-gray-900 text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">{cartCount}</span>}
                </div>
                <span className="text-[12px] font-black mt-1.5 uppercase hidden md:block tracking-widest">{formatPrice(cartTotal)}</span>
              </div>
            </button>
            
            <button onClick={() => onNavigate('login')} className="flex flex-col items-center text-[#242424] hover:text-[#fed700] transition-colors">
              <User size={28} />
              <span className="text-[12px] font-black mt-1.5 uppercase hidden md:block tracking-widest">{isLoggedIn ? t.header.dashboard : t.header.login}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Nav Area */}
      <div className="bg-[#fed700] hidden lg:block sticky top-0 z-40 shadow-md h-16">
        <div className="max-w-[1850px] mx-auto px-4 flex justify-center h-full">
          <nav className="h-full">
            <ul className="flex items-center gap-1 h-full text-[16px] font-black text-[#242424] uppercase tracking-wider">
              {Object.entries(t.header.nav).map(([key, label]) => (
                <li key={key} className="h-full">
                  <button 
                    onClick={() => onNavigate(key)} 
                    className={`h-full px-6 hover:bg-black/5 flex items-center transition-all border-b-4 border-transparent hover:border-black/10 ${currentPage === key ? 'bg-black/5 border-black/20' : ''}`}
                  >
                    {label as string}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      
      {/* Mobile Toggle */}
      <div className="lg:hidden bg-[#fed700] p-4 flex justify-between items-center h-16 shadow-lg">
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-white/20 rounded-xl">
          <Menu size={28} />
        </button>
        <span className="font-black text-2xl tracking-tighter">{siteSettings.siteName}</span>
        <button onClick={() => onNavigate('cart')} className="relative p-2">
          <ShoppingCart size={28} />
          {cartCount > 0 && <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-black border-2 border-white">{cartCount}</span>}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col p-8 space-y-8 animate-in slide-in-from-left duration-300 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black tracking-tight text-gray-900">MENU</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500"><X size={24}/></button>
            </div>
            <div className="flex flex-col gap-2">
              {Object.entries(t.header.nav).map(([key, label]) => (
                <button 
                  key={key} 
                  onClick={() => { onNavigate(key); setIsMobileMenuOpen(false); }} 
                  className="text-left font-black text-[18px] py-4 border-b border-gray-50 uppercase tracking-wider text-gray-800 hover:text-indigo-600 transition-colors"
                >
                  {label as string}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
