
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Box,
  Tag,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Share2,
  BarChart3,
  Home,
  Zap,
  Menu
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  isCollapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick, isCollapsed }) => (
  <button
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 ${
      isCollapsed ? 'justify-center px-0' : 'space-x-3 px-4'
    } ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`}
  >
    <div className="flex-shrink-0">{icon}</div>
    {!isCollapsed && <span className="font-bold text-sm truncate whitespace-nowrap animate-in fade-in duration-500">{label}</span>}
  </button>
);

interface AdminSidebarProps {
  isOpen?: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  isOpen, 
  isCollapsed, 
  onToggleCollapse, 
  currentPage, 
  onNavigate, 
  onLogout 
}) => {
  const { t, siteSettings } = useApp();
  const s = t.admin.sidebar;

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-72';

  return (
    <aside className={`${sidebarWidth} bg-gray-900 text-white h-screen flex flex-col fixed left-0 top-0 overflow-y-auto overflow-x-hidden z-50 border-r border-gray-800 transition-all duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      
      {/* Header & Toggle */}
      <div className={`p-4 mb-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex items-center space-x-3 cursor-pointer animate-in slide-in-from-left-2 overflow-hidden" onClick={() => onNavigate('home')}>
            {siteSettings.siteLogo ? (
              <img src={siteSettings.siteLogo} alt="Logo" className="h-8 w-8 object-contain rounded-lg shadow-lg shadow-black/50" />
            ) : (
              <Box className="h-8 w-8 text-indigo-400" />
            )}
            <span className="text-sm font-black tracking-tight text-white uppercase italic truncate">
              {siteSettings.siteName}
            </span>
          </div>
        )}
        {isCollapsed && (
          siteSettings.siteLogo ? (
            <img src={siteSettings.siteLogo} alt="Logo" className="h-8 w-8 object-contain rounded-lg" />
          ) : (
            <Box className="h-8 w-8 text-indigo-500" />
          )
        )}
        
        <button 
          onClick={onToggleCollapse}
          className={`flex p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors ${isCollapsed ? 'mt-2' : ''}`}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex-1 px-3 space-y-8 overflow-y-auto custom-scrollbar">
        <div>
          {!isCollapsed && <p className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 animate-in fade-in">Principal</p>}
          <nav className="space-y-1.5">
            <SidebarItem 
              icon={<LayoutDashboard size={20} />} 
              label={s.dashboard} 
              active={currentPage === 'admin-dashboard'}
              onClick={() => onNavigate('admin-dashboard')}
              isCollapsed={isCollapsed}
            />
            <SidebarItem 
              icon={<Home size={20} />} 
              label={s.home_mgmt} 
              active={currentPage === 'admin-home-mgmt'}
              onClick={() => onNavigate('admin-home-mgmt')}
              isCollapsed={isCollapsed}
            />
            <SidebarItem 
              icon={<Zap size={20} />} 
              label={s.new_sale} 
              active={currentPage === 'admin-new-sale'}
              onClick={() => onNavigate('admin-new-sale')}
              isCollapsed={isCollapsed}
            />
            <SidebarItem 
              icon={<ShoppingCart size={20} />} 
              label={s.orders} 
              active={currentPage === 'admin-orders'}
              onClick={() => onNavigate('admin-orders')}
              isCollapsed={isCollapsed}
            />
            <SidebarItem 
              icon={<Package size={20} />} 
              label={s.products} 
              active={currentPage === 'admin-products'}
              onClick={() => onNavigate('admin-products')}
              isCollapsed={isCollapsed}
            />
            <SidebarItem 
              icon={<Box size={20} />} 
              label={s.inventory} 
              active={currentPage === 'admin-inventory'}
              onClick={() => onNavigate('admin-inventory')}
              isCollapsed={isCollapsed}
            />
          </nav>
        </div>

        <div>
          {!isCollapsed && <p className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 animate-in fade-in">Operações</p>}
          <nav className="space-y-1.5">
            <SidebarItem 
              icon={<BarChart3 size={20} />} 
              label={s.reports} 
              active={currentPage === 'admin-reports'}
              onClick={() => onNavigate('admin-reports')}
              isCollapsed={isCollapsed}
            />
            <SidebarItem 
              icon={<Share2 size={20} />} 
              label={s.marketplaces} 
              active={currentPage === 'admin-marketplaces'}
              onClick={() => onNavigate('admin-marketplaces')}
              isCollapsed={isCollapsed}
            />
          </nav>
        </div>

        <div>
          {!isCollapsed && <p className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 animate-in fade-in">Crescimento</p>}
          <nav className="space-y-1.5">
            <SidebarItem 
              icon={<Users size={20} />} 
              label={s.customers} 
              active={currentPage === 'admin-customers'}
              onClick={() => onNavigate('admin-customers')}
              isCollapsed={isCollapsed}
            />
            <SidebarItem 
              icon={<Tag size={20} />} 
              label={s.marketing} 
              active={currentPage === 'admin-marketing'}
              onClick={() => onNavigate('admin-marketing')}
              isCollapsed={isCollapsed}
            />
          </nav>
        </div>
      </div>

      <div className="p-3 mt-auto border-t border-gray-800 bg-gray-900/50 space-y-1.5">
        <SidebarItem 
          icon={<Settings size={20} />} 
          label={s.settings} 
          active={currentPage === 'admin-settings'}
          onClick={() => onNavigate('admin-settings')}
          isCollapsed={isCollapsed}
        />
        <SidebarItem 
          icon={<LogOut size={20} className="text-red-400" />} 
          label={s.logout} 
          onClick={onLogout}
          isCollapsed={isCollapsed}
        />
      </div>
    </aside>
  );
};
