import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles, Globe } from 'lucide-react';
import { aiAPI } from '../services/api';

export default function AIChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am WorkPay AI Assistant. How can I help you today? You can ask me in English, Kannada, or Hindi about hiring workers, jobs, or safe digital payments.'
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickPrompts = {
    en: ['How do I hire an electrician?', 'How are payments protected?', 'How can workers withdraw earnings?'],
    kn: ['ಎಲೆಕ್ಟ್ರಿಷಿಯನ್ ಹೇಗೆ ನೇಮಿಸುವುದು?', 'ಪಾವತಿಗಳು ಹೇಗೆ ಸುರಕ್ಷಿತ?', 'ಗಳಿಕೆಯನ್ನು ಹೇಗೆ ಹಿಂಪಡೆಯುವುದು?'],
    hi: ['कामगार को कैसे काम पर रखें?', 'पेमेंट कैसे सुरक्षित है?', 'कारीगर पैसे कैसे निकाल सकते हैं?']
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await aiAPI.chat({
        message: text,
        language,
        sessionId: 'session_' + (window.workpay_session || (window.workpay_session = Math.random().toString(36).substring(2, 9)))
      });

      if (res.data?.success) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: 'bot', text: res.data.reply }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'bot', text: 'I apologize, but I encountered a network error. Please try again or check platform FAQs.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-electric-600 to-electric-500 text-white p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2 border-2 border-white/20"
        title="Open WorkPay AI Assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        <span className="hidden md:inline font-semibold text-sm">Ask AI</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-navy-900 text-white p-4 flex items-center justify-between border-b border-navy-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-electric-600/30 border border-electric-400 flex items-center justify-center text-electric-400">
                <Sparkles className="w-5 h-5 text-electric-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm">WorkPay AI Assistant</h3>
                <span className="text-xs text-emerald-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Online • Multilingual</span>
                </span>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-navy-800 rounded-lg p-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400 mr-1 ml-0.5" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-navy-900 text-white">English</option>
                <option value="kn" className="bg-navy-900 text-white">ಕನ್ನಡ (Kannada)</option>
                <option value="hi" className="bg-navy-900 text-white">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-sm">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start space-x-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-electric-600 text-white flex items-center justify-center shrink-0 text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[80%] whitespace-pre-wrap leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-electric-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 shadow-sm rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-400 text-white flex items-center justify-center shrink-0 text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs pl-9">
                <span className="w-2 h-2 rounded-full bg-electric-500 animate-pulse"></span>
                <span>WorkPay AI is analyzing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-white border-t border-slate-100 flex overflow-x-auto space-x-1.5 text-xs no-scrollbar">
            {(quickPrompts[language] || quickPrompts.en).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap bg-slate-100 hover:bg-electric-50 hover:text-electric-600 text-slate-600 px-2.5 py-1 rounded-full transition-colors font-medium border border-slate-200"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                language === 'kn' ? 'ಇಲ್ಲಿ ಪ್ರಶ್ನೆ ಕೇಳಿ...' : language === 'hi' ? 'यहाँ अपना प्रश्न पूछें...' : 'Type your question...'
              }
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-electric-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 bg-electric-600 text-white rounded-xl hover:bg-electric-700 disabled:opacity-50 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

