import { API_URL } from './config';

const API_BASE_URL = API_URL;

export type ProfileContentKey = 'support' | 'delivery' | 'about';

export interface MultilingualValue {
  uz: string;
  ru: string;
}

export interface ProfileContentSection {
  title: MultilingualValue;
  description: MultilingualValue;
}

export interface ProfileSocialLink {
  type: string;
  label: string;
  value: string;
  url: string;
}

export interface ProfileContentResponse {
  _id: string;
  key: ProfileContentKey;
  title: MultilingualValue;
  description: MultilingualValue;
  phone?: string;
  socialLinks: ProfileSocialLink[];
  sections: ProfileContentSection[];
}

export interface AddressResponse {
  _id: string;
  title: string;
  address: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      // Telegram WebApp mainly uses 'token' key
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('auth-token') || 
                    localStorage.getItem('access_token');
      
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      if (response.status === 204 || response.status === 205) {
        return null as T;
      }

      const responseText = await response.text();
      if (!responseText) {
        return null as T;
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return JSON.parse(responseText) as T;
      }

      return responseText as T;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials: { username: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: { username: string; password: string; firstName: string; lastName?: string; phone?: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // Address methods
  async getAddresses<T = AddressResponse[]>(): Promise<T> {
    return this.request<T>('/addresses');
  }

  async getAddress(id: string): Promise<AddressResponse> {
    return this.request<AddressResponse>(`/addresses/${id}`);
  }

  async createAddress(addressData: {
    title: string;
    address: string;
    phone: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  }): Promise<AddressResponse> {
    return this.request<AddressResponse>('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(id: string, addressData: {
    title?: string;
    address?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  }): Promise<AddressResponse> {
    return this.request<AddressResponse>(`/addresses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(id: string): Promise<void> {
    await this.request(`/addresses/${id}`, {
      method: 'DELETE',
    });
  }

  async setDefaultAddress(id: string): Promise<AddressResponse> {
    return this.request<AddressResponse>(`/addresses/${id}/set-default`, {
      method: 'POST',
    });
  }

  // Profile content methods
  async getProfileContent(key: ProfileContentKey): Promise<ProfileContentResponse> {
    return this.request(`/profile-content/${key}`);
  }

  async getSupportContent(): Promise<ProfileContentResponse> {
    return this.getProfileContent('support');
  }

  async getDeliveryContent(): Promise<ProfileContentResponse> {
    return this.getProfileContent('delivery');
  }

  async getAboutContent(): Promise<ProfileContentResponse> {
    return this.getProfileContent('about');
  }

  // Product methods
  async getProducts(params?: { isNew?: boolean; isPopular?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params?.isNew) searchParams.append('isNew', 'true');
    if (params?.isPopular) searchParams.append('isPopular', 'true');
    
    const query = searchParams.toString();
    return this.request(`/products${query ? `?${query}` : ''}`);
  }

  async getBanners() {
    return this.request('/banners');
  }

  async getCategories() {
    return this.request('/categories');
  }
}

export const apiService = new ApiService();
