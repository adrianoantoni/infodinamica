
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product, Order, CartItem, StockMovement, OrderStatus, MovementType, MarketplaceLog, Language, Currency, Customer } from '@/types';
import { MOCK_PRODUCTS, EXCHANGE_RATES, CURRENCY_SYMBOLS, TRANSLATIONS } from '@/constants';
import { apiService } from '@/services/api';

export interface InvoiceSettings {
  companyName: string;
  nif: string;
  phone: string;
  logo: string;
  address: string;
  iban: string;
  swift: string;
  bankName: string;
  representativeName: string;
  taxEnabled: boolean;
  taxRate: number;
}

export interface SiteSettings {
  siteName: string;
  siteLogo: string;
  siteDescription: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppContextType {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  cart: CartItem[];
  wishlist: string[];
  compareList: string[];
  stockMovements: StockMovement[];
  marketplaceLogs: MarketplaceLog[];
  invoiceSettings: InvoiceSettings;
  siteSettings: SiteSettings;
  isMLConnected: boolean;
  language: Language;
  currency: Currency;
  editingOrder: Order | null;
  toasts: Toast[];
  t: any;
  setLanguage: (lang: Language) => void;
  setCurrency: (cur: Currency) => void;
  formatPrice: (amount: number) => string;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variationId?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, variationId?: string) => void;
  toggleWishlist: (productId: string) => void;
  toggleCompare: (productId: string) => void;
  placeOrder: (orderData: Partial<Order>) => void;
  updateOrder: (orderId: string, orderData: Partial<Order>) => void;
  setEditingOrder: (order: Order | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addStockMovement: (movement: Partial<StockMovement>) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomerBalance: (customerId: string, amount: number) => void;
  updateInvoiceSettings: (settings: Partial<InvoiceSettings>) => void;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  toggleMLConnection: () => void;
  linkProductToML: (productId: string) => void;
  syncAllToML: () => Promise<void>;
  fetchMLOrders: () => Promise<void>;
  isLoggedIn: boolean;
  userRole: 'admin' | 'customer' | null;
  userName: string | null;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([
    { id: 'c-1', name: 'João Silva', email: 'joao@nexus.com', nif: '123456789', phone: '923000111', type: 'singular', balance: 25000, createdAt: new Date().toISOString() },
    { id: 'c-2', name: 'Nexus Tech Lda', email: 'contato@nexustech.ao', nif: '540112233', phone: '924000222', type: 'empresa', balance: 500000, createdAt: new Date().toISOString() }
  ]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [marketplaceLogs, setMarketplaceLogs] = useState<MarketplaceLog[]>([]);
  const [isMLConnected, setIsMLConnected] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'customer' | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const [language, setLanguage] = useState<Language>('pt');
  const [currency, setCurrency] = useState<Currency>('AOA');
  const [isLoading, setIsLoading] = useState(true);

  // --- API DATA FETCHING ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [dbProducts, dbCustomers, dbSettings] = await Promise.all([
          apiService.getProducts(),
          apiService.getCustomers(),
          apiService.getSettings()
        ]);

        if (dbProducts?.length > 0) {
          // Map backend fields to frontend types if necessary
          const mappedProducts = dbProducts.map((p: any) => ({
            ...p,
            images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
            reviewsCount: p.reviews || 0,
            featured: p.isDeal || false,
            variations: p.variations || []
          }));
          setProducts(mappedProducts);
        }

        if (dbCustomers?.length > 0) {
          setCustomers(dbCustomers);
        }

        if (dbSettings) {
          setSiteSettings(dbSettings);
        }
      } catch (error) {
        addToast('Erro ao carregar dados do servidor. Usando dados locais.', 'warning');
      } finally {
        setIsLoading(false);
      }
    };

    const checkSession = async () => {
      const token = localStorage.getItem('nexus_token');
      if (token) {
        try {
          const user = await apiService.getMe();
          localStorage.setItem('nexus_user', JSON.stringify(user));
          setIsLoggedIn(true);
          setUserRole(user.role.toLowerCase());
          setUserName(user.name);
        } catch (error) {
          localStorage.removeItem('nexus_token');
          localStorage.removeItem('nexus_user');
        }
      }
    };

    loadInitialData();
    checkSession();
  }, []);

  const t = TRANSLATIONS[language];

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const formatPrice = (amount: number) => {
    const converted = amount * EXCHANGE_RATES[currency];
    const symbol = CURRENCY_SYMBOLS[currency];
    if (currency === 'AOA') {
      return `${converted.toLocaleString(language === 'pt' ? 'pt-AO' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
    }
    return `${symbol}${converted.toLocaleString(language === 'pt' ? 'pt-PT' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    companyName: 'Infodinâmica',
    nif: '5001771140',
    phone: '957511286',
    logo: '/src/assets/system_logo.jpg',
    address: 'Luanda, Luanda, Luanda, Angola',
    iban: 'AO06.0040.0000.5997.9683.10.192',
    swift: 'AO06',
    bankName: 'BANCO BAI',
    representativeName: 'Infodinâmica (24096)',
    taxEnabled: true,
    taxRate: 14
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'Infodinamica',
    siteLogo: '/src/assets/system_logo.jpg',
    siteDescription: 'Especialistas em Informática, Segurança e Soluções Tecnológicas.'
  });

  const toggleWishlist = (id: string) => {
    const isAdding = !wishlist.includes(id);
    setWishlist(prev => isAdding ? [...prev, id] : prev.filter(i => i !== id));
    addToast(isAdding ? 'Adicionado à Wishlist' : 'Removido da Wishlist', 'info');
  };

  const toggleCompare = (id: string) => setCompareList(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(0, 4));

  const addProduct = useCallback(async (product: Product) => {
    try {
      const savedProduct = await apiService.createProduct(product);
      setProducts(prev => [savedProduct, ...prev]);
      addToast('Produto criado com sucesso');
    } catch (error) {
      addToast('Erro ao criar produto', 'error');
    }
  }, [addToast]);

  const updateProduct = useCallback(async (product: Product) => {
    try {
      const updated = await apiService.updateProduct(product);
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      addToast('Produto atualizado com sucesso');
    } catch (error) {
      addToast('Erro ao atualizar produto', 'error');
    }
  }, [addToast]);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      await apiService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      addToast('Produto removido');
    } catch (error) {
      addToast('Erro ao remover produto', 'error');
    }
  }, [addToast]);

  const addCustomer = useCallback(async (customer: Customer) => {
    try {
      const savedCustomer = await apiService.createCustomer(customer);
      setCustomers(prev => [savedCustomer, ...prev]);
      addToast('Cliente registado com sucesso');
    } catch (error) {
      addToast('Erro ao registar cliente', 'error');
    }
  }, [addToast]);

  const updateCustomer = useCallback(async (customer: Customer) => {
    try {
      const updated = await apiService.updateCustomer(customer);
      setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
      addToast('Cliente atualizado com sucesso');
    } catch (error) {
      addToast('Erro ao atualizar cliente', 'error');
    }
  }, [addToast]);

  const deleteCustomer = useCallback(async (customerId: string) => {
    try {
      await apiService.deleteCustomer(customerId);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      addToast('Cliente removido');
    } catch (error) {
      addToast('Erro ao remover cliente', 'error');
    }
  }, [addToast]);

  const updateCustomerBalance = useCallback((customerId: string, amount: number) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, balance: c.balance + amount } : c));
  }, []);

  const updateSettings = useCallback(async (settings: SiteSettings) => {
    try {
      const updated = await apiService.updateSettings(settings);
      setSiteSettings(updated);
      addToast('Definições atualizadas com sucesso');
    } catch (error) {
      addToast('Erro ao atualizar definições', 'error');
    }
  }, [addToast]);

  const addStockMovement = useCallback((movement: Partial<StockMovement>) => {
    const newMovement: StockMovement = {
      id: `MOV-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      productId: movement.productId!,
      variationId: movement.variationId,
      type: movement.type!,
      quantity: movement.quantity!,
      reason: movement.reason || 'Ajuste Manual',
      user: movement.user || (userRole === 'admin' ? 'Administrador' : 'Sistema'),
      date: new Date().toISOString(),
    };
    setStockMovements(prev => [newMovement, ...prev]);
    
    setProducts(prev => prev.map(p => {
      if (p.id === newMovement.productId) {
        const change = (newMovement.type === MovementType.ENTRY) ? newMovement.quantity : -newMovement.quantity;
        
        let updatedVariations = p.variations;
        if (newMovement.variationId) {
          updatedVariations = p.variations.map(v => 
            v.id === newMovement.variationId ? { ...v, stock: Math.max(0, v.stock + change) } : v
          );
        }

        const newTotalStock = Math.max(0, p.stock + change);
        if (newTotalStock <= p.minStock && newMovement.type === MovementType.EXIT) {
          addToast(`Atenção: Stock baixo para ${p.name}`, 'warning');
        }

        return { ...p, stock: newTotalStock, variations: updatedVariations };
      }
      return p;
    }));
  }, [userRole, addToast]);

  const addToCart = useCallback((item: CartItem) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return;

    // Verificar stock disponível considerando variações
    const availableStock = item.variationId 
      ? (product.variations.find(v => v.id === item.variationId)?.stock || 0)
      : product.stock;

    addToast(`${item.name} adicionado ao carrinho`);
    setCart(prev => {
      const existing = prev.find(i => i.productId === item.productId && i.variationId === item.variationId);
      const currentQty = existing ? existing.quantity : 0;
      
      if (currentQty + item.quantity > availableStock) {
        // Redundant check if we already checked before calling setCart, but safe
        return prev;
      }

      if (existing) return prev.map(i => (i.productId === item.productId && i.variationId === item.variationId) ? { ...i, quantity: i.quantity + item.quantity } : i);
      return [...prev, item];
    });
  }, [products, addToast]);

  const removeFromCart = (id: string, varId?: string) => {
    setCart(prev => prev.filter(i => !(i.productId === id && i.variationId === varId)));
    addToast('Item removido do carrinho', 'info');
  };

  const updateCartQuantity = (id: string, q: number, varId?: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const availableStock = varId 
      ? (product.variations.find(v => v.id === varId)?.stock || 0)
      : product.stock;

    if (q > availableStock) {
      addToast(`Quantidade limitada ao stock disponível (${availableStock})`, 'warning');
      q = availableStock;
    }

    setCart(prev => prev.map(i => (i.productId === id && i.variationId === varId) ? { ...i, quantity: Math.max(1, q) } : i));
  };

  const placeOrder = useCallback((data: Partial<Order>) => {
    const orderItems = data.items || [...cart];
    
    // Verificação de segurança final de stock
    for (const item of orderItems) {
      const p = products.find(prod => prod.id === item.productId);
      const available = item.variationId 
        ? (p?.variations.find(v => v.id === item.variationId)?.stock || 0)
        : (p?.stock || 0);
      
      if (item.quantity > available) {
        addToast(`Erro: O produto ${item.name} esgotou durante o processo.`, 'error');
        return;
      }
    }

    const order: Order = {
      id: data.id || `ORD-${Math.floor(Math.random() * 90000) + 10000}`,
      customerId: data.customerId || 'c-guest',
      customerName: data.customerName || 'Cliente Direto',
      items: orderItems,
      total: data.total || orderItems.reduce((acc, i) => acc + (i.price * i.quantity), 0),
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      shippingAddress: data.shippingAddress || 'Levantamento em Loja',
      paymentMethod: data.paymentMethod || 'Dinheiro',
      source: data.source || 'direct',
      paidAmount: data.paidAmount,
      balanceUsed: data.balanceUsed
    };

    // PERSIST TO BACKEND
    apiService.createSale({
      invoiceNumber: order.id,
      customerId: order.customerId === 'c-guest' ? null : order.customerId,
      total: order.total,
      tax: order.total * 0.14, // Assuming 14% IVA
      discount: 0,
      paymentMethod: order.paymentMethod,
      items: order.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    }).catch(err => console.error('Failed to sync sale to backend:', err));

    orderItems.forEach(item => {
      addStockMovement({
        productId: item.productId,
        variationId: item.variationId,
        type: MovementType.EXIT,
        quantity: item.quantity,
        reason: `Venda ${order.id}`
      });
    });

    setOrders(prev => [order, ...prev]);
    if (!data.items) setCart([]);
    addToast(`Encomenda ${order.id} registada com sucesso`);
  }, [cart, products, addStockMovement, addToast]);

  const updateOrder = useCallback((orderId: string, orderData: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...orderData } : o));
  }, []);

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    addToast(`Encomenda ${id} marcada como ${status}`, 'info');
  };

  const updateInvoiceSettings = (settings: Partial<InvoiceSettings>) => setInvoiceSettings(prev => ({ ...prev, ...settings }));
  const updateSiteSettings = (settings: Partial<SiteSettings>) => setSiteSettings(prev => ({ ...prev, ...settings }));

  const toggleMLConnection = useCallback(() => {
    setIsMLConnected(prev => !prev);
    addToast(isMLConnected ? 'Mercado Livre Desconectado' : 'Mercado Livre Conectado', 'info');
  }, [isMLConnected, addToast]);

  const linkProductToML = useCallback((productId: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, mercadolivreId: `MLB${Math.floor(Math.random() * 1000000000)}`, syncStatus: 'synced', lastSync: new Date().toISOString() } : p));
    addToast('Produto vinculado ao Marketplace');
  }, [addToast]);

  const syncAllToML = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProducts(prev => prev.map(p => p.mercadolivreId ? { ...p, syncStatus: 'synced', lastSync: new Date().toISOString() } : p));
    addToast('Stock sincronizado com Mercado Livre');
  }, [addToast]);

  const fetchMLOrders = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    addToast('Novas encomendas importadas');
  }, [addToast]);

  const login = async (credentials: any) => { 
    try {
      const data = await apiService.login(credentials);
      localStorage.setItem('nexus_token', data.token);
      localStorage.setItem('nexus_user', JSON.stringify(data));
      setIsLoggedIn(true);
      setUserRole(data.role.toLowerCase());
      setUserName(data.name);
      addToast(`Bem-vindo, ${data.name}!`);
    } catch (error: any) {
      addToast(error.message || 'Erro ao fazer login', 'error');
      throw error;
    }
  };
  
  const logout = () => { 
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    setIsLoggedIn(false); 
    setUserRole(null);
    setUserName(null);
    addToast('Sessão terminada', 'info');
  };

  return (
    <AppContext.Provider value={{
      products, orders, customers, cart, wishlist, compareList, stockMovements, marketplaceLogs, isMLConnected, invoiceSettings, siteSettings,
      language, currency, editingOrder, toasts, t, setLanguage, setCurrency, formatPrice,
      addToCart, removeFromCart, updateCartQuantity, toggleWishlist, toggleCompare, placeOrder, updateOrder, setEditingOrder, updateOrderStatus, addStockMovement,
      addProduct, updateProduct, deleteProduct, addCustomer, updateCustomerBalance, updateInvoiceSettings, updateSiteSettings, addToast, removeToast,
      toggleMLConnection, linkProductToML, syncAllToML, fetchMLOrders,
      isLoggedIn, userRole, userName, login, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
