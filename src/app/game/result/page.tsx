'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Page } from '@/components/Page';
import { useUser } from '@/contexts/UserContext';

interface GameResult {
  gameId: string;
  winner: {
    id: string;
    name: string;
    avatar?: string;
    finalScore: number;
    isBot: boolean;
  };
  players: {
    id: string;
    name: string;
    avatar?: string;
    finalScore: number;
    roundScores: number[];
    isBot: boolean;
  }[];
  totalRounds: number;
  gameDuration: number; // in seconds
  experienceGained: number;
  coinsEarned: number;
}

function GameResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('game');
  const { user } = useUser();
  
  const gameId = searchParams.get('gameId') || '';
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Mock game result data - in real app, this would come from WebSocket or API
    const mockResult: GameResult = {
      gameId,
      winner: {
        id: user?._id || 'user1',
        name: user?.username || 'You',
        finalScore: 2850,
        isBot: false
      },
      players: [
        {
          id: user?._id || 'user1',
          name: user?.username || 'You',
          finalScore: 2850,
          roundScores: [450, 380, 520, 410, 590, 500],
          isBot: false
        },
        {
          id: 'bot_123',
          name: 'QuizMaster',
          avatar: '🤖',
          finalScore: 2650,
          roundScores: [420, 360, 480, 390, 550, 450],
          isBot: true
        }
      ],
      totalRounds: 6,
      gameDuration: 480, // 8 minutes
      experienceGained: 150,
      coinsEarned: 50
    };

    // Simulate loading
    setTimeout(() => {
      setGameResult(mockResult);
      setLoading(false);
      
      // Show confetti if user won
      if (mockResult.winner.id === user?._id) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }, 1500);
  }, [gameId, user]);

  const handlePlayAgain = () => {
    console.log('Starting new game...');
    router.push('/game/matchmaking');
  };

  const handleBackToHome = () => {
    console.log('Returning to home...');
    router.push('/');
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPositionEmoji = (index: number): string => {
    return index === 0 ? '🥇' : '🥈';
  };

  const getPositionColor = (index: number): string => {
    return index === 0 ? 'text-yellow-400' : 'text-gray-400';
  };

  if (loading) {
    return (
      <Page>
        <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">{t('result.calculating')}</p>
        </div>
      </Page>
    );
  }

  if (!gameResult) {
    return (
      <Page>
        <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
          <p className="text-red-400">{t('result.error')}</p>
          <button 
            onClick={handleBackToHome}
            className="mt-4 px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {t('result.backToHome')}
          </button>
        </div>
      </Page>
    );
  }

  const isWinner = gameResult.winner.id === user?._id;
  const userPlayer = gameResult.players.find(p => p.id === user?._id);

  return (
    <Page back={false}>
      <div className="flex flex-col h-full bg-gray-900 text-white relative overflow-hidden">
        {/* Confetti Effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="confetti-container">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)]
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center py-8 bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="text-6xl mb-4">
            {isWinner ? '🎉' : '🎯'}
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isWinner ? 'text-yellow-400' : 'text-gray-300'
          }`}>
            {isWinner ? t('result.victory') : t('result.goodGame')}
          </h1>
          <p className="text-gray-400">
            {t('result.gameCompleted')} • {formatDuration(gameResult.gameDuration)}
          </p>
        </div>

        {/* Results */}
        <div className="flex-1 px-4 py-6 space-y-6">
          {/* Final Standings */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4 text-center">{t('result.finalStandings')}</h2>
            <div className="space-y-3">
              {gameResult.players
                .sort((a, b) => b.finalScore - a.finalScore)
                .map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`text-2xl ${getPositionColor(index)}`}>
                      {getPositionEmoji(index)}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        {player.avatar && <span>{player.avatar}</span>}
                        <span className={`font-medium ${
                          player.id === user?._id ? 'text-blue-400' : 'text-white'
                        }`}>
                          {player.id === user?._id ? t('result.you') : player.name}
                        </span>
                        {player.isBot && (
                          <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                            {t('result.bot')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`text-xl font-bold ${getPositionColor(index)}`}>
                    {player.finalScore.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Round by Round */}
          {userPlayer && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-4">{t('result.roundByRound')}</h3>
              <div className="grid grid-cols-3 gap-2">
                {userPlayer.roundScores.map((score, index) => (
                  <div key={index} className="bg-gray-700 rounded p-3 text-center">
                    <div className="text-sm text-gray-400 mb-1">
                      {t('result.round')} {index + 1}
                    </div>
                    <div className="text-lg font-bold text-blue-400">
                      {score.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rewards */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-4">{t('result.rewards')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-2xl mb-2">⭐</div>
                <div className="text-sm text-gray-400">{t('result.experience')}</div>
                <div className="text-lg font-bold text-yellow-400">
                  +{gameResult.experienceGained}
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-2xl mb-2">🪙</div>
                <div className="text-sm text-gray-400">{t('result.coins')}</div>
                <div className="text-lg font-bold text-yellow-400">
                  +{gameResult.coinsEarned}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-3">
          <button
            onClick={handlePlayAgain}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition-colors"
          >
            {t('result.playAgain')}
          </button>
          <button
            onClick={handleBackToHome}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            {t('result.backToHome')}
          </button>
        </div>
      </div>

      <style jsx>{`
        .confetti-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti-fall 3s linear infinite;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </Page>
  );
}

export default function GameResultPage() {
  return (
    <Suspense fallback={
      <Page>
        <div className="flex items-center justify-center h-full bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </Page>
    }>
      <GameResultContent />
    </Suspense>
  );
}