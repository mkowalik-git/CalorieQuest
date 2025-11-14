import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getChatResponse } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';

const healthTips = [
    "💡 Quick Tip: Drink a glass of water before every meal. It can help with digestion and make you feel fuller!",
    "💡 Quick Tip: Aim for 7-9 hours of quality sleep per night. It's crucial for muscle recovery and hormone regulation.",
    "💡 Quick Tip: Incorporate more fiber into your diet with foods like oats, beans, apples, and carrots.",
    "💡 Quick Tip: Don't skip breakfast! A balanced breakfast kickstarts your metabolism for the day.",
    "💡 Quick Tip: Try 'meal prepping' on weekends to make healthy eating easier during the busy week.",
    "💡 Quick Tip: Take short breaks to walk and stretch if you have a desk job. Every bit of movement counts!",
    "💡 Quick Tip: Strength training at least twice a week helps build muscle, which boosts your metabolism."
];

export const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', parts: [{text: "Alright, I'm here. Ask me about nutrition, fitness, or why you crave cheese at 3 AM. I've got (mostly) good answers."}]}
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const tipTimeoutRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const scheduleTip = () => {
    // Clear any existing timer
    if (tipTimeoutRef.current) {
        clearTimeout(tipTimeoutRef.current);
    }
    // Set a new timer
    tipTimeoutRef.current = window.setTimeout(() => {
        const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
        const tipMessage: ChatMessage = { role: 'model', parts: [{text: randomTip}] };
        setMessages(prev => [...prev, tipMessage]);
    }, 20000); // 20 seconds of inactivity
  };
  
  useEffect(() => {
    if (!isLoading) {
      scheduleTip();
    }
    // Cleanup timer on component unmount
    return () => {
      if (tipTimeoutRef.current) {
        clearTimeout(tipTimeoutRef.current);
      }
    };
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    // Clear tip timer when user sends a message
    if (tipTimeoutRef.current) {
        clearTimeout(tipTimeoutRef.current);
    }

    const userMessage: ChatMessage = { role: 'user', parts: [{text: input}] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const history = [...messages, userMessage];
        const response = await getChatResponse(history, input);
        const modelMessage: ChatMessage = { role: 'model', parts: [{text: response.text}]};
        setMessages(prev => [...prev, modelMessage]);
    } catch (error: any) {
        const errorText = error.message || 'Sorry, I encountered an error. Please try again.';
        const errorMessage: ChatMessage = { role: 'model', parts: [{text: errorText}]};
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] max-h-[700px] bg-white rounded-2xl shadow-lg">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0"><SparklesIcon className="w-5 h-5"/></div>}
              <div
                className={`max-w-md p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-secondary text-white rounded-br-none'
                    : 'bg-base-200 text-neutral rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.parts[0].text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0"><SparklesIcon className="w-5 h-5"/></div>
              <div className="max-w-md p-3 rounded-2xl bg-base-200 text-neutral rounded-bl-none">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse-fast"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse-fast [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse-fast [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-base-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            className="flex-1 p-3 border border-base-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
            className="bg-primary text-white rounded-full p-3 hover:bg-primary-focus disabled:bg-primary/50 transition duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
