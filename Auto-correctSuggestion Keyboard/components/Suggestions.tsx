import React from 'react';

interface SuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isLoading: boolean;
}

export const Suggestions: React.FC<SuggestionsProps> = ({ suggestions, onSuggestionClick, isLoading }) => {
  return (
    <div className="h-14 flex items-center justify-center gap-2 sm:gap-3 p-2 bg-slate-900/50 rounded-xl border border-slate-700/50">
      {isLoading && (
        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full animate-fade-in">
          <div className="w-24 h-8 rounded-lg animate-shimmer"></div>
          <div className="w-20 h-8 rounded-lg animate-shimmer"></div>
          <div className="w-28 h-8 rounded-lg animate-shimmer"></div>
        </div>
      )}
      {!isLoading && suggestions.length > 0 && (
        <div className="flex items-center justify-center gap-2 sm:gap-3 animate-fade-in">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion}-${index}`}
              onClick={() => onSuggestionClick(suggestion)}
              className="px-4 py-1.5 bg-gradient-to-r from-cyan-600/60 to-blue-600/60 text-cyan-100 rounded-lg font-medium border border-cyan-500/30 shadow-md shadow-black/20 hover:from-cyan-500/70 hover:to-blue-500/70 hover:-translate-y-0.5 transform transition-all duration-200 ease-in-out active:scale-95 active:translate-y-0"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      {!isLoading && suggestions.length === 0 && (
        <div className="animate-fade-in">
          <p className="text-slate-500">Type a word and a space to see suggestions...</p>
        </div>
      )}
    </div>
  );
};