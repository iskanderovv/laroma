import { getAdminToken } from '@/lib/admin/auth';
import type {
  AdminDashboardStats,
  AdminLoginResponse,
  AdminProfile,
  AdminRecentOrder,
  AdminTopProduct,
  AdminUser,
} from '@/lib/admin/types';

interface AdminRequestOptions extends RequestInit {
  auth?: boolean;
}

function getApiBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (apiUrl?.startsWith('http')) {
    return apiUrl;
  }

  if (backendUrl) {
    return `${backendUrl.replace(/\/$/, '')}/api`;
  }

  return 'https://api.laroma.akbar.works/api';
}

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
  }
}

export async function adminRequest<T>(
  endpoint: string,
  options: AdminRequestOptions = {},
): Promise<T> {
  const { auth = true, headers, ...restOptions } = options;
  const token = auth ? getAdminToken() : null;

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new AdminApiError(
      payload?.message || "So‘rovni bajarib bo‘lmadi",
      response.status,
    );
  }

  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

export const adminApi = {
  login(payload: { email: string; password: string }) {
    return adminRequest<AdminLoginResponse>('/auth/admin/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify(payload),
    });
  },
  getProfile() {
    return adminRequest<AdminProfile>('/auth/admin/profile');
  },
  getDashboardStats() {
    return adminRequest<AdminDashboardStats>('/admin/dashboard/stats');
  },
  getTopProducts(limit = 5) {
    return adminRequest<AdminTopProduct[]>(`/admin/dashboard/top-products?limit=${limit}`);
  },
  getRecentOrders(limit = 8) {
    return adminRequest<AdminRecentOrder[]>(`/admin/dashboard/recent-orders?limit=${limit}`);
  },
  getDashboardAnalytics() {
    return adminRequest<any>(`/admin/dashboard/analytics`);
  },
  getOrders() {
    return adminRequest<AdminRecentOrder[]>('/orders');
  },
  updateOrderStatus(id: string, status: string) {
    return adminRequest<AdminRecentOrder>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  getCategories(params: { page?: number; limit?: number; search?: string } = {}) {
    const query = new URLSearchParams()
    if (params.page) query.append("page", String(params.page))
    if (params.limit) query.append("limit", String(params.limit))
    if (params.search) query.append("search", params.search)

    return adminRequest<{ categories: any[]; total: number }>(`/categories?${query.toString()}`)
  },
  getCategory(id: string) {
    return adminRequest<any>(`/categories/${id}`)
  },
  createCategory(payload: any) {
    return adminRequest<any>("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  updateCategory(id: string, payload: any) {
    return adminRequest<any>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },
  deleteCategory(id: string) {
    return adminRequest<any>(`/categories/${id}`, {
      method: "DELETE",
    })
  },
  getBrands(params: { page?: number; limit?: number; search?: string } = {}) {
    const query = new URLSearchParams()
    if (params.page) query.append("page", String(params.page))
    if (params.limit) query.append("limit", String(params.limit))
    if (params.search) query.append("search", params.search)

    return adminRequest<{ brands: any[]; total: number }>(`/brands?${query.toString()}`)
  },
  getBrand(id: string) {
    return adminRequest<any>(`/brands/${id}`)
  },
  createBrand(payload: any) {
    return adminRequest<any>("/brands", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  updateBrand(id: string, payload: any) {
    return adminRequest<any>(`/brands/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },
  deleteBrand(id: string) {
    return adminRequest<any>(`/brands/${id}`, {
      method: "DELETE",
    })
  },
  getProducts(params: { page?: number; limit?: number; search?: string } = {}) {
    const query = new URLSearchParams()
    if (params.page) query.append("page", String(params.page))
    if (params.limit) query.append("limit", String(params.limit))
    if (params.search) query.append("search", params.search)

    return adminRequest<{ products: any[]; total: number }>(`/products/admin/all?${query.toString()}`)
  },
  getProduct(id: string) {
    return adminRequest<any>(`/products/${id}`)
  },
  createProduct(payload: any) {
    return adminRequest<any>("/products", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  updateProduct(id: string, payload: any) {
    return adminRequest<any>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },
  deleteProduct(id: string) {
    return adminRequest<any>(`/products/${id}`, {
      method: "DELETE",
    })
  },
  getBanners(params: { page?: number; limit?: number } = {}) {
    const query = new URLSearchParams()
    query.append("admin", "true")
    if (params.page) query.append("page", String(params.page))
    if (params.limit) query.append("limit", String(params.limit))

    return adminRequest<{ banners: any[]; total: number }>(`/banners?${query.toString()}`)
  },
  getBanner(id: string) {
    return adminRequest<any>(`/banners/${id}`)
  },
  createBanner(payload: any) {
    return adminRequest<any>("/banners", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  updateBanner(id: string, payload: any) {
    return adminRequest<any>(`/banners/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },
  deleteBanner(id: string) {
    return adminRequest<any>(`/banners/${id}`, {
      method: "DELETE",
    })
  },
  uploadImage(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    const token = getAdminToken()
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.laroma.akbar.works"

    return fetch(`${backendUrl}/api/uploads`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error("Yuklashda xato")
      return res.json()
    })
  },
  getUsers(params: { page?: number; limit?: number; search?: string } = {}) {
    const query = new URLSearchParams()
    if (params.page) query.append("page", String(params.page))
    if (params.limit) query.append("limit", String(params.limit))
    if (params.search) query.append("search", params.search)

    return adminRequest<{ users: AdminUser[]; total: number }>(`/users?${query.toString()}`)
  },
  getProfileContent(key: string) {
    return adminRequest<any>(`/profile-content/${key}`)
  },
  updateProfileContent(key: string, payload: any) {
    return adminRequest<any>(`/profile-content/${key}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },
  sendBroadcast(payload: any) {
    return adminRequest<any>("/admin/broadcast", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
};
