import { create } from 'zustand';

export const useThemeStore = create((set) => {
  const storedTheme = localStorage.getItem("theme") || "dark"; // Get theme from localStorage

  return {
    theme: storedTheme, // Initialize theme state
    setTheme: (theme) => {
      localStorage.setItem("theme", theme); // Persist to localStorage
      set({ theme });
    },
  };
});
