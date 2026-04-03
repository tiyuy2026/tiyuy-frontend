import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '../store/onboardingStore';

export const useOnboarding = () => {
  const router = useRouter();
  const {
    currentStep,
    totalSteps,
    isCompleted,
    nextStep,
    prevStep,
    goToStep,
    completeOnboarding,
    resetOnboarding,
  } = useOnboardingStore();

  const handleNext = () => {
    if (currentStep < totalSteps) {
      nextStep();
      const routes = ['/onboarding/welcome', '/onboarding/kyc', '/onboarding/configuracion'];
      router.push(routes[currentStep]); // currentStep ya fue incrementado
    } else {
      completeOnboarding();
      router.push('/dashboard');
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      prevStep();
      const routes = ['/onboarding/welcome', '/onboarding/kyc', '/onboarding/configuracion'];
      router.push(routes[currentStep - 2]);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return {
    currentStep,
    totalSteps,
    isCompleted,
    progress,
    handleNext,
    handlePrev,
    goToStep,
    completeOnboarding,
    resetOnboarding,
  };
};
