import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import type React from 'react';

export const OnboardingScreen: React.FC<{isLLMProvidersEmpty: boolean, isLLMModelsEmpty: boolean}> = ({isLLMProvidersEmpty, isLLMModelsEmpty}) => {
  const navigate = useNavigate();

  const goToSettings = () => {
    if (isLLMProvidersEmpty) {
      navigate({to:'/settings/llm-providers'});
    } else if (isLLMModelsEmpty) {
      navigate({to:'/settings/general'});
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground p-8">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to LLM Chat!</h1>
        <p className="text-lg mb-8">
          {isLLMProvidersEmpty && isLLMModelsEmpty ? <span>It looks like you haven't configured any <strong>LLM providers</strong> and <strong>LLM models</strong> yet.</span>:
           !isLLMProvidersEmpty && isLLMModelsEmpty ? <span>Yay! It looks like you have configured <strong>LLM providers</strong> but not <strong>LLM models</strong> yet.</span> : <span>It looks like you haven't configured any <strong>LLM models</strong> yet.</span>}
          To start chatting, please set up your preferred <strong>LLM provider</strong> and <strong>LLM model</strong> in the settings.
        </p>
        <Button size="lg" onClick={goToSettings}>
          {isLLMProvidersEmpty ? <span>Go to LLM Providers</span> : <span>Go to General Settings</span>}
        </Button>
        <p className="text-sm text-muted-foreground mt-12">
          Once you've added an <strong>LLM provider</strong> and selected a <strong>LLM model</strong>, you'll be able to start your conversations.
        </p>
      </div>
    </div>
  );
};