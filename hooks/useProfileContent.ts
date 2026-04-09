'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  apiService,
  ProfileContentKey,
  ProfileContentResponse,
} from '@/lib/api/apiService';

export function useProfileContent(key: ProfileContentKey) {
  const [content, setContent] = useState<ProfileContentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getProfileContent(key);
      setContent(data);
    } catch (err) {
      console.error(`Error loading profile content (${key}):`, err);
      setError('Kontentni yuklashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return {
    content,
    isLoading,
    error,
    refetch: loadContent,
  };
}
