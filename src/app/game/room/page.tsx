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

  // Mock rounds data - each round has 3 questions per player
  const mockRounds = [
    // Round 1 - Tie (both players have same correct answers)
     {
       currentPlayer: ['correct', 'correct', 'incorrect'], // 2 correct, 1 incorrect
       opponent: ['correct', 'correct', 'incorrect'] // 2 correct, 1 incorrect
     },
    // Round 2 - Lost (opponent has more correct answers)
    {
      currentPlayer: ['incorrect', 'correct', 'correct'], // 2 correct, 1 incorrect
      opponent: ['incorrect', 'correct', 'incorrect'] // 1 correct, 2 incorrect
    },
    // Round 3 - Lost (opponent has more correct answers)
    {
      currentPlayer: ['correct', 'incorrect', 'incorrect'], // 1 correct, 2 incorrect
      opponent: ['correct', 'correct', 'incorrect'] // 2 correct, 1 incorrect
    },
    // Round 4 - Not started yet
    {
      currentPlayer: [],
      opponent: []
    },
    // Round 5 - Not started yet
    {
      currentPlayer: [],
      opponent: []
    },
    // Round 6 - Not started yet
    {
      currentPlayer: [],
      opponent: []
    }
  ];

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
      <div className="min-h-screen bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-black/90 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/8 to-pink-500/8"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/15 to-transparent rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-500/15 to-transparent rounded-full blur-lg"></div>
        </div>

        <div className="relative z-10 px-2 py-2">
          <div className="max-w-md mx-auto">
            {/* Players Header */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-slate-700/50 shadow-xl">
              <div className="flex items-center justify-between">
                {/* Current Player */}
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-glow">
                        <span className="text-xl font-bold text-white">{mockPlayer.name.charAt(0)}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{mockPlayer.name}</p>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="text-blue-400 font-bold text-xl">{mockPlayer.score}</span>
                        <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">Lv.{mockPlayer.level}</span>
                      </div>
                    </div>
                  </div>

                  {/* Opponent */}
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="text-right rtl:text-left">
                      <p className="font-bold text-white text-lg">{mockOpponent.name}</p>
                      <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse rtl:justify-start">
                        <span className="text-purple-400 font-bold text-xl">{mockOpponent.score}</span>
                        <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">Lv.{mockOpponent.level}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-glow">
                        <span className="text-xl">{mockOpponent.isBot ? '🤖' : mockOpponent.name.charAt(0)}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                  </div>
              </div>
            </div>

            {/* Game Rounds */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 shadow-2xl">
              
              {/* Rounds List */}
              <div className="space-y-3 mb-4">
                {[1, 2, 3, 4, 5, 6].map((round) => {
                  const currentPlayerResults = mockRounds[round - 1]?.currentPlayer || [];
                  const opponentResults = mockRounds[round - 1]?.opponent || [];
                  const isCurrentRound = gameState?.currentRound === round;
                  
                  return (
                    <div key={round} className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                      {/* Left Side - Round Status Emoji (Outside the card) */}
                        <div className={`text-2xl w-8 ${
                          isCurrentRound ? 'text-blue-400' : 'text-slate-300'
                        }`}>
                          {(() => {
                            const currentPlayerResults = mockRounds[round - 1]?.currentPlayer || [];
                            const opponentResults = mockRounds[round - 1]?.opponent || [];
                            
                            // If round hasn't started (no results for both players)
                            if (currentPlayerResults.length === 0 && opponentResults.length === 0) {
                              return '⏳'; // Waiting emoji
                            }
                            
                            // Count correct answers for current player
                            const currentPlayerCorrect = currentPlayerResults.filter(result => result === 'correct').length;
                            const opponentCorrect = opponentResults.filter(result => result === 'correct').length;
                            
                            // Determine round winner
                             if (currentPlayerCorrect > opponentCorrect) {
                               return '💪'; // Victory emoji (flexed bicep)
                             } else if (currentPlayerCorrect < opponentCorrect) {
                               return '💔'; // Defeat emoji
                             } else {
                               return '🤝'; // Tie emoji
                             }
                          })()} 
                        </div>
                      
                      {/* Main Card */}
                      <div className={`flex-1 bg-slate-700/50 rounded-full p-2 border ${
                        isCurrentRound ? 'border-blue-500/50 bg-blue-500/10' : 'border-slate-600/50'
                      }`}>
                        <div className="flex items-center justify-between px-2 py-2">
                          {/* Left Side - Current Player (3 lights) */}
                          <div className="flex space-x-1 rtl:space-x-reverse">
                            {[1, 2, 3].map((lightIndex) => {
                              const hasResult = currentPlayerResults.length >= lightIndex;
                              const result = hasResult ? currentPlayerResults[lightIndex - 1] : null;
                              
                              return (
                                <div key={lightIndex} className="w-4 h-4 rounded-full">
                                  {result === 'correct' && (
                                    <div className="w-full h-full bg-green-500 rounded-full"></div>
                                  )}
                                  {result === 'incorrect' && (
                                    <div className="w-full h-full bg-red-500 rounded-full"></div>
                                  )}
                                  {!result && (
                                    <div className="w-full h-full bg-slate-600 rounded-full"></div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Center - Round Topic */}
                          <div className="text-center">
                            <span className={`text-sm font-medium ${
                              isCurrentRound ? 'text-blue-400' : 'text-gray-300'
                            }`}>
                              {(() => {
                                const topics = ['🏈 Sports', '🔬 Science', '📚 History', '🌍 Geography', '🎨 Arts'];
                                // Show topic only for current round or completed rounds
                                if (round <= mockGameState.currentRound) {
                                  return topics[(round - 1) % topics.length];
                                }
                                // Show "Pending" for future rounds
                                return '⏸️ Pending';
                              })()}
                            </span>
                          </div>
                          
                          {/* Right Side - Opponent (3 lights) */}
                          <div className="flex space-x-1 rtl:space-x-reverse">
                            {[1, 2, 3].map((lightIndex) => {
                              const hasResult = opponentResults.length >= lightIndex;
                              const result = hasResult ? opponentResults[lightIndex - 1] : null;
                              
                              return (
                                <div key={lightIndex} className="w-4 h-4 rounded-full">
                                  {result === 'correct' && (
                                    <div className="w-full h-full bg-green-500 rounded-full"></div>
                                  )}
                                  {result === 'incorrect' && (
                                    <div className="w-full h-full bg-red-500 rounded-full"></div>
                                  )}
                                  {!result && (
                                    <div className="w-full h-full bg-slate-600 rounded-full"></div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Play Button */}
              {isMyTurn && (
                <div className="text-center">
                  <button 
                    onClick={() => console.log('Starting game...')}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <span className="text-lg">🎮</span>
                      <span>{t('room.playNow')}</span>
                    </div>
                  </button>
                </div>
              )}
              
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
      </div>
    </Page>
  );
}