'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Page } from '@/components/Page';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { SkeletonLoader } from '@/components/SkeletonLoader';

interface MatchmakingState {
  status: 'searching' | 'found' | 'starting';
  opponent?: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  } | null;
  searchTime: number;
}

export default function MatchmakingPage() {
  const router = useRouter();
  const t = useTranslations();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [matchmakingStatus, setMatchmakingStatus] = useState<'searching' | 'found' | 'starting'>('searching');
  const [opponent, setOpponent] = useState<any>(null);
  const [searchTime, setSearchTime] = useState(0);
  const [isBot, setIsBot] = useState(false);

  // Search timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (matchmakingStatus === 'searching') {
      interval = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [matchmakingStatus]);

  // Mock matchmaking logic (will be replaced with WebSocket)
  useEffect(() => {
    if (matchmakingStatus === 'searching') {
      const timeout = setTimeout(() => {
        // 70% chance to find human opponent, 30% bot
        const foundBot = Math.random() < 0.3;
        setIsBot(foundBot);
        
        setOpponent(foundBot ? {
          id: 'bot-1',
          name: 'AI Bot',
          avatar: '🤖',
          isBot: true,
          rating: 1200
        } : {
          id: 'user-123',
          name: 'علی احمدی',
          avatar: '👤',
          isBot: false,
          rating: 1350
        });
        
        setMatchmakingStatus('found');
      }, 5000); // Find opponent after 5 seconds
      
      return () => clearTimeout(timeout);
    }
  }, [matchmakingStatus, router]);

  // Handle game starting after opponent is found
  useEffect(() => {
    if (matchmakingStatus === 'found') {
      const startTimeout = setTimeout(() => {
        setMatchmakingStatus('starting');
        const gameTimeout = setTimeout(() => {
          router.push('/game/room');
        }, 2000);
        return () => clearTimeout(gameTimeout);
      }, 3000);
      
      return () => clearTimeout(startTimeout);
    }
  }, [matchmakingStatus, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCancel = useCallback(() => {
    console.log('Canceling matchmaking...');
    router.push('/');
  }, [router]);

  if (!user) {
    return (
      <Page>
        <div className="flex items-center justify-center min-h-screen">
          <SkeletonLoader />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="min-h-screen p-3">
        {/* Background with same style as home page */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50 shadow-2xl h-full flex flex-col">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/8 to-pink-500/8"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/15 to-transparent rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-500/15 to-transparent rounded-full blur-lg"></div>
          
          {/* Main content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-4">

            {/* Status Display */}
            {matchmakingStatus === 'searching' && (
            <div className="text-center mb-8">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto relative">
                  {/* Outer rotating ring */}
                  <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
                  {/* Inner pulsing ring */}
                  <div className="absolute inset-2 border-2 border-transparent border-b-blue-400 border-l-purple-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                  {/* Center magnifying glass - larger size */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl animate-pulse">🔍</span>
                  </div>
                  {/* Floating dots around */}
                  <div className="absolute -top-1 left-1/2 w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                  <div className="absolute top-1/2 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                  <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.6s'}}></div>
                  <div className="absolute top-1/2 -left-1 w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0.9s'}}></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('game.matchmaking.searching')}</h3>
              <p className="text-gray-300 mb-4">{t('game.matchmaking.searchingMessage')}</p>
              <div className="text-sm text-gray-400">
                {formatTime(searchTime)}
              </div>
            </div>
            )}

            {matchmakingStatus === 'found' && (
            <div className="text-center mb-8">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-glow animate-bounce">
                  <span className="text-3xl">✅</span>
                </div>
                <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('game.matchmaking.found')}</h3>
              <p className="text-gray-300 mb-4">{t('game.matchmaking.foundMessage')}</p>
              {opponent && (
                <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/30 mb-4">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-xl">{opponent.avatar || '👤'}</span>
                    </div>
                    <div className="flex-1 text-left rtl:text-right">
                      <div className="font-semibold text-white">{opponent.name}</div>
                      <div className="text-sm text-gray-400">Level {opponent.level}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}

            {matchmakingStatus === 'starting' && (
            <div className="text-center mb-8">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-glow animate-pulse">
                  <span className="text-3xl">🚀</span>
                </div>
                <div className="flex justify-center space-x-1 rtl:space-x-reverse">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('game.matchmaking.starting')}</h3>
              <p className="text-gray-300">{t('game.matchmaking.startingMessage')}</p>
            </div>
            )}
          </div>

            {/* Bottom section */}
            {matchmakingStatus === 'searching' && (
              <div className="relative z-10 space-y-4 p-4 mt-auto">
                <button
                  onClick={handleCancel}
                  className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 border border-gray-600/30"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>{t('game.matchmaking.cancel')}</span>
                    <span className="text-xl">✕</span>
                  </span>
                </button>
              </div>
            )}
        </div>
      </div>
    </Page>
  );
}