import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../../domain/constants';

export function useTheme() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME_DARK);
    return saved !== null ? saved === 'true' : true;
  });

  const [backgroundAccent, setBackgroundAccent] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME_ACCENT) || 'none';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME_DARK, String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME_ACCENT, backgroundAccent);
  }, [backgroundAccent]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return {
    darkMode,
    setDarkMode,
    toggleDarkMode,
    backgroundAccent,
    setBackgroundAccent,
  };
}
