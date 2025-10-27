import React from 'react';
import { KEYBOARD_LAYOUT } from '../constants';
import { BackspaceIcon } from './Icons';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
}

export const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 sm:gap-2">
          {row.map((key) => {
            const isSpecialKey = key === 'Backspace' || key === 'Space';
            const keyContent = key === 'Backspace' 
              ? <BackspaceIcon className="w-5 h-5" /> 
              : key === 'Space' 
              ? '' 
              : key.toUpperCase();

            return (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className={`
                  h-10 sm:h-12 
                  font-semibold text-slate-200 
                  rounded-md sm:rounded-lg
                  transition-all duration-100 ease-in-out
                  flex items-center justify-center
                  border-b-4
                  shadow-sm shadow-black/30
                  ${isSpecialKey 
                    ? 'bg-slate-600/50 border-slate-800/80 hover:bg-slate-500/50 active:bg-slate-400/50' 
                    : 'bg-slate-700/50 border-slate-900/60 hover:bg-slate-600/50 active:bg-slate-500/50'
                  }
                  active:border-b-0 active:translate-y-1
                  ${key === 'Space' ? 'flex-grow w-48 sm:w-80' : 'w-8 sm:w-12'}
                `}
                aria-label={key}
              >
                {keyContent}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};