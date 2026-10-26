import { useEffect, useRef } from "react";

const SUGGESTED_PROMPTS = [
  "What services does BusinessFlow AI offer?",
  "Which plan am I using?",
  "What is my current Cloud Storage plan?",
];

function ChatbotPanel({
  open,
  isOpen,
  onClose,
  messages = [],
  message = "",
  inputMessage,
  setMessage,
  onInputChange,
  onSend,
  onSubmit,
  sending = false,
  onSuggestedPrompt,
  onPromptClick,
}) {
  const isPanelOpen = Boolean(open ?? isOpen ?? true);
  const currentMessage = message || inputMessage || "";
  const handleInputChange = setMessage || onInputChange;
  const handleSendForm = onSend || onSubmit;
  const handlePromptClick = onSuggestedPrompt || onPromptClick;

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isPanelOpen) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, sending, isPanelOpen]);

  useEffect(() => {
    if (!isPanelOpen) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [isPanelOpen]);

  function handleSuggestedPrompt(prompt) {
    if (sending) return;
    if (handlePromptClick) {
      handlePromptClick(prompt);
    } else if (handleSendForm) {
      handleSendForm({ preventDefault() {} }, prompt);
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (sending) return;
    if (handleSendForm) handleSendForm(e);
  }

  return (
    <section
      id="businessflow-chatbot"
      className={`chatbot-panel${isPanelOpen ? " open" : ""}`}
      aria-label="BusinessFlow AI chat assistant"
      aria-hidden={!isPanelOpen}
    >
      <header className="chatbot-header">
        <div className="chatbot-header-info">
          <div className="chatbot-avatar" aria-hidden="true">
            ✦
          </div>

          <div>
            <h2>AI Chatbot</h2>
            <p>BusinessFlow Cloud Assistant</p>
          </div>
        </div>

        <button
          type="button"
          className="chatbot-close"
          onClick={onClose}
          aria-label="Close chatbot"
        >
          ×
        </button>
      </header>

      <div
        className="chatbot-messages"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {messages.length === 0 && (
          <div className="chatbot-welcome">
            <h3>How can I help you today?</h3>
            <p>
              Ask a question about our services or get guidance
              on your next business step.
            </p>
          </div>
        )}

        {messages.map((item, index) => {
          const isUser = item.sender === "user";
          const senderClass = isUser ? "user" : "assistant";

          return (
            <div
              key={item.id || (`msg_${item.sender || "chat"}_${index}`)}
              className={`chat-message ${senderClass}`}
            >
              <div className="chat-message-bubble">
                {item.text}
              </div>
            </div>
          );
        })}

        {sending && (
          <div
            className="chat-message assistant"
            aria-label="Assistant is responding"
          >
            <div className="chatbot-typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <div className="chatbot-suggestions">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                type="button"
                className="chatbot-suggestion"
                key={prompt}
                disabled={sending}
                onClick={() => handleSuggestedPrompt(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chatbot-form" onSubmit={handleFormSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="chatbot-input"
          placeholder="Ask a question..."
          value={currentMessage}
          onChange={(e) => handleInputChange && handleInputChange(typeof e === 'string' ? e : e.target.value)}
          disabled={sending}
          aria-label="Chat message"
        />

        <button
          type="submit"
          className="chatbot-send"
          disabled={sending || !currentMessage.trim()}
          aria-label="Send message"
        >
          {sending ? "..." : "Send"}
        </button>
      </form>
    </section>
  );
}

export default ChatbotPanel;
