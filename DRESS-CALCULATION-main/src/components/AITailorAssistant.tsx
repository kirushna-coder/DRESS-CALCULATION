// ============================================================
// FabriPlay – AI Tailor Assistant (Floating Interactive Assistant)
// Floating bottom-right chat widget with instant tailoring intelligence Q&A
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Scissors,
  HelpCircle,
  Minimize2,
  Trash2,
} from 'lucide-react';
import type { Measurements, DressType, FabricType } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    actionKey: string;
  };
}

interface AITailorAssistantProps {
  measurements?: Measurements;
  currentDressType?: DressType;
  currentFabricType?: FabricType;
  onNavigateTab?: (tabName: any) => void;
}

const QUICK_QUESTIONS = [
  'How much fabric is needed for a shirt?',
  'Which fabric is better for summer?',
  'What is Slim Fit?',
  'What is Regular Fit?',
  'Which dress is suitable for my measurements?',
  'Cotton vs Linen?',
  'How can I reduce fabric waste?',
];

const AITailorAssistant: React.FC<AITailorAssistantProps> = ({
  measurements,
  currentDressType = 'FROCK',
  currentFabricType = 'COTTON',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('fabriplay-ai-chat-history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'welcome-1',
        sender: 'ai',
        text: 'Hello! 👋 I am your FabriPlay AI Tailor Assistant. Ask me anything about fabric calculations, sizing, fit options, or reducing fabric waste!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('fabriplay-ai-chat-history', JSON.stringify(messages));
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    if (!isOpen) {
      setUnreadCount(0);
    }
    setIsOpen((prev) => !prev);
  };

  const getAIAnswer = (query: string): string => {
    const q = query.toLowerCase();

    // 1. Shirt fabric requirement
    if (q.includes('shirt') && (q.includes('fabric') || q.includes('much') || q.includes('length'))) {
      return 'For a standard Men’s/Women’s Full-Sleeve Shirt, you typically need 2.15 to 2.40 meters (44" width fabric). For half-sleeves, 1.80 to 2.0 meters is sufficient. If using wider 58" fabric, requirement drops to ~1.6 meters!';
    }

    // 2. Summer fabric selection
    if (q.includes('summer') || q.includes('hot') || q.includes('breathable')) {
      return 'For hot summer weather, 100% Pure Cotton and Pure Linen are the top choices! Linen offers 95%+ breathability and high moisture wicking. Pure Cotton or Rayon offer soft, lightweight skin comfort.';
    }

    // 3. Slim Fit
    if (q.includes('slim fit') || (q.includes('slim') && q.includes('what'))) {
      return 'Slim Fit garments cut closer to the body with reduced ease allowances (+1.0" to +1.5" ease at bust/chest and waist). It emphasizes a streamlined, modern contour silhouette. Recommended for athletic and balanced body shapes.';
    }

    // 4. Regular Fit
    if (q.includes('regular fit') || (q.includes('regular') && q.includes('what'))) {
      return 'Regular Fit is the classical tailored cut providing +2.0" ease allowance. It balances sleek drape with free body movement, making it ideal for daily office and comfortable wear across all body types.';
    }

    // 5. Which dress suitable for my measurements
    if (q.includes('suitable') || q.includes('my measurements') || q.includes('recommend my')) {
      const bust = measurements?.bust || 36;
      const waist = measurements?.waist || 30;
      const hip = measurements?.hip || 38;
      const ratio = waist / Math.max(1, hip);

      let suggestion = `Based on your live profile (Bust: ${bust}", Waist: ${waist}", Hip: ${hip}"): `;
      if (ratio < 0.8) {
        suggestion += 'An A-Line Frock, Tailored Kurta, or Fitted Blouse with flared skirt will accentuate your waist curve elegantly!';
      } else {
        suggestion += 'A Structured Shirt, Kurta, or Straight-Fit Outfit will provide a balanced, flattering silhouette.';
      }
      return suggestion;
    }

    // 6. Cotton vs Linen
    if (q.includes('cotton vs linen') || q.includes('linen vs cotton') || (q.includes('cotton') && q.includes('linen'))) {
      return 'Cotton vs Linen Breakdown:\n• Cotton: Softer against skin, easier to iron, versatile for daily wear, budget-friendly (₹250-450/m).\n• Linen: Highly breathable, stiffer crisp structure, naturally antibacterial, premium summer drape (₹450-850/m).\nChoose Linen for premium summer shirts/trousers, Cotton for daily casual garments!';
    }

    // 7. Fabric waste reduction
    if (q.includes('waste') || q.includes('reduce fabric') || q.includes('cutting efficiency')) {
      return 'To reduce fabric waste in tailoring:\n1. Choose optimal width fabric (58" width cuts waste down from 18% to under 6%).\n2. Use Interlocking Nested Layouts during pattern positioning.\n3. Save offcuts for collar linings, pocket bags, or decorative bias piping.';
    }

    // 8. Frock/Kurta/Blouse specific queries
    if (q.includes('frock') || q.includes('kurta') || q.includes('blouse') || q.includes('pant')) {
      return `For current garment (${currentDressType}): Make sure to include seam allowances and double-check body height. You can view 2D CAD pattern and estimated waste percentage under the Dress Calculation tab!`;
    }

    // Default intelligent tailoring answer
    return `That’s a great tailoring question! For optimal garment drape with ${currentFabricType} and ${currentDressType}, ensure you measure with 2" ease allowance. You can test your profile in the Size Intelligence section or use the Fabric Recommendation engine!`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const aiReplyText = getAIAnswer(text);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-1',
        sender: 'ai',
        text: 'Chat history cleared. How can I assist you with your tailoring calculations today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="ai-tailor-assistant-container">
      {/* Floating Action Trigger Button */}
      <button
        type="button"
        className={`ai-assistant-trigger-btn ${isOpen ? 'active' : ''}`}
        onClick={toggleChat}
        aria-label="Toggle AI Tailor Assistant"
        title="Open AI Tailor Assistant"
      >
        <div className="btn-glow-layer" />
        <div className="btn-icon-inner">
          {isOpen ? <X size={22} /> : <Bot size={24} />}
        </div>
        {!isOpen && unreadCount > 0 && (
          <span className="unread-dot-badge">{unreadCount}</span>
        )}
        <span className="trigger-label-tooltip">AI Tailor Assistant</span>
      </button>

      {/* Floating Chat Panel Window */}
      {isOpen && (
        <div className="ai-chat-panel-overlay">
          {/* Chat Header */}
          <div className="chat-panel-header">
            <div className="header-identity">
              <div className="ai-avatar-circle">
                <Bot size={20} />
                <span className="online-indicator-dot" />
              </div>
              <div className="header-text">
                <div className="title-row">
                  <h4>FabriPlay AI Tailor</h4>
                  <span className="ai-chip-sm">
                    <Sparkles size={10} /> Assistant
                  </span>
                </div>
                <span className="status-sub-text">Online &bull; Instant Tailoring Intelligence</span>
              </div>
            </div>

            <div className="header-actions">
              <button
                type="button"
                className="action-icon-btn"
                onClick={clearChat}
                title="Clear Chat History"
              >
                <Trash2 size={15} />
              </button>
              <button
                type="button"
                className="action-icon-btn"
                onClick={toggleChat}
                title="Minimize Panel"
              >
                <Minimize2 size={15} />
              </button>
            </div>
          </div>

          {/* Quick Question Suggestion Chips */}
          <div className="chat-suggestions-bar">
            <div className="suggestions-scroll-container">
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-chip-btn"
                  onClick={() => handleSendMessage(q)}
                >
                  <HelpCircle size={12} />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="chat-messages-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble-wrapper ${msg.sender === 'user' ? 'user-msg' : 'ai-msg'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="msg-avatar ai">
                    <Scissors size={14} />
                  </div>
                )}
                <div className="bubble-content-box">
                  <p className="bubble-text">{msg.text}</p>
                  <span className="msg-timestamp">{msg.timestamp}</span>
                </div>
                {msg.sender === 'user' && (
                  <div className="msg-avatar user">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="chat-bubble-wrapper ai-msg">
                <div className="msg-avatar ai">
                  <Bot size={14} />
                </div>
                <div className="bubble-content-box typing-box">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <form
            className="chat-input-footer"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              className="chat-text-input"
              placeholder="Ask AI Tailor (e.g. fabric for shirt, slim fit...)"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!inputMessage.trim()}
              title="Send Question"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AITailorAssistant;
