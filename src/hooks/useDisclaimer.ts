import { useState, useEffect } from 'react';
import { hasUserAgreedToDisclaimer, setDisclaimerAgreed, resetDisclaimer as resetDisclaimerUtil } from '@/utils/disclaimer';

export function useDisclaimer() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already agreed to disclaimer
    const hasAgreed = hasUserAgreedToDisclaimer();
    setShowDisclaimer(!hasAgreed);
    setIsLoading(false);
  }, []);

  const handleAgree = () => {
    setDisclaimerAgreed();
    setShowDisclaimer(false);
  };

  const resetDisclaimer = () => {
    resetDisclaimerUtil();
    setShowDisclaimer(true);
  };

  return {
    showDisclaimer,
    isLoading,
    handleAgree,
    resetDisclaimer
  };
} 