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
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-slate-700/50 shadow-2xl">
              <div className="flex items-center justify-between">
                {/* Current Player */}
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30">
                        <span className="text-2xl font-bold text-white">{mockPlayer.name.charAt(0)}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-slate-800 shadow-lg animate-pulse"></div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                        <h3 className="text-white font-bold text-xl">{mockPlayer.name}</h3>
                        <span className="text-xs text-slate-300 bg-slate-700/70 px-3 py-1 rounded-full font-medium">Lv.{mockPlayer.level}</span>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="text-blue-400 font-bold text-2xl">{mockPlayer.score}</span>
                        <span className="text-xs text-blue-300 font-medium">points</span>
                      </div>
                    </div>
                  </div>

                  {/* VS */}
                  <div className="text-slate-400 font-bold text-xl px-6 bg-slate-700/30 rounded-full py-2">
                    VS
                  </div>

                  {/* Opponent */}
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className="text-right rtl:text-left">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse rtl:justify-start mb-1">
                        <span className="text-xs text-slate-300 bg-slate-700/70 px-3 py-1 rounded-full font-medium">Lv.{mockOpponent.level}</span>
                        <h3 className="text-white font-bold text-xl">{mockOpponent.name}</h3>
                      </div>
                      <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse rtl:justify-start">
                        <span className="text-xs text-purple-300 font-medium">points</span>
                        <span className="text-purple-400 font-bold text-2xl">{mockOpponent.score}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/30">
                        <span className="text-2xl font-bold text-white">{mockOpponent.isBot ? '🤖' : mockOpponent.name.charAt(0)}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full border-3 border-slate-800 shadow-lg"></div>
                    </div>
                  </div>
              </div>
            </div>

            {/* Game Rounds */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 shadow-2xl">
              
              {/* Rounds List */}
              <div className="space-y-4 mb-6">
                {[1, 2, 3, 4, 5, 6].map((round) => {
                  const currentPlayerResults = mockRounds[round - 1]?.currentPlayer || [];
                  const opponentResults = mockRounds[round - 1]?.opponent || [];
                  const isCurrentRound = gameState?.currentRound === round;
                  
                  return (
                    <div key={round} className="flex items-center space-x-4 rtl:space-x-reverse">
                      {/* Left Side - Round Status Emoji (Outside the card) */}
                        <div className={`text-3xl w-10 flex justify-center ${
                          isCurrentRound ? 'text-blue-400 animate-pulse' : 'text-slate-300'
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
                      <div className={`flex-1 bg-slate-700/50 rounded-2xl p-3 border transition-all duration-300 ${
                        isCurrentRound 
                          ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
                          : 'border-slate-600/50 hover:border-slate-500/50'
                      }`}>
                        <div className="flex items-center justify-between px-3 py-2">
                          {/* Left Side - Current Player (3 lights) */}
                          <div className="flex space-x-2 rtl:space-x-reverse">
                            {[1, 2, 3].map((lightIndex) => {
                              const hasResult = currentPlayerResults.length >= lightIndex;
                              const result = hasResult ? currentPlayerResults[lightIndex - 1] : null;
                              
                              return (
                                <div key={lightIndex} className="w-5 h-5 rounded-full transition-all duration-300">
                                  {result === 'correct' && (
                                    <div className="w-full h-full bg-green-500 rounded-full shadow-lg shadow-green-500/30"></div>
                                  )}
                                  {result === 'incorrect' && (
                                    <div className="w-full h-full bg-red-500 rounded-full shadow-lg shadow-red-500/30"></div>
                                  )}
                                  {!result && (
                                    <div className="w-full h-full bg-slate-600 rounded-full"></div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Center - Round Topic */}
                          <div className="text-center px-4">
                            <span className={`text-base font-semibold transition-colors duration-300 ${
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
                          <div className="flex space-x-2 rtl:space-x-reverse">
                            {[1, 2, 3].map((lightIndex) => {
                              const hasResult = opponentResults.length >= lightIndex;
                              const result = hasResult ? opponentResults[lightIndex - 1] : null;
                              
                              return (
                                <div key={lightIndex} className="w-5 h-5 rounded-full transition-all duration-300">
                                  {result === 'correct' && (
                                    <div className="w-full h-full bg-green-500 rounded-full shadow-lg shadow-green-500/30"></div>
                                  )}
                                  {result === 'incorrect' && (
                                    <div className="w-full h-full bg-red-500 rounded-full shadow-lg shadow-red-500/30"></div>
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
                <div className="text-center mb-4">
                  <button 
                    onClick={() => console.log('Starting game...')}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl shadow-blue-500/25"
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <span className="text-xl">🎮</span>
                      <span className="text-lg">{t('room.playNow')}</span>
                    </div>
                  </button>
                </div>
              )}
              
              {/* Turn Indicator */}
              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isMyTurn 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/20' 
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/20'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 rtl:mr-0 rtl:ml-2 animate-pulse ${
                    isMyTurn ? 'bg-blue-400' : 'bg-purple-400'
                  }`}></div>
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