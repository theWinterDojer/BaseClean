// Utility functions for managing disclaimer state

const DISCLAIMER_KEY = 'baseClean_disclaimer_agreed';

/**
 * Check if user has agreed to the disclaimer
 */
export function hasUserAgreedToDisclaimer(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DISCLAIMER_KEY) === 'true';
}

/**
 * Mark that user has agreed to the disclaimer
 */
export function setDisclaimerAgreed(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DISCLAIMER_KEY, 'true');
}

/**
 * Reset disclaimer state (for testing purposes)
 * Call this in browser console to reset: window.resetDisclaimer()
 */
export function resetDisclaimer(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DISCLAIMER_KEY);
  console.log('Disclaimer reset. Refresh the page to see the disclaimer again.');
}

// Make resetDisclaimer available globally for testing (not just development)
if (typeof window !== 'undefined') {
  (window as typeof window & { resetDisclaimer: () => void }).resetDisclaimer = resetDisclaimer;
} 