// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getHeaders = () => {
  const token = localStorage.getItem('nexus_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const apiService = {
  // Auth
  async login(credentials: any) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  async register(data: any) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Falha ao criar conta');
    }
    return response.json();
  },
  
  async forgotPassword(email: string) {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao enviar email de recuperação');
    }
    return response.json();
  },

  async resetPassword(token: string, password: any) {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao redefinir a senha');
    }
    return response.json();
  },

  // Staff Users
  async getUsers() {
    const response = await fetch(`${API_URL}/users`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async createUser(userData: any) {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  async updateUser(user: any) {
    const response = await fetch(`${API_URL}/users/${user.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(user),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  async deleteUser(id: string) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
  },

  // Products
  async getProducts() {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async createProduct(productData: any) {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Failed to create product' }));
      throw new Error(err.error || 'Failed to create product');
    }
    return response.json();
  },

  async updateProduct(product: any) {
    const response = await fetch(`${API_URL}/products/${product.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  },

  async deleteProduct(id: string) {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return response.json();
  },

  // Customers
  async getCustomers(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await fetch(`${API_URL}/customers${query}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch customers');
    return response.json();
  },

  async getTopCustomers() {
    const response = await fetch(`${API_URL}/customers/top`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch top customers');
    return response.json();
  },

  async getCustomerHistory(customerId: string) {
    const response = await fetch(`${API_URL}/customers/${customerId}/history`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch customer history');
    return response.json();
  },

  async createCustomer(customerData: any) {
    const response = await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(customerData),
    });
    if (!response.ok) throw new Error('Failed to create customer');
    return response.json();
  },

  async updateCustomer(customer: any) {
    const response = await fetch(`${API_URL}/customers/${customer.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(customer),
    });
    if (!response.ok) throw new Error('Failed to update customer');
    return response.json();
  },

  async updateCustomerBalance(id: string, amount: number, type: 'TOPUP' | 'DEDUCT' = 'TOPUP') {
    const response = await fetch(`${API_URL}/customers/${id}/balance`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ amount, type }),
    });
    if (!response.ok) throw new Error('Failed to update balance');
    return response.json();
  },

  async deleteCustomer(id: string) {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete customer');
    return response.json();
  },

  // Sales
  async getSales(params?: { search?: string; status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    
    const queryStr = query.toString() ? `?${query.toString()}` : '';
    const response = await fetch(`${API_URL}/sales${queryStr}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch sales');
    return response.json();
  },

  async createSale(saleData: any) {
    const response = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(saleData),
    });
    if (!response.ok) throw new Error('Failed to create sale');
    return response.json();
  },

  async getReports(params?: { year?: number; startDate?: string; endDate?: string }) {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const response = await fetch(`${API_URL}/reports${query}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch reports');
    return response.json();
  },

  async getAuditLogs(params?: { page?: number; limit?: number; userId?: string; startDate?: string; endDate?: string }) {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const response = await fetch(`${API_URL}/audit${query}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
  },

  async getOnlineUsers() {
    const response = await fetch(`${API_URL}/users/online`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch online users');
    return response.json();
  },

  // 8. Chat
  async sendMessage(content: string, receiverId: string) {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content, receiverId }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  async getMessages(userId: string) {
    const response = await fetch(`${API_URL}/chat/${userId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  },

  async getAdminConversations() {
    const response = await fetch(`${API_URL}/chat/admin/conversations`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch conversations');
    return response.json();
  },

  // 9. Payments
  async submitPayment(data: { saleId: string; amount: number; notes: string; receipt: File }) {
    const formData = new FormData();
    formData.append('saleId', data.saleId);
    formData.append('amount', data.amount.toString());
    formData.append('notes', data.notes);
    formData.append('receipt', data.receipt);

    const token = localStorage.getItem('nexus_token');
    const response = await fetch(`${API_URL}/payments/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to submit payment');
    return response.json();
  },

  async getPendingPayments() {
    const response = await fetch(`${API_URL}/payments/pending`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch pending payments');
    return response.json();
  },

  async verifyPayment(id: string, status: 'APPROVED' | 'REJECTED', adminNotes: string) {
    const response = await fetch(`${API_URL}/payments/${id}/verify`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, adminNotes }),
    });
    if (!response.ok) throw new Error('Failed to verify payment');
    return response.json();
  },

  // 10. Profile
  async updateProfile(data: { name: string; email: string; phone?: string; address?: string; nif?: string }) {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  async getMe() {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  async getSettings() {
    const response = await fetch(`${API_URL}/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  async updateSettings(settingsData: any) {
    const response = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settingsData),
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
  },

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('nexus_token');
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    });
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  },

  // Stock Movements
  async getStockMovements(params?: { productId?: string; type?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.productId) query.set('productId', params.productId);
    if (params?.type) query.set('type', params.type);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const queryStr = query.toString() ? `?${query.toString()}` : '';
    const response = await fetch(`${API_URL}/stock-movements${queryStr}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch stock movements');
    return response.json();
  },

  async createStockMovement(data: { productId: string; type: string; quantity: number; reason: string }) {
    const response = await fetch(`${API_URL}/stock-movements`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create stock movement');
    }
    return response.json();
  },

  async getLowStockProducts() {
    const response = await fetch(`${API_URL}/stock-movements/low-stock`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch low stock products');
    return response.json();
  }
};
