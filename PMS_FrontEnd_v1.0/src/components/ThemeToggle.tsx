import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
  variant?: 'default' | 'compact' | 'floating';
  className?: string;
}

export function ThemeToggle({ 
  isDarkMode, 
  onToggle, 
  variant = 'default',
  className = '' 
}: ThemeToggleProps) {
  
  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${className}`}
        title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
      >
        <div className={`absolute inset-0 transition-transform duration-500 ${isDarkMode ? 'rotate-180' : 'rotate-0'}`}>
          {isDarkMode ? (
            <Sun className="h-4 w-4 text-yellow-500" />
          ) : (
            <Moon className="h-4 w-4 text-blue-600" />
          )}
        </div>
      </Button>
    );
  }

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-50 group">
        <Button
          onClick={onToggle}
          className={`relative w-14 h-14 rounded-full shadow-lg backdrop-blur-sm border transition-all duration-300 hover:scale-110 ${className}`}
          style={{
            background: isDarkMode ? 'rgba(30, 30, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            borderColor: 'var(--border)',
          }}
          title={isDarkMode ? '라이트 모드로 전환 (Ctrl+Shift+T)' : '다크 모드로 전환 (Ctrl+Shift+T)'}
        >
          <div className={`transition-all duration-500 ${isDarkMode ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
            {isDarkMode ? (
              <Sun className="h-6 w-6 text-yellow-400" />
            ) : (
              <Moon className="h-6 w-6 text-blue-600" />
            )}
          </div>
        </Button>
        
        {/* 키보드 단축키 힌트 */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Ctrl+Shift+T
          </div>
        </div>
      </div>
    );
  }

  // Default variant - Switch-like toggle
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Sun className={`h-4 w-4 transition-colors duration-300 ${!isDarkMode ? 'text-yellow-500' : 'text-muted-foreground'}`} />
      
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
          isDarkMode ? 'bg-primary' : 'bg-muted'
        }`}
        style={{
          background: isDarkMode ? 'var(--primary)' : 'var(--muted)',
        }}
        title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
            isDarkMode ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      
      <Moon className={`h-4 w-4 transition-colors duration-300 ${isDarkMode ? 'text-blue-400' : 'text-muted-foreground'}`} />
    </div>
  );
}