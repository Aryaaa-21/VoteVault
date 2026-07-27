import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      }}
      className="p-2 rounded-lg bg-white/5 text-[#8E8E93] hover:text-[#F5F5F5] hover:bg-white/10 transition-colors relative flex items-center justify-center cursor-pointer"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0, scale: 1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="flex items-center justify-center text-[#F5F5F5]"
      >
        {theme === 'dark' ? (
          <Moon className="w-4 h-4 text-[#F2C94C]" />
        ) : (
          <Sun className="w-4 h-4 text-[#F2C94C]" />
        )}
      </motion.div>
    </button>
  );
};
