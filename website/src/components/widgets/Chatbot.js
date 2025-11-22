import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa';
import knowledgeBase from '../../config/chatbotKnowledge.json';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: knowledgeBase.responses.greeting.response,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response - will be replaced with API call
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const generateBotResponse = (query) => {
    // Search through all response categories in the knowledge base
    for (const value of Object.values(knowledgeBase.responses)) {
      if (value.keywords && value.keywords.some(keyword => {
        // Use word boundary matching to avoid substring matches (e.g., "hi" in "membership")
        const regex = new RegExp('\\b' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
        return regex.test(query);
      })) {
        return value.response;
      }
    }

    // Return fallback if no match found
    return knowledgeBase.fallback;
  };

  const quickQuestions = [
    'What are your operating hours?',
    'How much is a library membership?',
    'Do you have WiFi?',
    'What activities do you offer?',
  ];

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 1000,
          }}
        >
          {/* Pulsing ring animation */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#FFD24E',
              opacity: 0.3,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />

          {/* Helper text bubble */}
          <div
            style={{
              position: 'absolute',
              bottom: '75px',
              right: '0',
              backgroundColor: 'white',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#1E1E1E',
              animation: 'fadeInUp 0.5s ease-out',
            }}
          >
            👋 Need help? Ask me anything!
          </div>

          <button
            onClick={() => setIsOpen(true)}
            style={{
              position: 'relative',
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              backgroundColor: '#FFD24E',
              color: '#003d7a',
              border: 'none',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
            }}
            aria-label="Open chatbot"
          >
            <FaRobot />
          </button>

          {/* Add CSS animations */}
          <style>{`
            @keyframes pulse {
              0%, 100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.3;
              }
              50% {
                transform: translate(-50%, -50%) scale(1.2);
                opacity: 0.1;
              }
            }

            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '400px',
            maxWidth: 'calc(100vw - 2rem)',
            height: '600px',
            maxHeight: 'calc(100vh - 4rem)',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#003d7a',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FaRobot size={24} />
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Nuk Assistant</h4>
                <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
              aria-label="Close chatbot"
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              backgroundColor: '#F5F5DC',
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: message.sender === 'user' ? '#003d7a' : 'white',
                    color: message.sender === 'user' ? 'white' : '#1E1E1E',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    whiteSpace: 'pre-line',
                    lineHeight: '1.5',
                  }}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#6c757d' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'currentColor',
                    animation: 'typing 1.4s infinite',
                  }}
                />
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'currentColor',
                    animation: 'typing 1.4s 0.2s infinite',
                  }}
                />
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'currentColor',
                    animation: 'typing 1.4s 0.4s infinite',
                  }}
                />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div style={{ padding: '0.5rem 1rem', backgroundColor: 'white', borderTop: '1px solid var(--light-gray)' }}>
              <p style={{ fontSize: '0.875rem', margin: '0 0 0.5rem', color: '#1E1E1E' }}>Quick questions:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      backgroundColor: '#F5F5DC',
                      color: '#1E1E1E',
                      border: '1px solid #EAE7E0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#003d7a';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F5F5DC';
                      e.currentTarget.style.color = '#1E1E1E';
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '1rem',
              backgroundColor: 'white',
              borderTop: '1px solid var(--light-gray)',
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #EAE7E0',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '0.95rem',
                color: '#1E1E1E',
              }}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#003d7a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                opacity: inputMessage.trim() ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}

      <style>
        {`
          @keyframes typing {
            0%, 60%, 100% {
              transform: translateY(0);
            }
            30% {
              transform: translateY(-10px);
            }
          }
        `}
      </style>
    </>
  );
};

export default Chatbot;
