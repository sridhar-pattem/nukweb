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

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

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

    const userQuery = inputMessage;
    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Get bot response
    setTimeout(async () => {
      const botResponse = await generateBotResponse(userQuery);

      let finalResponse = botResponse;

      // If it's a book search query, perform the search
      if (botResponse === '__BOOK_SEARCH__') {
        const searchTerms = extractSearchTerms(userQuery);
        finalResponse = await searchBooks(searchTerms);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: finalResponse,
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const generateBotResponse = async (query) => {
    // Check if query is about books/catalogue
    const bookQuestionPatterns = [
      /do you have.*book/i,
      /show me.*book/i,
      /books? (on|about|by)/i,
      /search.*book/i,
      /catalogue/i,
      /catalog/i,
      /find.*book/i,
      /looking for.*book/i,
      /any.*books/i,
    ];

    const isBookQuery = bookQuestionPatterns.some(pattern => pattern.test(query));

    if (isBookQuery) {
      // This is a book search query - return a placeholder that will be replaced with API results
      return '__BOOK_SEARCH__';
    }

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

  const extractSearchTerms = (query) => {
    // Remove quotes first to extract the exact title
    let cleanedQuery = query.toLowerCase();

    // Check if there's a quoted phrase - if so, use that as the search term
    const quotedMatch = query.match(/["']([^"']+)["']/);
    if (quotedMatch) {
      return quotedMatch[1].trim();
    }

    // Remove common words and filler phrases
    cleanedQuery = cleanedQuery
      .replace(/\b(do|you|have|any|show|me|all|the|a|an|books?|by|on|about|find|looking|for|called|titled|named|of|in|with|is|are|there|that|this|it|and|or)\b/gi, '')
      .replace(/[?.,!]/g, '')
      .trim();

    return cleanedQuery;
  };

  const searchBooks = async (searchTerm) => {
    try {
      const response = await fetch(`${API_URL}/patron/books/search?search=${encodeURIComponent(searchTerm)}&page=1&limit=10`);

      const data = await response.json();

      if (response.ok && data.books && data.books.length > 0) {
        // Format the book results
        const bookList = data.books.slice(0, 5).map((book, index) => {
          const authors = book.contributors
            ? book.contributors.filter(c => c.role === 'author').map(c => c.name).join(', ')
            : 'Unknown Author';
          const available = book.available_items > 0 ? '✅ Available' : '❌ Not Available';
          return `${index + 1}. "${book.title}" by ${authors}\n   ${available} (${book.available_items}/${book.total_items} copies)`;
        }).join('\n\n');

        const totalCount = data.total || data.books.length;
        const showingMessage = totalCount > 5 ? `\n\nShowing 5 of ${totalCount} results.` : '';

        return `📚 BOOKS FOUND:\n\n${bookList}${showingMessage}\n\nVisit our catalogue to see more details or reserve a book!`;
      } else {
        return `📚 I couldn't find any books matching "${searchTerm}".\n\nTry:\n• Different keywords\n• Author names\n• Book titles\n\nOr visit our catalogue to browse all ${data.total || 10000}+ books!`;
      }
    } catch (error) {
      console.error('Book search error:', error);
      return '📚 Sorry, I\'m having trouble searching our catalogue right now. Please try again or visit our physical library to browse our collection!';
    }
  };

  const quickQuestions = [
    'What are your operating hours?',
    'How much is a library membership?',
    'Do you have books on psychology?',
    'What are your cowork space prices?',
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
