import React, { useEffect, useRef } from "react";
import { Message, Turn } from "../types";

interface ChatInterfaceProps {
  messages: Message[];
  currentTurn: Turn;
  isProcessing: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  currentTurn,
  isProcessing,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white border-l border-r border-gray-200 shadow-inner">
      <div className="p-3 border-b border-gray-100 bg-gray-50 text-center">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Interface / Spoken Layer
        </h3>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10 italic">
            Simulation ready. Start the conversation.
          </div>
        )}

        {messages.map((msg) => {
          const isAlice = msg.sender === "Alice";
          return (
            <div
              key={msg.id}
              className={`flex w-full ${isAlice ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  isAlice
                    ? "bg-blue-100 text-blue-900 rounded-tl-none"
                    : "bg-purple-100 text-purple-900 rounded-tr-none"
                }`}
              >
                <span className="block text-[10px] font-bold opacity-50 mb-1">
                  {msg.sender}
                </span>
                {msg.text}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className={`flex w-full ${currentTurn === 'ALICE' ? "justify-start" : "justify-end"}`}>
             <div className="bg-gray-100 rounded-full px-4 py-2 text-xs text-gray-500 animate-pulse">
               {currentTurn === 'ALICE' ? 'Alice' : 'Bob'} is thinking recursively...
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
