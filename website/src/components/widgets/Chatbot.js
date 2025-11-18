import React, { useState, useRef, useEffect } from 'react';
import { FaComment, FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! Welcome to Nuk Library. How can I help you today?',
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
    const lowerQuery = query.toLowerCase();

    // Facility & Services
    if (lowerQuery.includes('hour') || lowerQuery.includes('open') || lowerQuery.includes('time')) {
      return 'We are open:\n• Monday - Friday: 9:00 AM - 9:00 PM\n• Saturday - Sunday: 10:00 AM - 9:00 PM\n• Library is closed on Mondays (facility remains open)\n• Closed on public holidays';
    }

    if (lowerQuery.includes('location') || lowerQuery.includes('address') || lowerQuery.includes('where')) {
      return 'Nuk Library is located in Bangalore, Karnataka, India. We\'re easily accessible by public transport. Would you like directions?';
    }

    if (lowerQuery.includes('parking')) {
      return 'Street parking is available on a first-come, first-served basis. We also have tie-ups with nearby paid parking facilities for long-term parking needs.';
    }

    if (lowerQuery.includes('wifi') || lowerQuery.includes('internet')) {
      return 'Yes! We provide high-speed WiFi (100 Mbps) for all cowork and study space members.';
    }

    if (lowerQuery.includes('ac') || lowerQuery.includes('air condition')) {
      return 'Yes, our entire facility is air-conditioned for your comfort.';
    }

    if (lowerQuery.includes('restroom') || lowerQuery.includes('washroom') || lowerQuery.includes('toilet')) {
      return 'We have clean, well-maintained restrooms available for all members and visitors.';
    }

    if (lowerQuery.includes('power backup') || lowerQuery.includes('generator')) {
      return 'Yes, we have power backup with a generator to ensure uninterrupted service.';
    }

    // Membership Plans
    if (lowerQuery.includes('membership') || lowerQuery.includes('join') || lowerQuery.includes('plan')) {
      return 'We offer three library membership plans:\n• Basic: ₹500/month - Borrow 2 books\n• Standard: ₹800/month - Borrow 4 books (Most Popular!)\n• Premium: ₹1,200/month - Borrow 6 books + extra perks\n\nWould you like to know more about any specific plan?';
    }

    // Cowork Space
    if (lowerQuery.includes('cowork') || lowerQuery.includes('workspace')) {
      return 'Our Cowork Space offers:\n• Day Pass: ₹300\n• Weekly: ₹1,800\n• Monthly: ₹6,000 (includes dedicated desk & locker)\n\nAll plans include high-speed WiFi, AC, power backup, and café access. Would you like to book a tour?';
    }

    // Study Space
    if (lowerQuery.includes('study')) {
      return 'Our Study Space pricing:\n• Half-Day (4 hours): ₹100\n• Full Day: ₹150\n• Monthly: ₹3,000 (includes reserved desk & locker)\n\nAll plans provide a completely silent environment perfect for focused learning.';
    }

    // Meeting Rooms
    if (lowerQuery.includes('meeting room')) {
      return 'We have two meeting rooms available:\n• Small Room (4-6 people): ₹200/hour\n• Large Room (10-12 people): ₹400/hour\n\nBoth include whiteboard, presentation equipment, and AC. Booking required 24 hours in advance.';
    }

    // Seating
    if (lowerQuery.includes('seat') || lowerQuery.includes('capacity')) {
      return 'We have:\n• 30+ cowork seats\n• 50+ study space seats\n• 2 meeting rooms\n\nAll seating is first-come, first-served for day passes. Monthly members get reserved desks.';
    }

    // Books & Catalogue
    if (lowerQuery.includes('book') && !lowerQuery.includes('facebook')) {
      if (lowerQuery.includes('how many') || lowerQuery.includes('collection')) {
        return 'We have over 10,000 books in our collection covering all genres and age groups - from toddlers to adults!';
      }
      return 'To search for specific books, please use our online catalogue or visit us. I can help with general questions about our collection!';
    }

    // Activities
    if (lowerQuery.includes('chess')) {
      return 'Chess classes are held on Wednesdays & Saturdays, 5:00 PM - 6:30 PM for children (6-12) and teens (13-17). Monthly tournaments are organized!';
    }

    if (lowerQuery.includes('art')) {
      return 'Our Art Club meets on Saturdays & Sundays, 4:00 PM - 6:00 PM. Learn watercolors, acrylics, sketching, and more with our in-house artists!';
    }

    if (lowerQuery.includes('toastmaster') || lowerQuery.includes('speaking')) {
      return 'We host two Toastmasters clubs (for children and adults) every Friday, 6:00 PM - 8:00 PM. Great for developing public speaking skills!';
    }

    if (lowerQuery.includes('rubik')) {
      return 'Rubik\'s Cube training is held on Thursdays, 5:00 PM - 6:00 PM. Learn solving techniques and improve your speed!';
    }

    // Greetings
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
      return 'Hello! How can I help you today? You can ask me about:\n• Our services and facilities\n• Membership plans\n• Operating hours\n• Location and parking\n• Events and activities\n• Book availability';
    }

    if (lowerQuery.includes('thank')) {
      return 'You\'re welcome! Feel free to ask if you have any other questions. Happy reading! 📚';
    }

    // Default response
    return 'I can help you with:\n• Facility information (hours, location, parking, amenities)\n• Membership plans (library, cowork, study space)\n• Services details\n• Activities and events\n• General questions\n\nWhat would you like to know?';
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
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-peru)',
            color: 'white',
            border: 'none',
            boxShadow: 'var(--shadow-lg)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            zIndex: 1000,
            transition: 'transform var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          aria-label="Open chatbot"
        >
          <FaComment />
        </button>
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
              backgroundColor: 'var(--secondary-brown)',
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
              backgroundColor: 'var(--light-beige)',
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
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: message.sender === 'user' ? 'var(--accent-peru)' : 'white',
                    color: message.sender === 'user' ? 'white' : 'var(--text-charcoal)',
                    boxShadow: 'var(--shadow-sm)',
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
              <p style={{ fontSize: '0.875rem', margin: '0 0 0.5rem', color: '#6c757d' }}>Quick questions:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      backgroundColor: 'var(--light-beige)',
                      border: '1px solid var(--light-gray)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-peru)', e.currentTarget.style.color = 'white')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--light-beige)', e.currentTarget.style.color = 'var(--text-charcoal)')}
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
                border: '1px solid var(--light-gray)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                fontSize: '0.95rem',
              }}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--accent-peru)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
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
