import { useEffect, useState, useCallback, useRef } from "react";
import { getServices } from "./services/serviceApi";
import { sendChatMessage } from "./services/chatApi";
import { getMe, logoutUser } from "./services/authApi";
import { fetchSubscriptions, saveSubscription } from "./services/subscriptionApi";
import { SERVICE_CATALOG, getServiceBySlugOrId } from "./services/serviceCatalog";

import AppHeader from "./components/AppHeader";
import ServicesSection from "./components/ServicesSection";
import ChatbotLauncher from "./components/ChatbotLauncher";
import ChatbotPanel from "./components/ChatbotPanel";
import AuthPage from "./components/AuthPage";
import DashboardView from "./components/DashboardView";
import ServiceDetailPage from "./components/ServiceDetailPage";

import "./App.css";

// Helper to sanitize bot responses: remove markdown asterisks and hash marks
function stripMarkdownFormatting(raw) {
  if (!raw) return "";
  let clean = raw;
  // Replace bold **text** -> text
  clean = clean.replace(/\*\*([^*]+)\*\*/g, "$1");
  // Replace italic *text* -> text
  clean = clean.replace(/\*([^*\n]+)\*/g, "$1");
  // Replace leading bullets: * item or - item -> • item
  clean = clean.replace(/^[\*\-]\s+/gm, "• ");
  // Remove any remaining stray asterisks
  clean = clean.replace(/\*/g, "");
  // Remove markdown headers: ### Heading -> Heading
  clean = clean.replace(/^#{1,6}\s+/gm, "");
  // Remove backticks
  clean = clean.replace(/`([^`]+)`/g, "$1");
  clean = clean.replace(/`/g, "");
  return clean.trim();
}


// Unique, stable message ID generator
let messageCounter = 0;
function createUniqueMessageId(prefix) {
  messageCounter += 1;
  return `${prefix}_${Date.now()}_${messageCounter}_${Math.random().toString(36).substring(2, 9)}`;
}

function App() {
  // Service catalog data
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Authentication & Session state
  const [authChecking, setAuthChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState("auth"); // "auth" | "landing" | "dashboard" | "service-detail"
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [selectedServiceSlug, setSelectedServiceSlug] = useState("web-hosting");

  // Demonstration Subscriptions state
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subsError, setSubsError] = useState("");

  // Chatbot state
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [sending, setSending] = useState(false);

  // Synchronization refs to prevent stale closure bugs in hash change events
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  const subsRef = useRef(activeSubscriptions);
  subsRef.current = activeSubscriptions;

  // Navigation helper
  const navigateTo = useCallback((view, hash = "") => {
    setCurrentView(view);
    if (hash) {
      if (window.location.hash !== "#" + hash) {
        window.location.hash = hash;
      }
    }
  }, []);

  // Parse hash and decide view based on authentication and saved plans
  const parseHash = useCallback((user, subs = []) => {
    const rawHash = window.location.hash.replace(/^#\/?/, "");

    // A. /#login or /#register
    if (rawHash === "login" || rawHash === "register") {
      if (user) {
        // Authenticated user visiting login/register: redirect by saved plans
        if (subs && subs.length > 0) {
          navigateTo("dashboard", "dashboard");
        } else {
          navigateTo("landing", "services");
        }
      } else {
        setAuthMode(rawHash === "register" ? "register" : "login");
        setCurrentView("auth");
      }
      return;
    }

    // B. /#dashboard
    if (rawHash === "dashboard") {
      if (user) {
        setCurrentView("dashboard");
      } else {
        // Unauthenticated access to protected route: redirect to login
        setAuthMode("login");
        navigateTo("auth", "login");
      }
      return;
    }

    // C. /#services/:slug
    if (rawHash.startsWith("services/")) {
      const slug = rawHash.replace("services/", "").trim();
      setSelectedServiceSlug(slug || "web-hosting");
      setCurrentView("service-detail");
      return;
    }

    // D. /#services or /#home
    if (rawHash === "services" || rawHash === "home") {
      setCurrentView("landing");
      setTimeout(() => {
        const el = document.getElementById("services");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return;
    }

    // E. Empty or unknown hash:
    if (user) {
      // Authenticated user with no specific hash:
      if (subs && subs.length > 0) {
        navigateTo("dashboard", "dashboard");
      } else {
        navigateTo("landing", "services");
      }
    } else {
      // Unauthenticated visitor: default to login page as required by HR
      setAuthMode("login");
      navigateTo("auth", "login");
    }
  }, [navigateTo]);

  // Fetch subscriptions helper
  const loadUserSubscriptions = useCallback(async () => {
    setSubsLoading(true);
    setSubsError("");
    try {
      const data = await fetchSubscriptions();
      const list = Array.isArray(data) ? data : [];
      setActiveSubscriptions(list);
      return list;
    } catch (err) {
      console.warn("Unable to load user subscriptions:", err);
      setSubsError("Unable to load demonstration subscriptions.");
      return [];
    } finally {
      setSubsLoading(false);
    }
  }, []);

  // Initial session verification on application mount
  useEffect(() => {
    let isActive = true;

    async function initSession() {
      try {
        const session = await getMe();
        if (isActive && session.authenticated && session.user) {
          setCurrentUser(session.user);
          currentUserRef.current = session.user;

          // Retrieve saved demonstration plans from backend
          const subs = await loadUserSubscriptions();
          if (isActive) {
            parseHash(session.user, subs);
          }
        } else {
          if (isActive) {
            setCurrentUser(null);
            currentUserRef.current = null;
            setActiveSubscriptions([]);
            subsRef.current = [];
            parseHash(null, []);
          }
        }
      } catch (err) {
        console.warn("Session check error:", err);
        if (isActive) {
          setCurrentUser(null);
          currentUserRef.current = null;
          setActiveSubscriptions([]);
          parseHash(null, []);
        }
      } finally {
        if (isActive) {
          setAuthChecking(false);
        }
      }
    }

    initSession();

    // Listen to hash change events using current refs
    function onHashChange() {
      parseHash(currentUserRef.current, subsRef.current);
    }

    window.addEventListener("hashchange", onHashChange);
    return () => {
      isActive = false;
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [loadUserSubscriptions, parseHash]);

  // Load published services catalog from API
  useEffect(() => {
    let isActive = true;

    async function loadCatalog() {
      try {
        const data = await getServices();
        if (isActive) {
          setServices(data);
        }
      } catch (err) {
        console.error("Service loading error:", err);
        if (isActive) {
          setError("Unable to load services. Please check backend connection.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadCatalog();
    return () => {
      isActive = false;
    };
  }, []);

  // Open authentication view
  function handleOpenAuth(mode = "login") {
    setAuthMode(mode);
    navigateTo("auth", mode);
  }

  // Handle successful login or registration
  async function handleAuthSuccess(user) {
    setCurrentUser(user);
    currentUserRef.current = user;

    // Reset guest chat messages when switching to authenticated user session
    setChatMessages([]);
    setMessage("");

    // Retrieve saved plans from backend
    const subs = await loadUserSubscriptions();

    // Decide destination based on saved plans
    if (subs && subs.length > 0) {
      navigateTo("dashboard", "dashboard");
    } else {
      navigateTo("landing", "services");
      setTimeout(() => {
        const el = document.getElementById("services");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }

  // Handle user logout
  async function handleLogout() {
    try {
      await logoutUser();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      // Invalidate state & clear chat history
      setCurrentUser(null);
      currentUserRef.current = null;
      setActiveSubscriptions([]);
      subsRef.current = [];
      setChatMessages([]);
      setMessage("");
      sessionStorage.removeItem("bf_demo_subscriptions");
      setAuthMode("login");
      navigateTo("auth", "login");
    }
  }

  // Service details selection
  function handleSelectService(slugOrId) {
    const s = getServiceBySlugOrId(slugOrId);
    if (s) {
      setSelectedServiceSlug(s.slug);
      navigateTo("service-detail", "services/" + s.slug);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Demonstration subscription save
  async function handleSubscribeDemo(service, plan) {
    if (!currentUser) {
      handleOpenAuth("login");
      return;
    }

    const payload = {
      service_id: service.id,
      service_name: service.name,
      plan_id: plan.id,
      plan_name: plan.name,
      price: plan.price,
      price_display: plan.price_display,
      billing_cycle: plan.billing_cycle,
      status: "Active (Demo)",
      renewal_date: "Demo Renewal: Next Billing Cycle"
    };

    const saved = await saveSubscription(payload);
    const savedObj = saved.subscription || saved;

    setActiveSubscriptions((prev) => {
      const filtered = prev.filter((s) => s.service_id !== service.id);
      return [...filtered, savedObj];
    });
  }

  // Chat message submission
  async function handleSendMessage(e, promptOverride) {
    if (e && e.preventDefault) e.preventDefault();
    const textToSend = (promptOverride !== undefined ? promptOverride : message).trim();
    if (!textToSend || sending) return;

    const userMsg = {
      id: createUniqueMessageId("user"),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setSending(true);

    try {
      const res = await sendChatMessage(textToSend, currentUserRef.current || currentUser, subsRef.current || activeSubscriptions);
      const rawBotText = typeof res === "string" ? res : (res?.reply || res?.message || "I am here to help you navigate BusinessFlow AI services and demonstration plans.");
      // Sanitize response to remove unwanted markdown asterisks
      const cleanBotText = stripMarkdownFormatting(rawBotText);

      setChatMessages((prev) => [
        ...prev,
        {
          id: createUniqueMessageId("assistant"),
          sender: "assistant",
          text: cleanBotText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: createUniqueMessageId("error"),
          sender: "assistant",
          text: "I am having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleOpenChatWithPrompt(initialText) {
    setMessage(initialText);
    setChatOpen(true);
  }

  // Active service for detail view
  const currentDetailService = getServiceBySlugOrId(selectedServiceSlug) || SERVICE_CATALOG[0];

  // While checking initial session, display a smooth loading indicator instead of flashing login
  if (authChecking) {
    return (
      <div className="app-init-loader" aria-busy="true" role="status">
        <div className="app-init-card">
          <span className="brand-mark">✳</span>
          <h2>BusinessFlow AI</h2>
          <div className="dashboard-spinner" aria-hidden="true" />
          <p>Verifying secure session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Universal Header (hidden only when on dedicated Auth split-page) */}
      {currentView !== "auth" && (
        <AppHeader
          currentUser={currentUser}
          currentView={currentView}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          onNavigateHome={() => navigateTo("landing", "services")}
          onNavigateDashboard={() => navigateTo("dashboard", "dashboard")}
        />
      )}

      {/* Main Content Router */}
      <main className="app-main-content">
        {currentView === "auth" && (
          <AuthPage
            initialMode={authMode}
            onSuccess={handleAuthSuccess}
            onNavigateHome={() => navigateTo("landing", "services")}
          />
        )}

        {currentView === "landing" && (
          <div className="landing-view">
            {/* Exploration Hero Banner */}
            <section className="services-hero-banner">
              <div className="hero-content-wrap">
                <span className="hero-eyebrow-tag">BUSINESSFLOW CLOUD SUITE</span>
                <h1 className="hero-main-title">
                  Enterprise Cloud Infrastructure, Simplified
                </h1>
                <p className="hero-description-text">
                  Explore scalable cloud hosting, secure object storage, and professional business email. Select demonstration plans to test our platform without financial risk.
                </p>
                <div className="hero-cta-group">
                  <a href="#services" className="hero-primary-btn">
                    Explore Available Services →
                  </a>
                  {currentUser ? (
                    <button
                      type="button"
                      className="hero-secondary-btn"
                      onClick={() => navigateTo("dashboard", "dashboard")}
                    >
                      Go to Customer Dashboard →
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="hero-secondary-btn"
                      onClick={() => handleOpenAuth("login")}
                    >
                      Sign In to Account →
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Service Exploration Section */}
            <ServicesSection
              services={services}
              loading={loading}
              error={error}
              onSelectService={handleSelectService}
            />
          </div>
        )}

        {currentView === "service-detail" && (
          <ServiceDetailPage
            service={currentDetailService}
            currentUser={currentUser}
            activeSubscriptions={activeSubscriptions}
            onSubscribeDemo={handleSubscribeDemo}
            onOpenChatWithPrompt={handleOpenChatWithPrompt}
            onNavigateBack={() => navigateTo("landing", "services")}
            onNavigateAuth={handleOpenAuth}
          />
        )}

        {currentView === "dashboard" && (
          <DashboardView
            user={currentUser}
            currentUser={currentUser}
            activeSubscriptions={activeSubscriptions}
            loading={subsLoading}
            error={subsError}
            onRetry={loadUserSubscriptions}
            onExploreServicesCatalog={() => navigateTo("landing", "services")}
            onNavigateCatalog={() => navigateTo("landing", "services")}
            onSelectService={handleSelectService}
            onOpenChatWithPrompt={handleOpenChatWithPrompt}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* AI Chatbot Floating Launcher */}
      <ChatbotLauncher
        open={chatOpen}
        isOpen={chatOpen}
        onClick={() => setChatOpen((prev) => !prev)}
        onToggle={() => setChatOpen((prev) => !prev)}
      />

      {/* Grounded AI Chatbot Panel */}
      <ChatbotPanel
        open={chatOpen}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chatMessages}
        message={message}
        inputMessage={message}
        setMessage={setMessage}
        onInputChange={setMessage}
        onSend={handleSendMessage}
        onSubmit={handleSendMessage}
        sending={sending}
        onSuggestedPrompt={(prompt) => handleSendMessage(null, prompt)}
        onPromptClick={(prompt) => handleSendMessage(null, prompt)}
      />
    </div>
  );
}

export default App;
