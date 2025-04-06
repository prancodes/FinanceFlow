import React, { useEffect, useState, useRef } from 'react';
import { FaRobot, FaTimes, FaTrash, FaPaperPlane } from 'react-icons/fa';

const FinanceChatbot = ({ account }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const message = input.trim();
    const timestamp = new Date().toLocaleTimeString();

    setMessages(prev => [...prev, { sender: 'user', text: message, timestamp }]);
    setInput('');
    setIsTyping(true);

    try {
      const contextualizedMessage = `Regarding my ${account.type} account with balance ₹${Number(account.balance).toFixed(2)}: ${message}`;
      const response = await fetch(`/api/dashboard/${account._id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: contextualizedMessage }),
      });
      const data = await response.json();
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: data.reply, timestamp: new Date().toLocaleTimeString() },
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Sorry, an error occurred.', timestamp: new Date().toLocaleTimeString() },
      ]);
    }
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const clearChat = () => setMessages([]);

  const suggestions = [
    "How much did I spend this month?",
    "What's my current balance?",
    "Show my recent expenses",
    "Financial tips for savings"
  ];

  const formatMessage = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
  
    const formatInline = (line) => {
      return line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>');             // italic
    };
  
    const isBullet = (line) => /^(\*|-)/.test(line.trim());
  
    return (
      <div>
        {lines.map((line, idx) =>
          isBullet(line) ? (
            <li
              key={idx}
              className="ml-6 list-disc marker:text-blue-600 text-sm text-gray-800"
              dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^(\*|-)\s*/, '')) }}
            />
          ) : (
            <p
              key={idx}
              className="text-sm text-gray-800 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: formatInline(line) }}
            />
          )
        )}
      </div>
    );
  };
  
  return (
    <div>
      {/* Chat Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 bg-gradient-to-r from-[#005AA7] to-[#2E8BC0] hover:from-[#004C91] hover:to-[#267BAF] text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center transform hover:scale-110"
          aria-label="Open Finance Assistant"
        >
          <FaRobot size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 w-[90%] sm:w-96 max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-blue-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#005AA7] to-[#2E8BC0] text-white p-4 flex justify-between items-center rounded-t-3xl">
            <div className="flex items-center space-x-2">
              <FaRobot size={20} />
              <span className="font-bold text-lg">Finance Assistant</span>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={clearChat}
                className="text-white/80 hover:text-white transition"
                title="Clear chat"
              >
                <FaTrash size={16} />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition"
                title="Close assistant"
              >
                <FaTimes size={20} />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-blue-50/10">
            {messages.length === 0 && (
              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">
                  👋 Hi! I’m your assistant for the {account.name} account.
                </p>
                <p className="mb-3">
                  Current balance: 
                  <span className={`font-semibold ml-1 ${Number(account.balance) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{Number(account.balance).toFixed(2)}
                  </span>
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-xl shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                  }`}
                >
                  <div className="space-y-1">
                    {msg.sender === 'bot' ? formatMessage(msg.text) : <p>{msg.text}</p>}
                  </div>
                  <small className={`block text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                    {msg.timestamp}
                  </small>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-800 px-3 py-2 rounded-xl shadow-sm">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "600ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length === 0 && (
            <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex flex-wrap gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current && inputRef.current.focus();
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-white border border-blue-300 text-blue-600 hover:bg-blue-100 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-blue-100 bg-white">
            <div className="flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 border border-blue-200 focus-within:ring-2 focus-within:ring-blue-300">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your finances..."
                className="flex-1 bg-transparent p-1 focus:outline-none text-gray-700 text-sm"
              />
              <button 
                onClick={handleSendMessage} 
                disabled={!input.trim()}
                className={`p-2 rounded-full flex items-center justify-center transition-colors ${
                  input.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FaPaperPlane size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceChatbot;
