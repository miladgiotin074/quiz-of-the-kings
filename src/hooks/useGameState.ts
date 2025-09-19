import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  isBot: boolean;
  isReady: boolean;
}

export interface GameTopic {
  id: string;
  name: string;
  icon: string;
}

export interface GameState {
  gameId: string;
  players: Player[];
  currentRound: number;
  totalRounds: number;
  currentTurn: string; // player id
  phase: 'waiting' | 'topic_selection' | 'questions' | 'round_result' | 'game_over';
  selectedTopic?: GameTopic;
  availableTopics: GameTopic[];
  roundScores: { [playerId: string]: number };
  gameStarted: boolean;
  isMyTurn: boolean;
}

const TOTAL_ROUNDS = 6;

const MOCK_TOPICS: GameTopic[] = [
  { id: 'science', name: 'Science', icon: '🔬' },
  { id: 'history', name: 'History', icon: '📚' },
  { id: 'sports', name: 'Sports', icon: '⚽' },
  { id: 'geography', name: 'Geography', icon: '🌍' },
  { id: 'movies', name: 'Movies', icon: '🎬' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'technology', name: 'Technology', icon: '💻' },
  { id: 'art', name: 'Art', icon: '🎨' },
  { id: 'literature', name: 'Literature', icon: '📖' },
  { id: 'nature', name: 'Nature', icon: '🌿' }
];

export const useGameState = (gameId: string, userId: string) => {
  const { socket, isConnected } = useSocket();
  
  const [gameState, setGameState] = useState<GameState>({
    gameId,
    players: [],
    currentRound: 1,
    totalRounds: TOTAL_ROUNDS,
    currentTurn: '',
    phase: 'waiting',
    availableTopics: [],
    roundScores: {},
    gameStarted: false,
    isMyTurn: false
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate random topics for selection
  const generateRandomTopics = useCallback(() => {
    const shuffled = [...MOCK_TOPICS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, []);

  // Initialize game state
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join game room
    socket.emit('join_game', { gameId, userId });

    // Listen for game state updates
    socket.on('game_state_updated', (newState: Partial<GameState>) => {
      setGameState(prev => ({
        ...prev,
        ...newState,
        isMyTurn: newState.currentTurn === userId
      }));
      setLoading(false);
    });

    // Listen for game start
    socket.on('game_started', (data: { players: Player[], firstTurn: string }) => {
      setGameState(prev => ({
        ...prev,
        players: data.players,
        currentTurn: data.firstTurn,
        phase: 'topic_selection',
        gameStarted: true,
        availableTopics: generateRandomTopics(),
        isMyTurn: data.firstTurn === userId
      }));
    });

    // Listen for topic selection
    socket.on('topic_selected', (data: { topic: GameTopic, nextPhase: string }) => {
      setGameState(prev => ({
        ...prev,
        selectedTopic: data.topic,
        phase: data.nextPhase as GameState['phase']
      }));
    });

    // Listen for round completion
    socket.on('round_completed', (data: { 
      scores: { [playerId: string]: number },
      nextRound: number,
      nextTurn: string
    }) => {
      setGameState(prev => {
        const updatedPlayers = prev.players.map(player => ({
          ...player,
          score: player.score + (data.scores[player.id] || 0)
        }));

        return {
          ...prev,
          players: updatedPlayers,
          currentRound: data.nextRound,
          currentTurn: data.nextTurn,
          phase: data.nextRound <= TOTAL_ROUNDS ? 'topic_selection' : 'game_over',
          roundScores: data.scores,
          availableTopics: data.nextRound <= TOTAL_ROUNDS ? generateRandomTopics() : [],
          isMyTurn: data.nextTurn === userId
        };
      });
    });

    // Listen for game over
    socket.on('game_over', (data: { winner: Player, finalScores: Player[] }) => {
      setGameState(prev => ({
        ...prev,
        players: data.finalScores,
        phase: 'game_over'
      }));
    });

    // Listen for errors
    socket.on('game_error', (error: string) => {
      setError(error);
      setLoading(false);
    });

    return () => {
      socket.off('game_state_updated');
      socket.off('game_started');
      socket.off('topic_selected');
      socket.off('round_completed');
      socket.off('game_over');
      socket.off('game_error');
    };
  }, [socket, isConnected, gameId, userId, generateRandomTopics]);

  // Actions
  const selectTopic = useCallback((topic: GameTopic) => {
    if (!socket || !gameState.isMyTurn || gameState.phase !== 'topic_selection') {
      return;
    }

    socket.emit('select_topic', {
      gameId,
      topicId: topic.id,
      round: gameState.currentRound
    });

    // Optimistically update local state
    setGameState(prev => ({
      ...prev,
      selectedTopic: topic,
      phase: 'questions'
    }));
  }, [socket, gameState.isMyTurn, gameState.phase, gameState.currentRound, gameId]);

  const submitRoundScore = useCallback((score: number) => {
    if (!socket) return;

    socket.emit('submit_round_score', {
      gameId,
      playerId: userId,
      round: gameState.currentRound,
      score
    });
  }, [socket, gameId, userId, gameState.currentRound]);

  const leaveGame = useCallback(() => {
    if (!socket) return;

    socket.emit('leave_game', { gameId, userId });
  }, [socket, gameId, userId]);

  // Get current player
  const currentPlayer = gameState.players.find(p => p.id === userId);
  const opponent = gameState.players.find(p => p.id !== userId);

  // Check if waiting for opponent
  const isWaitingForOpponent = gameState.phase === 'questions' && !gameState.isMyTurn;

  return {
    gameState,
    currentPlayer,
    opponent,
    loading,
    error,
    isWaitingForOpponent,
    actions: {
      selectTopic,
      submitRoundScore,
      leaveGame
    }
  };
};