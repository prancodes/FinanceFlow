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
      // Focus input when chat is opened
      if (isOpen && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isOpen]);
  
    const handleSendMessage = async () => {
        if (!input.trim()) return;
        const message = input.trim();
        const timestamp = new Date().toLocaleTimeString();
        
        // Show the original message to the user
        setMessages(prev => [...prev, { sender: 'user', text: message, timestamp }]);
        setInput('');
        setIsTyping(true);
      
        try {
          // Add context for the backend query
          const contextualizedMessage = `Regarding my ${account.type} account with balance ₹${Number(account.balance).toFixed(2)}: ${message}`;
          
          const response = await fetch(`/api/dashboard/${account._id}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: contextualizedMessage })
          });
          const data = await response.json();
          setMessages(prev => [...prev, { sender: 'bot', text: data.reply, timestamp: new Date().toLocaleTimeString() }]);
        } catch (error) {
          setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, an error occurred.', timestamp: new Date().toLocaleTimeString() }]);
        }
        setIsTyping(false);
      };
  
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleSendMessage();
      }
    };
  
    // Add suggestions based on account information
    const suggestions = [
      "How much did I spend this month?",
      "What's my current balance?",
      "Show my recent expenses",
      "Financial tips for savings"
    ];
  
    // Clear chat history
    const clearChat = () => {
      setMessages([]);
    };
  
    return (
      <div>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-5 right-5 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center transform hover:scale-110"
            aria-label="Open Finance Assistant"
          >
            <FaRobot size={24} />
          </button>
        )}
        
        {isOpen && (
          <div className="fixed bottom-5 right-5 w-96 bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 animate-fadeInUp flex flex-col max-h-[70vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FaRobot size={20} />
                <span className="font-semibold">Finance Assistant</span>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={clearChat}
                  className="text-white/80 hover:text-white transition"
                  title="Clear conversation"
                >
                  <FaTrash size={16} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition"
                  title="Close assistant"
                >
                  <FaTimes size={18} />
                </button>
              </div>
            </div>
            
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="bg-gray-50 p-4 text-center text-gray-600 text-sm">
                <p className="mb-2">👋 Hi! I'm your finance assistant. Ask me anything about your {account.name} account.</p>
                <p className="mb-3">Current balance: 
                  <span className={`font-semibold ${Number(account.balance) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{Number(account.balance).toFixed(2)}
                  </span>
                </p>
              </div>
            )}
            
            {/* Chat Messages */}
            <div className="p-4 flex-1 overflow-y-auto flex flex-col space-y-3" style={{ minHeight: "260px", maxHeight: "50vh" }}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    <small className={`block text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>{msg.timestamp}</small>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            {/* Suggestions chips */}
            {messages.length === 0 && (
              <div className="px-4 py-2 flex flex-wrap gap-2 bg-gray-50 border-t border-gray-200">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="text-xs bg-white text-blue-600 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-50 transition"
                    onClick={() => {
                      setInput(suggestion);
                      if (inputRef.current) inputRef.current.focus();
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            {/* Input Area */}
            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg pl-4 pr-2 py-1 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your finances..."
                  className="flex-1 bg-transparent p-2 focus:outline-none text-gray-700"
                />
                <button 
                  onClick={handleSendMessage} 
                  disabled={!input.trim()}
                  className={`p-2 rounded-md flex items-center justify-center transition-colors ${
                    input.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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