'use server';

import { API_URL } from '@/lib/api/config';

const BACKEND_URL = API_URL;

export async function loginAction(initData: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Login failed' };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Login action error:', error.message);
    return { success: false, error: error.message };
  }
}

// Profilni yangilash uchun ham Server Action (Mixed Content dan qochish uchun)
export async function updateProfileAction(userId: string, token: string, userData: any) {
  try {
    const response = await fetch(`${BACKEND_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Update failed' };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
