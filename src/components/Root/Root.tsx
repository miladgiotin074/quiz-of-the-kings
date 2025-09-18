'use client';

import { type PropsWithChildren, useEffect, useState } from 'react';
import {
  initData,
  miniApp,
  useLaunchParams,
  useSignal,
} from '@telegram-apps/sdk-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorPage } from '@/components/ErrorPage';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { useDidMount } from '@/hooks/useDidMount';
import { useUser } from '@/contexts/UserContext';
import { setLocale } from '@/core/i18n/locale';

import './styles.css';
// import { useLaunchParams } from '@telegram-apps/sdk-react';

function RootInner({ children }: PropsWithChildren) {
  const lp = useLaunchParams();
  const locale = useLocale();

  const isDark = useSignal(miniApp.isDark);

  // Note: Default locale (English) is used instead of user's Telegram language

  // Set document direction based on locale
  useEffect(() => {
    const direction = locale === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;
  }, [locale]);

  return (
      <div 
        className={`app-root ${isDark ? 'dark' : 'light'} ${
          ['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'
        }`}
        dir={locale === 'fa' ? 'rtl' : 'ltr'}
      >
        {children}
      </div>
  );
}

export function Root(props: PropsWithChildren) {
  const didMount = useDidMount();
  const router = useRouter();
  const t = useTranslations('root');
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const initDataUser = useSignal(initData.user);
  const RawInitData = useSignal(initData.raw);
  const { login, authenticateWithTelegram } = useUser();

  // Handle onboarding completion
  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  // Authentication and initialization flow
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Starting app initialization...');
        
        if (!RawInitData) {
          console.log('❌ No Telegram init data available');
          setAuthError(t('errors.noInitData'));
          setIsLoading(false);
          return;
        }

        // Use UserContext's authenticateWithTelegram function
        await authenticateWithTelegram(RawInitData);
        
        setIsAuthenticated(true);
        
        console.log('🎉 Authentication completed successfully');
        
        // Check if user has seen onboarding
        const hasSeenOnboarding = localStorage.getItem('onboardingCompleted');
        if (hasSeenOnboarding) {
          setShowWelcome(true);
        }
        
        setIsLoading(false);
        
      } catch (error: any) {
        console.log('❌ App initialization failed:', error);
        
        // Handle different types of authentication errors
        if (error.message === 'Invalid authentication') {
          setAuthError(t('errors.invalidAuth'));
        } else if (error.message === 'Server error') {
          setAuthError(t('errors.serverError'));
        } else {
          setAuthError(t('errors.loadingError'));
        }
        
        setIsLoading(false);
      }
    };

    if (didMount) {
      // Add minimum loading time for better UX
      const timer = setTimeout(() => {
        initializeApp();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [didMount]);

  // Show loading screen
  if (!didMount || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white relative overflow-x-hidden flex flex-col justify-center items-center">
        {/* Background pattern */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication error
  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white relative overflow-x-hidden flex flex-col justify-center items-center p-6">
        {/* Background pattern */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        </div>
        
        <div className="relative z-10 max-w-md w-full">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h2 className="text-red-400 text-xl font-bold mb-2">{t('errors.authTitle')}</h2>
            <p className="text-red-300 mb-4">{authError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {t('errors.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show welcome screen if user hasn't seen onboarding
  if (isAuthenticated && showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  // Show main app if authenticated
  if (isAuthenticated) {
    return (
      <ErrorBoundary fallback={ErrorPage}>
        <RootInner {...props} />
      </ErrorBoundary>
    );
  }

  return null;
}
