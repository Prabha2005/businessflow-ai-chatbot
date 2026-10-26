function ChatbotLauncher({ open, isOpen, onClick, onToggle }) {
  const isPanelOpen = Boolean(open ?? isOpen ?? false);
  const handleClick = onClick || onToggle;

  return (
    <button
      type="button"
      className={`chatbot-launcher${isPanelOpen ? " open" : ""}`}
      onClick={handleClick}
      aria-label={isPanelOpen ? "Close AI Chatbot" : "Open AI Chatbot"}
      aria-expanded={isPanelOpen}
      aria-controls="businessflow-chatbot"
      title={isPanelOpen ? "Close AI Chatbot" : "Open AI Chatbot"}
    >
      {isPanelOpen ? (
        <span aria-hidden="true">×</span>
      ) : (
        <span aria-hidden="true">✦</span>
      )}
    </button>
  );
}

export default ChatbotLauncher;
