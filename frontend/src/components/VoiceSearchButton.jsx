import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { aiAPI } from '../services/api';

export default function VoiceSearchButton({ onVoiceResult, className = '' }) {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleToggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use text search.');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Indian English default; also catches common phrases

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage('');
      };

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);

        // Optionally parse query through AI to extract category & location
        try {
          const aiParsed = await aiAPI.parseVoiceSearch(transcript);
          if (onVoiceResult) {
            onVoiceResult(transcript, aiParsed.data);
          }
        } catch (err) {
          if (onVoiceResult) {
            onVoiceResult(transcript, null);
          }
        }
      };

      recognition.onerror = (event) => {
        console.warn('[Speech Recognition Error]:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Please allow microphone permissions.');
        } else {
          setErrorMessage('Could not recognize voice. Please try speaking clearly or use text.');
        }
        setTimeout(() => setErrorMessage(''), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setErrorMessage('Speech recognition initialization failed.');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleToggleVoice}
        className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
          isListening
            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
        } ${className}`}
        title={isListening ? 'Listening... click to stop' : 'Search with your voice'}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-electric-600" />}
      </button>

      {errorMessage && (
        <div className="absolute top-12 left-0 z-50 w-64 bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-xl border border-slate-700">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

