import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [categories, setCategories] = useState([]);
  const [popularQuestions, setPopularQuestions] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showTyping, setShowTyping] = useState(false);
  const [showCategoryQuestions, setShowCategoryQuestions] = useState(false);
  const [categoryQuestions, setCategoryQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const messagesEndRef = useRef(null);
  const placeholderIndex = useRef(0);
  const [placeholder, setPlaceholder] = useState('Ask about buying a property...');

  const placeholders = [
    'Ask about buying a property...',
    'Need help with mortgage rates?',
    'How to sell my property?',
    'Questions about renting?',
    'Ask me anything about real estate...',
  ];

  useEffect(() => {
    document.title = 'AI Chatbot Assistant - Real Estate';
    fetchChatbotData();
    
    // Placeholder cycling
    const placeholderInterval = setInterval(() => {
      placeholderIndex.current = (placeholderIndex.current + 1) % placeholders.length;
      setPlaceholder(placeholders[placeholderIndex.current]);
    }, 3000);

    return () => clearInterval(placeholderInterval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, showTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatbotData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chatbot');
      const data = await response.json();

      if (data.success) {
        setCategories(data.data.categories || []);
        setPopularQuestions(data.data.popularQuestions || []);
        setChatHistory(data.data.chatHistory || []);

        // Initialize with welcome message
        const welcomeMessage = {
          type: 'bot',
          text: "Hello! I'm your AI assistant. How can I help you today with real estate?\n\nYou can ask me about buying, selling, renting properties, or getting a loan.",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);

        // Add chat history if available
        if (data.data.chatHistory && data.data.chatHistory.length > 0) {
          const historyMessages = [];
          data.data.chatHistory.forEach((interaction) => {
            historyMessages.push({
              type: 'user',
              text: interaction.query,
              timestamp: new Date(interaction.timestamp),
            });
            historyMessages.push({
              type: 'bot',
              text: interaction.response,
              timestamp: new Date(interaction.timestamp),
            });
          });
          setMessages([welcomeMessage, ...historyMessages]);
        }
      }
    } catch (error) {
      console.error('Error fetching chatbot data:', error);
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async (question) => {
    if (!question.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      text: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessageInput('');

    // Show typing indicator
    setShowTyping(true);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Send question to server
      const response = await fetch('/api/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      setShowTyping(false);

      if (data.success) {
        // Add bot response
        const botMessage = {
          type: 'bot',
          text: data.answer,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);

        // Add related questions if available
        if (data.relatedQuestions && data.relatedQuestions.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const suggestionsMessage = {
            type: 'bot',
            text: 'You might also be interested in:',
            suggestions: data.relatedQuestions,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, suggestionsMessage]);
        }
      } else {
        const errorMessage = {
          type: 'bot',
          text: "I'm sorry, I couldn't process your question at this time. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      setShowTyping(false);
      const errorMessage = {
        type: 'bot',
        text: "I'm having trouble connecting. Please check your internet connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const loadCategoryQuestions = async (categoryId, categoryDisplayName) => {
    try {
      const response = await fetch(`/api/chatbot/category/${categoryId}`);
      const data = await response.json();

      if (data.success && data.questions.length > 0) {
        setCategoryName(categoryDisplayName);
        setCategoryQuestions(data.questions);
        setShowCategoryQuestions(true);
        setSelectedCategory(categoryId);
      }
    } catch (error) {
      console.error('Error loading category questions:', error);
    }
  };

  const handleCategoryClick = (category) => {
    loadCategoryQuestions(category.id, category.name);
  };

  const handlePopularQuestionClick = (question) => {
    askQuestion(question.question);
  };

  const handleCategoryQuestionClick = (question) => {
    askQuestion(question.question);
    setShowCategoryQuestions(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      askQuestion(messageInput);
    }
  };

  if (loading) {
    return (
      <div className="chatbot-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading chatbot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-page">
      <div className="chatbot-layout">
        {/* Sidebar */}
        <div className="chatbot-sidebar">
          <div className="chatbot-sidebar-inner">
            <h5>AI Chatbot Assistant</h5>
            <p>Ask me anything about our real estate platform, properties, buying, selling, or getting help.</p>

            <h6>Choose a Topic</h6>
            <div className="list-group">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`list-group-item ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <i className={`fas ${category.icon}`}></i>
                  {category.name}
                </button>
              ))}
            </div>

            <h6>Popular Questions</h6>
            <div className="list-group popular-questions">
              {popularQuestions.map((question, idx) => (
                <button
                  key={idx}
                  className="list-group-item"
                  onClick={() => handlePopularQuestionClick(question)}
                >
                  <i className="fas fa-question-circle"></i>
                  {question.question}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chatbot-main">
          {/* Messages Container */}
          <div className="chat-messages-container">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.type}-message`}>
                <div className="chat-avatar">
                  <i className={`fas ${msg.type === 'bot' ? 'fa-robot' : 'fa-user'}`}></i>
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                    {msg.suggestions && (
                      <div className="suggested-questions">
                        {msg.suggestions.map((q, i) => (
                          <button
                            key={i}
                            className="suggested-link"
                            onClick={() => askQuestion(q.question)}
                          >
                            <i className="fas fa-question-circle"></i> {q.question}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {showTyping && (
              <div className="chat-message bot-message">
                <div className="chat-avatar">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="typing-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Category Questions Section */}
          {showCategoryQuestions && (
            <div className="category-questions-section">
              <h6>Common Questions in {categoryName}</h6>
              <div className="questions-grid">
                {categoryQuestions.map((q, idx) => (
                  <div key={idx} className="category-question-card">
                    <button onClick={() => handleCategoryQuestionClick(q)}>
                      <i className="fas fa-question-circle"></i>
                      {q.question}
                    </button>
                  </div>
                ))}
              </div>
              <button className="close-category-btn" onClick={() => setShowCategoryQuestions(false)}>
                <i className="fas fa-times"></i> Close
              </button>
            </div>
          )}

          {/* Chat Input Area */}
          <div className="chat-input-area">
            <form onSubmit={handleFormSubmit} className="chat-form">
              <input
                type="text"
                className="message-input"
                placeholder={placeholder}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                autoComplete="off"
              />
              <button type="submit" className="send-button">
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
            <div className="input-hint">
              <i className="fas fa-info-circle"></i> Not finding what you need? Contact our{' '}
              <a href="/support">support team</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
