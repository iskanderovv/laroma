const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export const getImageUrl = (path: string | undefined) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`[API] Fetching: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors',
    });

    console.log(`[API] Response status for ${endpoint}:`, response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[API] Error response for ${endpoint}:`, errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      } catch (e) {
        throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
      }
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error: any) {
    console.error(`[API] Fetch Error [${endpoint}]:`, error.message || error);
    if (error.message === 'Load failed' || error.message === 'Failed to fetch') {
      console.error(`[API] Network error - Backend may not be running at ${BASE_URL}`);
    }
    throw error;
  }
};

export const uploadAuthenticatedFile = async (endpoint: string, file: File) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
    credentials: 'include',
    mode: 'cors',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    } catch {
      throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
    }
  }

  return response.json() as Promise<{ url: string }>;
};
