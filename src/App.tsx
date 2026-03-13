
import React, { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Shop } from '@/pages/Shop';
import { Login } from '@/pages/Login';
import { Categories } from '@/pages/Categories';
import { ProductDetails } from '@/pages/ProductDetails';
import { Wishlist } from '@/pages/Wishlist';
import { Compare } from '@/pages/Compare';
import { AboutUs } from '@/pages/AboutUs';
import { FAQ } from '@/pages/FAQ';
import { Contact } from '@/pages/Contact';
import { Blog } from '@/pages/Blog';
import { Cart } from '@/pages/Cart';
import { CustomerDashboard } from '@/pages/CustomerDashboard';
import { Dashboard } from '@/pages/admin/Dashboard';
import { Inventory } from '@/pages/admin/Inventory';
import { Marketplaces } from '@/pages/admin/Marketplaces';
import { Products } from '@/pages/admin/Products';
import { Orders } from '@/pages/admin/Orders';
import { Customers } from '@/pages/admin/Customers';
import { Marketing } from '@/pages/admin/Marketing';
import { Settings } from '@/pages/admin/Settings';
import { Reports } from '@/pages/admin/Reports';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { NewSale } from '@/pages/admin/NewSale';
import { HomeManagement } from '@/pages/admin/HomeManagement';
import { CheckCircle2, Menu, X, Info, AlertTriangle, AlertCircle } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();
  return (
    <div className="fixed top-6 right-6 z-[9999] space-y-3 w-80">
      {toasts.map(t => (
        <div key={t.id} className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 border backdrop-blur-md ${
          t.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-800' :
          t.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800' :
          t.type === 'warning' ? 'bg-amber-50/90 border-amber-200 text-amber-800' :
          'bg-indigo-50/90 border-indigo-200 text-indigo-800'
        }`}>
          {t.type === 'success' && <CheckCircle2 size={18} />}
          {t.type === 'error' && <AlertCircle size={18} />}
          {t.type === 'warning' && <AlertTriangle size={18} />}
          {t.type === 'info' && <Info size={18} />}
          <p className="text-xs font-black uppercase tracking-tight flex-1">{t.message}</p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              removeToast(t.id);
            }} 
            className="p-2 -mr-2 opacity-50 hover:opacity-100 hover:bg-black/5 rounded-full transition-all"
            aria-label="Fechar notificação"
          >
            <X size={16}/>
          </button>
        </div>
      ))}
    </div>
  );
};

const Main: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);
  const [isAdminSidebarCollapsed, setIsAdminSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { isLoggedIn, userRole, logout, siteSettings } = useApp();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setIsAdminSidebarOpen(false);
    if (!['home', 'categories', 'category-shop', 'deals'].includes(page)) {
      setSearchTerm('');
    }
    window.scrollTo(0, 0);
  };

  const isAdminView = currentPage.startsWith('admin-');

  const renderPage = () => {
    if (currentPage === 'login') {
      return (
        <Login 
          onLoginSuccess={(role) => {
            if (role === 'admin') handleNavigate('admin-dashboard');
            else handleNavigate('home');
          }}
          onNavigateHome={() => handleNavigate('home')}
        />
      );
    }

    if (currentPage === 'home') return <Shop onProductClick={(id) => handleNavigate(`product-${id}`)} onNavigate={handleNavigate} searchTerm={searchTerm} />;
    if (currentPage === 'categories') return <Shop onProductClick={(id) => handleNavigate(`product-${id}`)} onNavigate={handleNavigate} initialCategory="" searchTerm={searchTerm} />;
    if (currentPage === 'category-shop') return <Shop onProductClick={(id) => handleNavigate(`product-${id}`)} onNavigate={handleNavigate} initialCategory={selectedCategory} searchTerm={searchTerm} />;
    if (currentPage === 'deals') return <Shop onProductClick={(id) => handleNavigate(`product-${id}`)} onNavigate={handleNavigate} isDealsOnly={true} searchTerm={searchTerm} />;
    if (currentPage.startsWith('product-')) return <ProductDetails productId={currentPage.replace('product-', '')} onNavigate={handleNavigate} />;
    if (currentPage === 'wishlist') return <Wishlist />;
    if (currentPage === 'compare') return <Compare />;
    if (currentPage === 'about') return <AboutUs />;
    if (currentPage === 'faq') return <FAQ />;
    if (currentPage === 'contact') return <Contact />;
    if (currentPage === 'blog') return <Blog />;
    if (currentPage === 'cart') return <Cart onNavigate={handleNavigate} />;
    if (currentPage === 'customer-dashboard') return <CustomerDashboard onNavigate={handleNavigate} />;

    if (currentPage === 'checkout-success') {
      return (
        <div className="max-w-md mx-auto px-4 py-32 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100 animate-bounce">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Encomenda Finalizada!</h2>
          <p className="text-gray-500 mb-10 font-medium">Pode acompanhar o estado do seu pedido no seu painel de cliente.</p>
          <div className="flex flex-col gap-3">
             <button onClick={() => handleNavigate('customer-dashboard')} className="w-full bg-[#242424] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all">Ver Meus Pedidos</button>
             <button onClick={() => handleNavigate('home')} className="w-full bg-[#fed700] text-gray-900 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-yellow-400 transition-all">Continuar a Comprar</button>
          </div>
        </div>
      );
    }

    if (isAdminView) {
      if (!isLoggedIn || userRole !== 'admin') { handleNavigate('login'); return null; }
      switch(currentPage) {
        case 'admin-dashboard': return <Dashboard />;
        case 'admin-home-mgmt': return <HomeManagement />;
        case 'admin-inventory': return <Inventory />;
        case 'admin-marketplaces': return <Marketplaces />;
        case 'admin-products': return <Products />;
        case 'admin-orders': return <Orders onNavigate={handleNavigate} />;
        case 'admin-new-sale': return <NewSale onNavigate={handleNavigate} />;
        case 'admin-customers': return <Customers />;
        case 'admin-marketing': return <Marketing />;
        case 'admin-settings': return <Settings />;
        case 'admin-reports': return <Reports />;
        case 'admin-users': return <AdminUsers />;
        default: return <Dashboard />;
      }
    }

    return <div className="p-12 text-center text-gray-500 font-medium italic">Oops! Página em construção.</div>;
  };

  const isLoginPage = currentPage === 'login';

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-300 ${
      isAdminView && isLoggedIn 
        ? (isAdminSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-72') 
        : ''
    }`}>
      <ToastContainer />
      {!isLoginPage && (
        isAdminView && isLoggedIn ? (
          <>
            <div className="lg:hidden bg-gray-900 text-white p-4 flex justify-between items-center sticky top-0 z-[60]">
               <button onClick={() => setIsAdminSidebarOpen(!isAdminSidebarOpen)} className="p-2 bg-gray-800 rounded-lg">
                 {isAdminSidebarOpen ? <X /> : <Menu />}
               </button>
               <span className="font-black tracking-tighter uppercase">{siteSettings.siteName} ADMIN</span>
               <div className="w-10"></div>
            </div>
            <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity lg:hidden ${isAdminSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsAdminSidebarOpen(false)}></div>
            <AdminSidebar 
              isOpen={isAdminSidebarOpen}
              isCollapsed={isAdminSidebarCollapsed}
              onToggleCollapse={() => setIsAdminSidebarCollapsed(!isAdminSidebarCollapsed)}
              currentPage={currentPage} 
              onNavigate={handleNavigate} 
              onLogout={() => { logout(); handleNavigate('home'); }} 
            />
          </>
        ) : (
          <Header 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )
      )}
      <main className={`flex-1 ${isAdminView ? 'bg-gray-50' : 'bg-white'} transition-colors duration-300`}>
        {renderPage()}
      </main>
      {!isAdminView && !isLoginPage && <Footer onNavigate={handleNavigate} />}
    </div>
  );
};

const App: React.FC = () => <AppProvider><Main /></AppProvider>;
export default App;
