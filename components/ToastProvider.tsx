'use client';

import * as React from 'react';

type AppToastOptions = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastContextValue = {
  showToast: (options: AppToastOptions) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useAppToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error('useAppToast must be used within ToastProvider');
  }

  return context;
}

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toast, setToast] = React.useState<AppToastOptions | null>(null);
  const timeoutRef = React.useRef<number | null>(null);

  const clearTimer = React.useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const hideToast = React.useCallback(() => {
    clearTimer();
    setToast(null);
  }, [clearTimer]);

  const showToast = React.useCallback(
    (options: AppToastOptions) => {
      clearTimer();
      setToast(options);
      timeoutRef.current = window.setTimeout(() => {
        setToast(null);
      }, 3200);
    },
    [clearTimer],
  );

  React.useEffect(() => () => clearTimer(), [clearTimer]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast ? (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-[100] flex w-full max-w-lg -translate-x-1/2 justify-center px-4">
          <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{toast.title}</p>
              {toast.description ? (
                  <p className="mt-0.5 truncate text-xs leading-4 text-gray-500">{toast.description}</p>
              ) : null}
              </div>

              {toast.actionLabel && toast.onAction ? (
                <button
                  onClick={() => {
                    toast.onAction?.();
                    hideToast();
                  }}
                  className="shrink-0 rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors active:opacity-70"
                >
                  {toast.actionLabel}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}
