'use client';

import LanguageToggle from './language-toggle';
import HelpButton from './help-button';
import ThemeToggle from './theme-toggle';

export default function TopControls() {
  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[100] flex items-center gap-2 sm:gap-3">
      <HelpButton />
      <ThemeToggle />
      <LanguageToggle />
    </div>
  );
}
