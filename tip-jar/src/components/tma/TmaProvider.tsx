'use client';

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  init as initSDK,
  initData,
  miniApp,
  themeParams,
  viewport,
  backButton,
  isTMA,
} from '@tma.js/sdk-react';

interface TmaContextValue {
  isInTelegram: boolean;
  isInitialized: boolean;
}

const TmaContext = createContext<TmaContextValue>({
  isInTelegram: false,
  isInitialized: false,
});

export function useTma() {
  return useContext(TmaContext);
}

export function TmaProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false);
  const [isInTelegram, setIsInTelegram] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const initializeSdk = async () => {
      try {
        // Check if running inside Telegram
        const isTelegramEnv = isTMA();

        if (!isMounted) return;

        setIsInTelegram(isTelegramEnv);

        // Only initialize Telegram SDK if actually in Telegram
        if (!isTelegramEnv) {
          console.log(
            '[App] Running in browser mode - Telegram features disabled'
          );
          setInitialized(true);
          return;
        }

        // Initialize the SDK
        initSDK();

        // Mount components
        backButton.mount();
        initData.restore();

        try {
          miniApp.mount();
          themeParams.bindCssVars();
        } catch {
          // miniApp not available
        }

        // Viewport mount with timeout (can hang on desktop)
        try {
          await Promise.race([
            viewport.mount(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Viewport mount timeout')), 2000)
            ),
          ]);
          viewport.bindCssVars();
        } catch {
          // viewport not available or timed out
        }

        // Signal ready
        try {
          miniApp.ready();
        } catch {
          // miniApp.ready not available
        }

        if (isMounted) {
          setInitialized(true);
        }
      } catch (err) {
        console.error('Failed to initialize Telegram SDK:', err);
        // Still mark as initialized to render children
        if (isMounted) {
          setInitialized(true);
        }
      }
    };

    initializeSdk();

    return () => {
      isMounted = false;
    };
  }, []);

  // Show loading while initializing
  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <TmaContext.Provider value={{ isInTelegram, isInitialized: initialized }}>
      {children}
    </TmaContext.Provider>
  );
}
