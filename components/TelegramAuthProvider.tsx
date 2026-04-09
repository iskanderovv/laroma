'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials, setLoading, setError } from '@/store/slices/authSlice';
import { loginAction } from '@/app/actions/auth';

export default function TelegramAuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);

    const initAuth = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        const WebAppSDK = await import('@twa-dev/sdk');
        const WebApp = WebAppSDK.default;
        
        WebApp.ready();
        WebApp.expand();
        
        const initData = WebApp.initData;
        
        if (initData) {
          dispatch(setLoading(true));
          // Server Action orqali login (Mixed Content bo'lmaydi)
          const result = await loginAction(initData);
          
          if (result.success && result.data) {
            const { user, access_token } = result.data;
            
            if (access_token) {
              localStorage.setItem('token', access_token);
              
              let photo_url = null;
              try {
                const urlParams = new URLSearchParams(initData);
                const userString = urlParams.get('user');
                if (userString) {
                  photo_url = JSON.parse(userString).photo_url;
                }
              } catch (e) {}

              dispatch(setCredentials({ 
                user: { ...user, photo_url }, 
                token: access_token 
              }));
            }
          } else {
            console.error('Server Action Login Error:', result.error);
            dispatch(setError(result.error || 'Login failed'));
          }
        }
      } catch (err: any) {
        console.warn('Auth process interrupted:', err.message);
      } finally {
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [dispatch]);

  if (!isReady) return null;

  return <>{children}</>;
}
