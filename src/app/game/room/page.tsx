'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Page } from '@/components/Page';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/hooks/useAuth';

interface GamePlayer {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  score: number;
  isBot?: boolean;
}

interface GameState {
  currentRound: number;
  totalRounds: number;
  currentTurn: 'player' | 'opponent';
  phase: 'topic-selection' | 'waiting' | 'questions' | 'round-result' | 'game-over';
  selectedTopic?: string;
  topics?: string[];
}

export default function GameRoomPage() {
  const router = useRouter();
  const t = useTranslations('game');
  const { user } = useAuth();
  const { gameState, actions: { selectTopic } } = useGameState('mock-game-id', user?._id || '');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(true); // Mock: first player starts
  
  // Mock game data
  const mockPlayer = {
    id: user?._id || 'player',
    name: user?.firstName || 'You',
    level: user?.level || 1,
    score: 0
  };

  const mockOpponent = {
    id: 'opponent',
    name: 'Quiz Bot',
    level: 5,
    score: 0,
    isBot: true
  };

  const mockGameState = {
    currentRound: 1,
    totalRounds: 6,
    currentTurn: 'player' as const,
    phase: 'topic-selection' as const,
    topics: ['Science', 'History', 'Sports'] // Mock topics
  };

  const handleTopicSelect = useCallback((topic: string) => {
    console.log('Topic selected:', topic);
    setSelectedTopic(topic);
    // Simulate topic selection and move to questions
    setTimeout(() => {
      router.push('/game/questions');
    }, 1500);
  }, [router]);

  const mockTopics = [
    { id: '1', name: t('topics.science'), icon: '🔬', description: t('topics.scienceDesc') },
    { id: '2', name: t('topics.history'), icon: '📚', description: t('topics.historyDesc') },
    { id: '3', name: t('topics.sports'), icon: '⚽', description: t('topics.sportsDesc') }
  ];

  const handleQuit = useCallback(() => {
    console.log('Quitting game...');
    router.push('/');
  }, [router]);

  return (
    <Page>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative z-10 p-6">
          <div className="max-w-md mx-auto">
            {/* Game Header */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 mb-6 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-glow">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">{t('room.title')}</h1>
                    <p className="text-gray-300 text-sm">{t('room.subtitle')}</p>
                  </div>
                </div>
                <button 
                  onClick={handleQuit}
                  className="text-gray-300 hover:text-gray-200 text-sm px-4 py-2 rounded-xl border border-gray-600/30 hover:bg-gray-700/20 transition-all duration-300 backdrop-blur-sm font-medium"
                >
                  {t('room.quit')}
                </button>
              </div>
              
              {/* Round Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-300 font-medium">{t('room.round')} {mockGameState.currentRound}/{mockGameState.totalRounds}</span>
                  <span className="text-purple-400 font-semibold bg-purple-500/20 px-2 py-1 rounded-full text-xs">{t('room.topicSelection')}</span>
              </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 shadow-glow"
                    style={{ width: `${(mockGameState.currentRound / mockGameState.totalRounds) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Players */}
              <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
                <div className="flex items-center justify-between">
                  {/* Current Player */}
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-glow">
                        <span className="text-lg font-bold text-white">{mockPlayer.name.charAt(0)}</span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <div>
                      <p className="font-bold text-white text-base">{mockPlayer.name}</p>
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <span className="text-xs text-gray-300">{t('room.score')}:</span>
                        <span className="text-blue-400 font-bold text-sm">{mockPlayer.score}</span>
                      </div>
                    </div>
                  </div>

                  {/* VS */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-glow">
                      <span className="text-white font-bold text-xs">VS</span>
                    </div>
                    <div className="text-xs text-gray-400 font-medium mt-0.5">{t('room.battle')}</div>
                  </div>

                  {/* Opponent */}
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="text-right rtl:text-left">
                      <p className="font-bold text-white text-base">{mockOpponent.name}</p>
                      <div className="flex items-center justify-end space-x-1 rtl:space-x-reverse rtl:justify-start">
                        <span className="text-xs text-gray-300">{t('room.score')}:</span>
                        <span className="text-purple-400 font-bold text-sm">{mockOpponent.score}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-glow">
                        <span className="text-lg">{mockOpponent.isBot ? '🤖' : mockOpponent.name.charAt(0)}</span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Content */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl">
              {!selectedTopic ? (
                <div>
                  <div className="text-center mb-5">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-xl">🎯</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">
                      {isMyTurn ? t('room.selectTopic') : t('room.waitingForOpponent')}
                    </h2>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {isMyTurn 
                        ? t('room.chooseCategory') 
                        : t('room.opponentSelecting')
                      }
                    </p>
                  </div>

                  {isMyTurn ? (
                    <div className="space-y-3">
                      {mockTopics.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleTopicSelect(topic.name)}
                          className="w-full p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-left transition-all duration-300 border border-gray-700/50 hover:border-blue-500/50 group hover:scale-[1.02] active:scale-95 backdrop-blur-sm"
                        >
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-500/30">
                              <span className="text-lg">{topic.icon}</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-white text-base mb-0.5">{topic.name}</div>
                              <div className="text-gray-300 text-xs leading-relaxed">{topic.description}</div>
                            </div>
                            <div className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="relative mb-4">
                        <div className="w-12 h-12 mx-auto">
                          <div className="absolute inset-0 border-3 border-purple-500/30 rounded-full"></div>
                          <div className="absolute inset-0 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute inset-1 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                            <span className="text-lg">⏳</span>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{t('room.waitingMessage')}</h3>
                      <p className="text-gray-300 text-sm">{t('room.opponentThinking')}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto"></div>
                  </div>
                  <h2 className="text-lg font-bold text-white mb-2">{t('room.topicSelected')}</h2>
                  <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 mb-3">
                    <p className="text-purple-400 text-base font-bold">{selectedTopic}</p>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{t('room.startingQuestions')}</p>
                  <div className="mt-4">
                    <div className="flex justify-center space-x-1 rtl:space-x-reverse">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          {/* Turn Indicator */}
          <div className="mt-4 text-center">
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
              isMyTurn 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            }`}>
              {isMyTurn ? t('room.yourTurn') : t('room.opponentTurn')}
            </div>
          </div>
        </div>
      </div>
      </div>
    </Page>
  );
}