import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNextWordSuggestions, fetchAutocorrection } from './services/geminiService';
import { Keyboard } from './components/Keyboard';
import { Suggestions } from './components/Suggestions';
import { TextArea } from './components/TextArea';
import { GithubIcon, SparklesIcon } from './components/Icons';

const App: React.FC = () => {
  const [text, setText] = useState<string>('The quick brown fox');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getSuggestions = useCallback(async (currentText: string) => {
    if (!currentText.trim() || !currentText.endsWith(' ')) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchNextWordSuggestions(currentText);
      setSuggestions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (text.endsWith(' ')) {
        getSuggestions(text);
      } else {
        setSuggestions([]);
      }
    }, 200);

    return () => {
      clearTimeout(handler);
    };
  }, [text, getSuggestions]);
  
  // Fetch initial suggestions
  useEffect(() => {
      getSuggestions(text + ' ');
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const focusTextarea = () => {
    textareaRef.current?.focus();
  };

  const handleKeyPress = (key: string) => {
    focusTextarea();
    if (key === 'Backspace') {
      setText((prev) => prev.slice(0, -1));
    } else if (key === 'Space') {
      const currentText = text;
      const words = currentText.trim().split(/\s+/);
      const lastWord = words.length > 0 ? words[words.length - 1] : '';

      // Add space immediately for responsiveness
      setText((prev) => prev + ' ');

      // Fire-and-forget auto-correction
      if (lastWord) {
        (async () => {
          const correctedWord = await fetchAutocorrection(lastWord);
          if (correctedWord && correctedWord.toLowerCase() !== lastWord.toLowerCase()) {
            setText((prevText) => {
              // Use a regex to replace the last occurrence of the word to handle punctuation
              const pattern = new RegExp(`\\b${lastWord}\\s$`);
              if (pattern.test(prevText)) {
                return prevText.replace(pattern, `${correctedWord} `);
              }
              return prevText;
            });
          }
        })();
      }
    } else {
      setText((prev) => prev + key.toLowerCase());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    focusTextarea();
    // Ensure the text ends with the prefix of the suggestion if it was partially typed
    const words = text.trim().split(/\s+/);
    const lastWord = words[words.length - 1];
    let newText = text.trimEnd();

    if (suggestion.toLowerCase().startsWith(lastWord.toLowerCase())) {
        newText = newText.substring(0, newText.length - lastWord.length);
    }
    
    setText(newText + suggestion + ' ');
    setSuggestions([]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-2 sm:p-4">
      <main className="w-full max-w-3xl bg-slate-800/30 rounded-2xl shadow-2xl shadow-black/50 backdrop-blur-xl border border-slate-700/50 flex flex-col overflow-hidden">
        <header className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500/10 rounded-full flex items-center justify-center ring-1 ring-inset ring-cyan-500/20">
              <SparklesIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">Predictive Keyboard AI</h1>
          </div>
          <a href="https://github.com/gemini-ui/gemini-ui" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
            <GithubIcon className="w-6 h-6" />
          </a>
        </header>

        <div className="p-4 sm:p-6 flex-grow">
          <TextArea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
          />
        </div>
        
        {error && (
            <div className="px-4 sm:px-6 pb-4">
                <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>
            </div>
        )}

        <div className="px-4 sm:px-6 pb-4">
            <Suggestions
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
                isLoading={isLoading}
            />
        </div>
        
        <footer className="bg-slate-900/40 p-2 sm:p-4 border-t border-slate-700/50">
          <Keyboard onKeyPress={handleKeyPress} />
        </footer>
      </main>
    </div>
  );
};

export default App;