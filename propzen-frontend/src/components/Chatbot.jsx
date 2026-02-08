import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../styles/chatbot.css";

function Chatbot({ onPropertySelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! I'm your property search assistant. I can help you find properties by location, budget, BHK, and more. Try asking: 'Show me houses in Coimbatore under 20000'"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message
    setMessages((prev) => [...prev, { type: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/chatbot/query", {
        message: userMessage
      });

      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: response.data.response,
          properties: response.data.properties || []
        }
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      const errorMessage = error.response?.data?.response || 
                          error.response?.data?.message ||
                          (error.response?.status === 500 ? "Server error. Please check if the backend is running." : error.message) ||
                          "Sorry, I encountered an error. Please try again or use the filters.";
      
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: errorMessage,
          properties: error.response?.data?.properties || []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuery = async (query) => {
    if (isLoading) return;
    
    // Add user message
    setMessages((prev) => [...prev, { type: "user", text: query }]);
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/chatbot/query", {
        message: query
      });

      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: response.data.response,
          properties: response.data.properties || []
        }
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      const errorMessage = error.response?.data?.response || 
                          error.response?.data?.message ||
                          (error.response?.status === 500 ? "Server error. Please check if the backend is running." : error.message) ||
                          "Sorry, I encountered an error. Please try again or use the filters.";
      
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: errorMessage,
          properties: error.response?.data?.properties || []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (text) => {
    // Convert markdown-style formatting to HTML
    const lines = text.split("\n");
    return lines.map((line, index) => {
      // Bold text
      let formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      // Emoji support
      formatted = formatted.replace(/📍/g, "📍");
      formatted = formatted.replace(/💰/g, "💰");
      formatted = formatted.replace(/🏠/g, "🏠");
      formatted = formatted.replace(/📋/g, "📋");
      formatted = formatted.replace(/👤/g, "👤");
      formatted = formatted.replace(/📧/g, "📧");
      formatted = formatted.replace(/📞/g, "📞");
      
      return (
        <span key={index} dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    });
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chatbot"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>
            <path d="M7 9H17V11H7V9ZM7 12H14V14H7V12Z" fill="currentColor"/>
          </svg>
        )}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <h3>VAZHVIDAM Assistant</h3>
                <p>Property Search Helper</p>
              </div>
            </div>
            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
              </svg>
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.type}`}>
                {msg.type === "bot" && (
                  <div className="chatbot-avatar-small">🤖</div>
                )}
                <div className="chatbot-message-content">
                  <div className="chatbot-text">
                    {formatMessage(msg.text)}
                  </div>
                  {msg.properties && msg.properties.length > 0 && (
                    <div className="chatbot-properties">
                      {msg.properties.slice(0, 3).map((property) => (
                        <div
                          key={property._id}
                          className="chatbot-property-card"
                          onClick={() => {
                            if (onPropertySelect) {
                              onPropertySelect(property);
                            }
                          }}
                        >
                          {property.images && property.images.length > 0 && (
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="chatbot-property-image"
                            />
                          )}
                          <div className="chatbot-property-info">
                            <h4>{property.title}</h4>
                            <p className="chatbot-property-location">
                              📍 {property.location?.area || property.location?.city || "N/A"}
                            </p>
                            <p className="chatbot-property-price">
                              ₹{property.price.toLocaleString()}
                            </p>
                            <p className="chatbot-property-type">
                              {property.propertyType} • {property.bhkType || "N/A"}
                            </p>
                          </div>
                        </div>
                      ))}
                      {msg.properties.length > 3 && (
                        <p className="chatbot-more-properties">
                          +{msg.properties.length - 3} more properties. Use filters to see all.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chatbot-message bot">
                <div className="chatbot-avatar-small">🤖</div>
                <div className="chatbot-message-content">
                  <div className="chatbot-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-quick-queries">
            <p>Quick searches:</p>
            <div className="quick-query-buttons">
              <button onClick={() => handleQuickQuery("Show me houses in Coimbatore")}>
                🏠 Coimbatore
              </button>
              <button onClick={() => handleQuickQuery("Properties under 20000")}>
                💰 Under ₹20K
              </button>
              <button onClick={() => handleQuickQuery("2BHK apartments")}>
                🏘️ 2BHK
              </button>
              <button onClick={() => handleQuickQuery("Villas for rent")}>
                🏡 Rent
              </button>
            </div>
          </div>

          <form className="chatbot-input-form" onSubmit={handleSend}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about properties... (e.g., '2BHK in Coimbatore under 30000')"
              className="chatbot-input"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="chatbot-send"
              disabled={!input.trim() || isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;
