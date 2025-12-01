const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const api = {
  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return response.json();
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    designation: string;
    department: string;
    rights: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Registration failed');
    }
    
    return response.json();
  },

  async getInventory(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/inventory/getAllItem`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch inventory');
    }
    
    return response.json();
  },

  async addInventoryItem(token: string, item: any) {
    const response = await fetch(`${API_BASE_URL}/api/inventory/addItem`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add item');
    }
    
    return response.json();
  },

  async updateInventoryItem(token: string, id: number, item: any) {
    const response = await fetch(`${API_BASE_URL}/api/inventory/updateItem/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update item');
    }
    
    return response.json();
  },

  async deleteInventoryItem(token: string, id: number) {
    const response = await fetch(`${API_BASE_URL}/api/inventory/deleteItem/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete item');
    }
    
    return response.text();
  },

  async getOrders(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/orders/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    return response.json();
  },

  async placeOrder(token: string, order: any) {
    const response = await fetch(`${API_BASE_URL}/api/orders/place`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    
    if (!response.ok) {
      throw new Error('Failed to place order');
    }
    
    return response.json();
  },

  async getStaff(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/staff/getAllStaff`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch staff');
    }
    
    return response.json();
  },

  async addStaff(token: string, staff: any) {
    const response = await fetch(`${API_BASE_URL}/api/staff/addStaff`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staff),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add staff');
    }
    
    return response.json();
  },

  async updateStaff(token: string, id: number, staff: any) {
    const response = await fetch(`${API_BASE_URL}/api/staff/updateStaff/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staff),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update staff');
    }
    
    return response.json();
  },

  async deleteStaff(token: string, id: number) {
    const response = await fetch(`${API_BASE_URL}/api/staff/deleteStaff/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete staff');
    }
    
    return response.text();
  },

  async sendEmail(token: string, emailData: { recipient: string; subject: string; message: string }) {
    const response = await fetch(`${API_BASE_URL}/api/admin/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    
    return response.json();
  },

  async exportInventoryCsv(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/inventory/export/csv`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }
    
    return response.blob();
  },
};
