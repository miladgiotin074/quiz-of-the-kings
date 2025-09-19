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
      <div className="h-screen bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/8 to-pink-500/8"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/15 to-transparent rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-500/15 to-transparent rounded-full blur-lg"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex-1 flex flex-col justify-center items-center text-center px-6">

          {/* Status Display */}
          {matchmakingStatus === 'searching' && (
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-6xl">🔍</span>
                </div>
                <div className="w-24 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto animate-pulse"></div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">{t('game.matchmaking.searching')}</h2>
               <p className="text-slate-300 text-lg mb-8">{t('game.matchmaking.searchingMessage')}</p>
              
              {/* Timer */}
               <div className="text-4xl font-mono text-blue-400 mb-8 bg-slate-800/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-slate-700/50">
                 {Math.floor(searchTime / 60).toString().padStart(2, '0')}:
                 {(searchTime % 60).toString().padStart(2, '0')}
               </div>
            </div>
          )}

          {matchmakingStatus === 'found' && (
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-6xl text-white">✓</span>
                </div>
                <div className="w-24 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto animate-pulse"></div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">{t('game.matchmaking.found')}</h2>
               <p className="text-slate-300 text-lg mb-8">{t('game.matchmaking.foundMessage')}</p>
              
              {/* Opponent info */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center overflow-hidden shadow-lg ring-2 ring-white/10">
                    <span className="text-white font-bold text-2xl">{opponent?.name?.charAt(0) || 'A'}</span>
                  </div>
                  <div className="text-left rtl:text-right">
                    <p className="text-white font-semibold text-xl">{opponent?.name || 'علی احمدی'}</p>
                    <p className="text-slate-300 text-lg">{t('game.matchmaking.level')} {opponent?.level || 1}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {matchmakingStatus === 'starting' && (
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-6xl">🚀</span>
                </div>
                <div className="w-24 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto animate-pulse"></div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">{t('game.matchmaking.starting')}</h2>
               <p className="text-slate-300 text-lg mb-8">{t('game.matchmaking.startingMessage')}</p>
            </div>
          )}
          </div>

          {/* Bottom section */}
           {matchmakingStatus === 'searching' && (
             <div className="absolute bottom-8 left-6 right-6">
               <button
                 onClick={handleCancel}
                 className="w-full bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur-sm text-white py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 border border-slate-700/50"
               >
                 <span className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
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