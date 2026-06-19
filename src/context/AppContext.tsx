
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product, Order, CartItem, StockMovement, OrderStatus, MovementType, MarketplaceLog, Language, Currency, Customer, User } from '@/types';
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
  stockMovementsTotal: number;
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
  placeOrder: (orderData: Partial<Order> & { docType?: string, skipSync?: boolean, discountAmount?: number, isTaxExempt?: boolean, taxExemptionReason?: string }) => Promise<Order | null>;
  updateOrder: (orderId: string, orderData: Partial<Order>) => void;
  setEditingOrder: (order: Order | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addStockMovement: (movement: Partial<StockMovement>) => Promise<void>;
  fetchStockMovements: (params?: { productId?: string; type?: string; page?: number }) => Promise<void>;
  fetchCustomerOrders: (customerId: string) => Promise<void>;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomerBalance: (customerId: string, amount: number, type?: 'TOPUP' | 'DEDUCT') => Promise<any>;
  updateInvoiceSettings: (settings: Partial<InvoiceSettings>) => void;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  toggleMLConnection: () => void;
  linkProductToML: (productId: string) => void;
  syncAllToML: () => Promise<void>;
  fetchMLOrders: () => Promise<void>;
  isLoggedIn: boolean;
  userRole: 'admin' | 'gerente' | 'vendedor' | 'customer' | null;
  userName: string | null;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  user: User | null;
  fetchOrders: (params?: { search?: string; status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => Promise<{ sales: any[], total: number, page: number, totalPages: number }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [stockMovementsTotal, setStockMovementsTotal] = useState(0);
  const [marketplaceLogs, setMarketplaceLogs] = useState<MarketplaceLog[]>([]);
  const [isMLConnected, setIsMLConnected] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'gerente' | 'vendedor' | 'customer' | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [language, setLanguage] = useState<Language>('pt');
  const [currency, setCurrency] = useState<Currency>('AOA');
  const [isLoading, setIsLoading] = useState(true);

  // --- API DATA FETCHING ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch data individually to handle failures gracefully
        try {
          const dbProducts = await apiService.getProducts();
          if (dbProducts?.length > 0) {
            const mappedProducts = dbProducts.map((p: any) => ({
              ...p,
              images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
              reviewsCount: p.reviews || 0,
              featured: p.isDeal || false,
              variations: p.variations || []
            }));
            setProducts(mappedProducts);
          }
        } catch (e) {
          console.error("Failed to fetch products:", e);
        }

        try {
          const dbCustomers = await apiService.getCustomers();
          if (dbCustomers?.length > 0) {
            setCustomers(dbCustomers);
          }
        } catch (e) {
          console.error("Failed to fetch customers (likely unauthorized):", e);
        }

        try {
          const dbSettings = await apiService.getSettings();
           if (dbSettings) {
             const logoPath = dbSettings.siteLogo?.replace('/src/assets/', '/') || '/system_logo.jpg';
             setSiteSettings({
                siteName: dbSettings.siteName || 'Infodinamica',
                siteLogo: logoPath,
                siteDescription: dbSettings.siteDescription || ''
             });
             setInvoiceSettings(prev => ({
                ...prev,
                companyName: dbSettings.siteName || prev.companyName,
                nif: dbSettings.nif || prev.nif,
                phone: dbSettings.phone || prev.phone,
                logo: logoPath,
                address: dbSettings.address || prev.address,
                iban: dbSettings.bankAccount || prev.iban,
                bankName: dbSettings.bankName || prev.bankName,
             }));
          }
        } catch (e) {
          console.error("Failed to fetch settings:", e);
        }

        // Fetch stock movements from DB
        try {
          const result = await apiService.getStockMovements({ limit: 100 });
          if (result?.movements) {
            setStockMovements(result.movements.map((m: any) => ({
              id: m.id,
              productId: m.productId,
              type: m.type === 'ENTRY' ? MovementType.ENTRY : m.type === 'EXIT' ? MovementType.EXIT : MovementType.ADJUSTMENT,
              quantity: m.quantity,
              reason: m.reason,
              user: m.user,
              date: m.createdAt
            })));
            setStockMovementsTotal(result.total || 0);
          }
        } catch (e) {
          console.error("Failed to fetch stock movements:", e);
        }
      } catch (error) {
        addToast('Erro crítico ao ligar ao servidor.', 'error');
      } finally {
        // isLoading is now managed in fetchData()
      }
    };

    const checkSession = async () => {
      const token = localStorage.getItem('nexus_token');
      if (token) {
        try {
          const userData = await apiService.getMe();
          localStorage.setItem('nexus_user', JSON.stringify(userData));
          setIsLoggedIn(true);
          setUserRole(userData.role.toLowerCase());
          setUserName(userData.name);
          setUser(userData);
        } catch (error: any) {
          console.error('Session check failed:', error);
          if (error.status === 401 || error.message?.includes('401')) {
            logout();
          }
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    const fetchData = async () => {
      try {
        await checkSession();
        await loadInitialData();
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
    logo: '/system_logo.jpg',
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
    siteLogo: '/system_logo.jpg',
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
      const mapped = {
        ...savedProduct,
        images: Array.isArray(savedProduct.images) ? savedProduct.images : (savedProduct.image ? [savedProduct.image] : []),
        reviewsCount: savedProduct.reviews || 0,
        featured: savedProduct.isDeal || false,
        variations: Array.isArray(savedProduct.variations) ? savedProduct.variations : []
      };
      setProducts(prev => [mapped, ...prev]);
      addToast('Produto criado com sucesso');
    } catch (error: any) {
      addToast(error.message || 'Erro ao criar produto', 'error');
      throw error;
    }
  }, [addToast]);


  const updateProduct = useCallback(async (product: Product) => {
    try {
      const updated = await apiService.updateProduct(product);
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      addToast('Produto atualizado com sucesso');
    } catch (error: any) {
      addToast(error.message || 'Erro ao atualizar produto', 'error');
      throw error; // Relançar para o chamador saber que falhou
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

  const updateCustomerBalance = useCallback(async (customerId: string, amount: number, type: 'TOPUP' | 'DEDUCT' = 'TOPUP') => {
    try {
      const result = await apiService.updateCustomerBalance(customerId, amount, type);
      
      // Update local state
      setCustomers(prev => prev.map(c => c.id === customerId ? result : c));
      addToast(`Saldo de ${result.name} atualizado: ${formatPrice(result.balance)}`, 'success');
      return result;
    } catch (error) {
      addToast('Erro ao atualizar saldo do cliente', 'error');
      throw error;
    }
  }, [addToast, formatPrice]);

  const updateSettings = useCallback(async (settings: SiteSettings) => {
    try {
      const updated = await apiService.updateSettings(settings);
      setSiteSettings(updated);
      addToast('Definições atualizadas com sucesso');
    } catch (error) {
      addToast('Erro ao atualizar definições', 'error');
    }
  }, [addToast]);

  const fetchStockMovements = useCallback(async (params?: { productId?: string; type?: string; page?: number }) => {
    try {
      const result = await apiService.getStockMovements({ ...params, limit: 100 });
      if (result?.movements) {
        setStockMovements(result.movements.map((m: any) => ({
          id: m.id,
          productId: m.productId,
          type: m.type === 'ENTRY' ? MovementType.ENTRY : m.type === 'EXIT' ? MovementType.EXIT : MovementType.ADJUSTMENT,
          quantity: m.quantity,
          reason: m.reason,
          user: m.user,
          date: m.createdAt
        })));
        setStockMovementsTotal(result.total || 0);
      }
    } catch (e) {
      console.error('Failed to fetch stock movements:', e);
    }
  }, []);

  const addStockMovement = useCallback(async (movement: Partial<StockMovement>) => {
    const movementType = movement.type === MovementType.ENTRY ? 'ENTRY' : 'EXIT';
    
    try {
      const result = await apiService.createStockMovement({
        productId: movement.productId!,
        type: movementType,
        quantity: movement.quantity!,
        reason: movement.reason || 'Ajuste Manual'
      });

      // Update local product stock
      setProducts(prev => prev.map(p => {
        if (p.id === movement.productId) {
          const newStock = result.newStock;
          if (newStock <= p.minStock && movementType === 'EXIT') {
            addToast(`Atenção: Stock baixo para ${p.name}`, 'warning');
          }
          return { ...p, stock: newStock };
        }
        return p;
      }));

      // Add to local movements
      const newMovement: StockMovement = {
        id: result.movement.id,
        productId: movement.productId!,
        type: movement.type!,
        quantity: movement.quantity!,
        reason: movement.reason || 'Ajuste Manual',
        user: result.movement.user,
        date: result.movement.createdAt,
      };
      setStockMovements(prev => [newMovement, ...prev]);
      setStockMovementsTotal(prev => prev + 1);

    } catch (error: any) {
      addToast(error.message || 'Erro ao registar movimentação de stock', 'error');
      throw error;
    }
  }, [addToast]);

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

  const placeOrder = useCallback(async (data: Partial<Order> & { docType?: string, skipSync?: boolean, discountAmount?: number, isTaxExempt?: boolean, taxExemptionReason?: string }) => {
    const orderItems = data.items || [...cart];
    
    // Verificação de segurança final de stock
    for (const item of orderItems) {
      const p = products.find(prod => prod.id === item.productId);
      const available = item.variationId 
        ? (p?.variations.find(v => v.id === item.variationId)?.stock || 0)
        : (p?.stock || 0);
      
      if (item.quantity > available) {
        addToast(`Erro: O produto ${item.name} esgotou durante o processo.`, 'error');
        return null;
      }
    }

    const initialSubtotal = orderItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const taxRate = invoiceSettings.taxEnabled && !data.isTaxExempt ? (invoiceSettings.taxRate / 100) : 0;
    const discount = data.discountAmount || 0;
    const finalTax = (initialSubtotal - discount) * taxRate;
    const finalTotal = Math.max(0, initialSubtotal - discount + finalTax);

    let recordedSale: any = null;
    let finalDocId = data.id || `ORD-${Math.floor(Math.random() * 90000) + 10000}`;

    if (!data.skipSync) {
      try {
        recordedSale = await apiService.createSale({
          docType: data.docType || 'FATURA',
          customerId: data.customerId === 'c-guest' ? null : data.customerId,
          total: finalTotal,
          tax: finalTax,
          discount: discount,
          isTaxExempt: data.isTaxExempt,
          taxExemptionReason: data.taxExemptionReason,
          paymentMethod: data.paymentMethod || 'Dinheiro',
          items: orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        });
        finalDocId = recordedSale.invoiceNumber;
      } catch (err: any) {
        throw new Error(err.message || 'Falha ao criar venda no servidor');
      }
    }

    const order: Order = {
      id: finalDocId,
      customerId: data.customerId || 'c-guest',
      customerName: data.customerName || 'Cliente Direto',
      items: orderItems,
      total: data.total || finalTotal,
      tax: finalTax,
      status: data.docType === 'PROFORMA' ? OrderStatus.PENDING : OrderStatus.CONFIRMED,
      createdAt: recordedSale?.date || new Date().toISOString(),
      shippingAddress: data.shippingAddress || 'Levantamento em Loja',
      paymentMethod: data.paymentMethod || 'Dinheiro',
      source: data.source || 'direct',
      paidAmount: data.paidAmount,
      balanceUsed: data.balanceUsed,
      docType: data.docType || 'FATURA',
      discountAmount: discount,
      isTaxExempt: data.isTaxExempt,
      taxExemptionReason: data.taxExemptionReason
    } as any;

    // Backend already creates StockMovements in the sale transaction
    // Just update local product stock to reflect the sale
    if (!data.skipSync) {
      setProducts(prev => prev.map(p => {
        const soldItem = orderItems.find(i => i.productId === p.id);
        if (soldItem) {
          const newStock = Math.max(0, p.stock - soldItem.quantity);
          if (newStock <= p.minStock) {
            addToast(`Atenção: Stock baixo para ${p.name}`, 'warning');
          }
          return { ...p, stock: newStock };
        }
        return p;
      }));
    }

    setOrders(prev => [order, ...prev]);
    if (!data.items) setCart([]);
    addToast(`${data.docType === 'PROFORMA' ? 'Proforma' : 'Encomenda'} ${order.id} registada com sucesso`);
    
    return order;
  }, [cart, products, addToast]);

  const updateOrder = useCallback((orderId: string, orderData: Partial<Order>) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...orderData } : o));
  }, []);

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    addToast(`Encomenda ${id} marcada como ${status}`, 'info');
  };

  const updateInvoiceSettings = async (settings: Partial<InvoiceSettings>) => {
    const newSettings = { ...invoiceSettings, ...settings };
    setInvoiceSettings(newSettings);
    try {
      await apiService.updateSettings({
        siteName: newSettings.companyName,
        nif: newSettings.nif,
        phone: newSettings.phone,
        siteLogo: newSettings.logo,
        address: newSettings.address,
        bankAccount: newSettings.iban,
        bankName: newSettings.bankName
      });
      addToast('Configurações de faturação atualizadas');
    } catch (error) {
      addToast('Erro ao persistir configurações', 'error');
    }
  };

  const updateSiteSettings = async (settings: Partial<SiteSettings>) => {
    const newSettings = { ...siteSettings, ...settings };
    setSiteSettings(newSettings);
    try {
      await apiService.updateSettings({
        siteName: newSettings.siteName,
        siteLogo: newSettings.siteLogo,
        siteDescription: newSettings.siteDescription
      });
      addToast('Configurações do site atualizadas');
    } catch (error) {
      addToast('Erro ao persistir configurações', 'error');
    }
  };

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
      setUser(data);
      addToast(`Bem-vindo, ${data.name}!`);
    } catch (error: any) {
      addToast(error.message || 'Erro ao fazer login', 'error');
      throw error;
    }
  };
  
  const logout = useCallback(() => { 
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    setIsLoggedIn(false); 
    setUserRole(null);
    setUserName(null);
    setUser(null);
    addToast('Sessão terminada', 'info');
    window.location.hash = 'login';
  }, [addToast]);

  const fetchCustomerOrders = useCallback(async (customerId: string) => {
    try {
      const data = await apiService.getCustomerHistory(customerId);
      const mappedOrders = data.map((s: any) => ({
        ...s,
        id: s.invoiceNumber || s.id,
        customerName: s.customer?.name || user?.name || 'Cliente',
        items: s.items.map((item: any) => ({
          ...item,
          productId: item.productId,
          name: item.product?.name || 'Produto',
          image: item.product?.images?.[0] || item.product?.image || '',
          price: item.price,
          quantity: item.quantity
        }))
      }));
      setOrders(mappedOrders);
    } catch (error) {
      console.error("Failed to fetch customer orders:", error);
      addToast("Erro ao carregar seu histórico", "error");
    }
  }, [user, addToast]);

  const fetchOrders = async (params?: { search?: string; status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    try {
      const data = await apiService.getSales(params);
      return {
        sales: data.sales.map((s: any) => ({
           ...s,
           customerName: s.customer?.name || 'CONSUMIDOR FINAL',
        })),
        total: data.total,
        page: data.page,
        totalPages: data.totalPages
      };
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      addToast("Erro ao carregar vendas", "error");
      return { sales: [], total: 0, page: 1, totalPages: 1 };
    }
  };

  return (
    <AppContext.Provider value={{
      products, orders, customers, cart, wishlist, compareList, stockMovements, stockMovementsTotal, marketplaceLogs, isMLConnected, invoiceSettings, siteSettings,
      language, currency, editingOrder, toasts, t, setLanguage, setCurrency, formatPrice,
      addToCart, removeFromCart, updateCartQuantity, toggleWishlist, toggleCompare, placeOrder, updateOrder, setEditingOrder, updateOrderStatus, addStockMovement, fetchStockMovements,
      addProduct, updateProduct, deleteProduct, addCustomer, updateCustomerBalance, updateInvoiceSettings, updateSiteSettings, addToast, removeToast,
      toggleMLConnection, linkProductToML, syncAllToML, fetchMLOrders,
      isLoggedIn, userRole, userName, login, logout, isLoading, user, fetchOrders, fetchCustomerOrders
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
