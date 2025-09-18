'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const t = useTranslations('welcome');
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: t('steps.0.title'),
      description: t('steps.0.description'),
      icon: '🧠',
    },
    {
      title: t('steps.1.title'),
      description: t('steps.1.description'),
      icon: '⚡',
    },
    {
      title: t('steps.2.title'),
      description: t('steps.2.description'),
      icon: '🏆',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as completed
      localStorage.setItem('onboardingCompleted', 'true');
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white relative overflow-x-hidden flex flex-col justify-between p-6">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-4">
        {/* Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-glow animate-bounce">
          {steps[currentStep].icon}
        </div>

        {/* Title */}
        <h1 className="text-white text-3xl font-bold mb-4 leading-tight">
          {steps[currentStep].title}
        </h1>

        {/* Description */}
        <p className="text-gray-300 text-lg mb-8 max-w-sm leading-relaxed">
          {steps[currentStep].description}
        </p>

        {/* Step indicators */}
        <div className="flex space-x-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-glow scale-110' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div className="relative z-10 space-y-4 p-4">

        {/* Next/Get Started button */}
        <button
          onClick={handleNext}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-glow hover:shadow-strong"
        >
          <span className="flex items-center justify-center space-x-2">
            <span>{currentStep === steps.length - 1 ? t('getStarted') : t('next')}</span>
            <span className="text-xl">→</span>
          </span>
        </button>
      </div>
    </div>
  );
}