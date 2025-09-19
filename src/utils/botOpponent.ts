import { Player, GameTopic } from '@/hooks/useGameState';

export interface BotPlayer extends Player {
  difficulty: 'easy' | 'medium' | 'hard';
  responseTime: number; // seconds
  accuracy: number; // percentage
}

const BOT_NAMES = [
  'QuizMaster',
  'BrainBot',
  'SmartAI',
  'KnowledgeBot',
  'WisdomAI',
  'ThinkBot',
  'GeniusAI',
  'MindBot',
  'CleverAI',
  'BrilliantBot'
];

const BOT_AVATARS = [
  '🤖',
  '🎯',
  '🧠',
  '⚡',
  '🔥',
  '💎',
  '🌟',
  '🎪',
  '🎭',
  '🎨'
];

const DIFFICULTY_SETTINGS = {
  easy: {
    accuracy: 0.6, // 60% correct answers
    responseTime: { min: 8, max: 12 }, // 8-12 seconds
    scoreMultiplier: 0.8
  },
  medium: {
    accuracy: 0.75, // 75% correct answers
    responseTime: { min: 5, max: 9 }, // 5-9 seconds
    scoreMultiplier: 0.9
  },
  hard: {
    accuracy: 0.9, // 90% correct answers
    responseTime: { min: 2, max: 6 }, // 2-6 seconds
    scoreMultiplier: 1.0
  }
};

export class BotOpponent {
  private bot: BotPlayer;
  private gameId: string;
  private currentRound: number = 1;
  private totalScore: number = 0;

  constructor(gameId: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    this.gameId = gameId;
    this.bot = this.createBot(difficulty);
  }

  private createBot(difficulty: 'easy' | 'medium' | 'hard'): BotPlayer {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const avatar = BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)];
    
    return {
      id: `bot_${Date.now()}`,
      name,
      avatar,
      score: 0,
      isBot: true,
      isReady: true,
      difficulty,
      responseTime: this.getRandomResponseTime(settings.responseTime),
      accuracy: settings.accuracy
    };
  }

  private getRandomResponseTime(range: { min: number; max: number }): number {
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  public getBot(): BotPlayer {
    return this.bot;
  }

  public selectTopic(availableTopics: GameTopic[]): GameTopic {
    // Bot randomly selects a topic
    const randomIndex = Math.floor(Math.random() * availableTopics.length);
    return availableTopics[randomIndex];
  }

  public async simulateQuestionAnswering(
    questions: any[],
    onAnswerCallback: (questionIndex: number, selectedAnswer: number, isCorrect: boolean, score: number) => void
  ): Promise<number> {
    let roundScore = 0;
    const settings = DIFFICULTY_SETTINGS[this.bot.difficulty];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      // Simulate thinking time
      await new Promise(resolve => {
        setTimeout(resolve, this.bot.responseTime * 1000);
      });

      // Determine if bot answers correctly based on accuracy
      const willAnswerCorrectly = Math.random() < this.bot.accuracy;
      
      let selectedAnswer: number;
      if (willAnswerCorrectly) {
        selectedAnswer = question.correctAnswer;
      } else {
        // Select a random wrong answer
        const wrongAnswers = question.options
          .map((_: any, index: number) => index)
          .filter((index: number) => index !== question.correctAnswer);
        selectedAnswer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
      }

      const isCorrect = selectedAnswer === question.correctAnswer;
      
      // Calculate score (similar to human player but with bot multiplier)
      const baseScore = isCorrect ? (question.timeLimit - this.bot.responseTime) * 10 : 0;
      const botScore = Math.floor(baseScore * settings.scoreMultiplier);
      
      roundScore += botScore;
      
      // Notify about bot's answer
      onAnswerCallback(i, selectedAnswer, isCorrect, botScore);
      
      // Small delay between questions
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.totalScore += roundScore;
    this.bot.score = this.totalScore;
    
    return roundScore;
  }

  public updateRound(round: number): void {
    this.currentRound = round;
    
    // Update bot's response time for variety
    const settings = DIFFICULTY_SETTINGS[this.bot.difficulty];
    this.bot.responseTime = this.getRandomResponseTime(settings.responseTime);
  }

  public getGameStats() {
    return {
      botId: this.bot.id,
      totalScore: this.totalScore,
      currentRound: this.currentRound,
      difficulty: this.bot.difficulty,
      averageResponseTime: this.bot.responseTime
    };
  }

  public reset(): void {
    this.currentRound = 1;
    this.totalScore = 0;
    this.bot.score = 0;
  }
}

// Utility functions for bot management
export const createBotOpponent = (gameId: string, userLevel?: number): BotOpponent => {
  // Determine bot difficulty based on user level or random
  let difficulty: 'easy' | 'medium' | 'hard';
  
  if (userLevel) {
    if (userLevel < 10) {
      difficulty = 'easy';
    } else if (userLevel < 25) {
      difficulty = 'medium';
    } else {
      difficulty = 'hard';
    }
  } else {
    // Random difficulty
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
    difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
  }
  
  return new BotOpponent(gameId, difficulty);
};

export const getBotDifficultyLabel = (difficulty: 'easy' | 'medium' | 'hard'): string => {
  const labels = {
    easy: '🟢 Easy',
    medium: '🟡 Medium', 
    hard: '🔴 Hard'
  };
  return labels[difficulty];
};