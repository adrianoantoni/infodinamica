const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

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
    if (!response.ok) throw new Error('Failed to create product');
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
  async getCustomers() {
    const response = await fetch(`${API_URL}/customers`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch customers');
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

  async deleteCustomer(id: string) {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete customer');
    return response.json();
  },

  // Sales
  async getSales() {
    const response = await fetch(`${API_URL}/sales`, {
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
  }
};
