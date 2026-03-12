import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, Menu, LogIn, LayoutDashboard, Tag, Grid, Heart, ArrowLeftRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { cart, wishlist, compareList, isLoggedIn, userRole, logout, siteSettings } = useApp();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-2xl py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-[1800px] mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-12">
          <div className="flex-shrink-0 cursor-pointer group" onClick={() => onNavigate('home')}>
             {siteSettings.siteLogo ? (
               <img src={siteSettings.siteLogo} alt={siteSettings.siteName} className="h-10 md:h-12 w-auto object-contain brightness-100 group-hover:scale-110 transition-transform" />
             ) : (
               <h1 className={`text-3xl font-black tracking-tighter transition-colors ${isScrolled ? 'text-[#242424]' : 'text-white'}`}>
                 {siteSettings.siteName}
               </h1>
             )}
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-semibold transition-colors ${currentPage === 'home' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
              >
                Shop
              </button>
              <button 
                onClick={() => onNavigate('categories')}
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${currentPage === 'categories' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
              >
                Categories
              </button>
              <button 
                onClick={() => onNavigate('deals')}
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${currentPage === 'deals' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
              >
                Deals
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => onNavigate('cart')}
              className="relative p-2 text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => onNavigate('wishlist')}
              className="relative p-2 text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center border border-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => onNavigate('compare')}
              className="relative p-2 text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeftRight size={20} />
              {compareList.length > 0 && (
                <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center border border-white">
                  {compareList.length}
                </span>
              )}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {userRole === 'admin' && (
                  <button 
                    onClick={() => onNavigate('admin-dashboard')}
                    className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                  >
                    <LayoutDashboard size={20} />
                  </button>
                )}
                <button 
                  onClick={logout}
                  className="text-xs font-bold text-gray-500 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('login')}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <LogIn size={20} />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}

            <button className="md:hidden p-2 text-gray-500">
              <Menu className="h-5 w-5" />
            </button>
          </div>
      </div>
    </nav>
  );
};
