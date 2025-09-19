'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Page } from '@/components/Page';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/hooks/useAuth';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
}

interface QuestionState {
  currentQuestion: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  timeLeft: number;
  score: number;
  isAnswered: boolean;
  showResult: boolean;
}

function QuestionsContent() {
  const router = useRouter();
  const t = useTranslations();
  const { user } = useAuth();
  const { gameState, actions: { submitRoundScore } } = useGameState('mock-game-id', user?._id || '');
  
  const topic = gameState?.selectedTopic?.name || 'General';
  const round = gameState?.currentRound || 1;

  // Mock questions data
  const [questions] = useState<Question[]>([
    {
      id: '1',
      question: t('game.questions.question1.text'),
      options: [
        t('game.questions.question1.option1'),
        t('game.questions.question1.option2'),
        t('game.questions.question1.option3'),
        t('game.questions.question1.option4')
      ],
      correctAnswer: 2,
      timeLimit: 15
    },
    {
      id: '2',
      question: t('game.questions.question2.text'),
      options: [
        t('game.questions.question2.option1'),
        t('game.questions.question2.option2'),
        t('game.questions.question2.option3'),
        t('game.questions.question2.option4')
      ],
      correctAnswer: 1,
      timeLimit: 15
    },
    {
      id: '3',
      question: t('game.questions.question3.text'),
      options: [
        t('game.questions.question3.option1'),
        t('game.questions.question3.option2'),
        t('game.questions.question3.option3'),
        t('game.questions.question3.option4')
      ],
      correctAnswer: 1,
      timeLimit: 10
    }
  ]);

  const [questionState, setQuestionState] = useState<QuestionState>({
    currentQuestion: 0,
    totalQuestions: questions.length,
    selectedAnswer: null,
    timeLeft: questions[0]?.timeLimit || 15,
    score: 0,
    isAnswered: false,
    showResult: false
  });

  // Timer effect
  useEffect(() => {
    if (questionState.timeLeft > 0 && !questionState.isAnswered) {
      const timer = setTimeout(() => {
        setQuestionState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);

      return () => clearTimeout(timer);
    } else if (questionState.timeLeft === 0 && !questionState.isAnswered) {
      // Time's up - auto submit
      handleTimeUp();
    }
  }, [questionState.timeLeft, questionState.isAnswered]);

  const handleTimeUp = () => {
    setQuestionState(prev => ({
      ...prev,
      isAnswered: true,
      showResult: true
    }));

    // Show result for 2 seconds then move to next
    setTimeout(() => {
      handleNextQuestion();
    }, 2000);
  };

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (questionState.isAnswered) return;

    const currentQuestion = questions[questionState.currentQuestion];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const points = isCorrect ? (questionState.timeLeft * 10) : 0;

    setQuestionState(prev => ({
      ...prev,
      selectedAnswer: answerIndex,
      isAnswered: true,
      showResult: true,
      score: prev.score + points
    }));

    // Show result for 2 seconds then move to next
    setTimeout(() => {
      handleNextQuestion();
    }, 2000);
  }, [questionState.isAnswered, questions, questionState.currentQuestion, questionState.timeLeft]);

  const handleNextQuestion = useCallback(() => {
    if (questionState.currentQuestion < questions.length - 1) {
      // Move to next question
      const nextQuestionIndex = questionState.currentQuestion + 1;
      setQuestionState(prev => ({
        ...prev,
        currentQuestion: nextQuestionIndex,
        selectedAnswer: null,
        timeLeft: questions[nextQuestionIndex].timeLimit,
        isAnswered: false,
        showResult: false
      }));
    } else {
      // All questions completed - submit score and return to game room
      submitRoundScore?.(questionState.score);
      router.push(`/game/room?score=${questionState.score}&round=${round}`);
    }
  }, [questionState.currentQuestion, questions, questionState.score, round, router, submitRoundScore]);

  const handleQuit = useCallback(() => {
    console.log('Quitting game...');
    router.push('/game/room');
  }, [router]);

  const currentQuestion = questions[questionState.currentQuestion];
  const progress = ((questionState.currentQuestion + 1) / questionState.totalQuestions) * 100;

  const getAnswerStyle = (index: number) => {
    if (!questionState.showResult) {
      return 'bg-gray-800 hover:bg-gray-700 border-gray-600 hover:border-blue-500';
    }

    if (index === currentQuestion.correctAnswer) {
      return 'bg-green-600 border-green-500 text-white';
    }

    if (index === questionState.selectedAnswer && index !== currentQuestion.correctAnswer) {
      return 'bg-red-600 border-red-500 text-white';
    }

    return 'bg-gray-700 border-gray-600 text-gray-400';
  };

  return (
    <Page>
      <div className="flex flex-col h-full bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-400">
              {t('game.question')} {questionState.currentQuestion + 1}/{questionState.totalQuestions}
            </div>
            <div className="text-sm text-gray-400">
              {t('game.round')} {round} • {t('game.topics.' + topic.toLowerCase())}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center">
            <div className={`text-2xl font-bold ${
              questionState.timeLeft <= 5 ? 'text-red-400' : 'text-blue-400'
            }`}>
              {questionState.timeLeft}s
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col p-6">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold mb-4">{currentQuestion.question}</h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={questionState.isAnswered}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  getAnswerStyle(index)
                } ${questionState.isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {questionState.showResult && index === currentQuestion.correctAnswer && (
                    <span className="text-green-300">✓</span>
                  )}
                  {questionState.showResult && 
                   index === questionState.selectedAnswer && 
                   index !== currentQuestion.correctAnswer && (
                    <span className="text-red-300">✗</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Result Message */}
          {questionState.showResult && (
            <div className="text-center">
              {questionState.selectedAnswer === currentQuestion.correctAnswer ? (
                <div className="text-green-400">
                  <div className="text-2xl mb-2">🎉</div>
                  <p className="font-bold">{t('game.correct')}</p>
                  <p className="text-sm text-gray-400">
                    +{questionState.timeLeft * 10} {t('game.points')}
                  </p>
                </div>
              ) : questionState.selectedAnswer !== null ? (
                <div className="text-red-400">
                  <div className="text-2xl mb-2">❌</div>
                  <p className="font-bold">{t('game.incorrect')}</p>
                  <p className="text-sm text-gray-400">{t('game.correctWas')}: {currentQuestion.options[currentQuestion.correctAnswer]}</p>
                </div>
              ) : (
                <div className="text-yellow-400">
                  <div className="text-2xl mb-2">⏰</div>
                  <p className="font-bold">{t('game.timeUp')}</p>
                  <p className="text-sm text-gray-400">{t('game.correctWas')}: {currentQuestion.options[currentQuestion.correctAnswer]}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Score and Quit Button */}
        <div className="p-4 bg-gray-800">
          <div className="flex items-center justify-between">
            <button
              onClick={handleQuit}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              {t('game.quit')}
            </button>
            <div className="text-center">
              <span className="text-gray-400">{t('game.score')}: </span>
              <span className="text-blue-400 font-bold">{questionState.score}</span>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={
      <Page>
        <div className="flex items-center justify-center h-full bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </Page>
    }>
      <QuestionsContent />
    </Suspense>
  );
}