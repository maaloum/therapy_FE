import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useSocket } from "../../context/SocketContext";
import toast from "react-hot-toast";
import { format, formatDistanceToNow } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ClientMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const messagesEndRef = useRef(null);
  const sendingRef = useRef(false);
  const { socket } = useSocket();
  const { t } = useTranslation();

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/messages/conversations`);
      setConversations(response.data.data.conversations || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast.error(t("messages.failedToLoad") || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [t]);

  const markAsRead = useCallback(async (userId) => {
    if (!userId) return;
    try {
      await axios.patch(`${API_URL}/messages/read/${userId}`);
      // Update unread count in conversations
      setConversations((prev) =>
        prev.map((conv) =>
          conv.user.id === userId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        console.log("Socket connected in Messages component");
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error in Messages:", error);
        toast.error(
          t("messages.connectionError") || "Failed to connect to chat server"
        );
      });

      socket.on("new-message", (message) => {
        if (
          message.senderId === selectedConversation ||
          message.receiverId === selectedConversation
        ) {
          setMessages((prev) => [...prev, message]);
          // Mark as read
          if (selectedConversation) {
            markAsRead(selectedConversation);
          }
        }
        // Update conversation list
        fetchConversations();
      });

      socket.on("message-sent", (message) => {
        // Always set sending to false when message is sent
        setSending(false);
        sendingRef.current = false;

        // Add message to the list if it's for the current conversation
        if (
          message.senderId === selectedConversation ||
          message.receiverId === selectedConversation
        ) {
          setMessages((prev) => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some((m) => m.id === message.id);
            if (exists) return prev;
            return [...prev, message];
          });
        }
        // Refresh conversations to update last message
        fetchConversations();
      });

      socket.on("error", (error) => {
        console.error("Socket error in Messages:", error);
        toast.error(
          error.message ||
            t("messages.failedToSend") ||
            "Failed to send message"
        );
        setSending(false);
        sendingRef.current = false;
      });

      return () => {
        socket.off("connect");
        socket.off("connect_error");
        socket.off("new-message");
        socket.off("message-sent");
        socket.off("error");
      };
    }
  }, [socket, selectedConversation, fetchConversations, markAsRead, t]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(
        `${API_URL}/messages/conversation/${userId}`
      );
      setMessages(response.data.data.messages || []);
      setSelectedConversation(userId);
      // Find the user info from conversations
      const conversation = conversations.find((c) => c.user.id === userId);
      setSelectedUser(conversation?.user || null);
      // Mark messages as read
      await markAsRead(userId);
      // Hide conversations list on mobile when conversation is selected
      setShowConversations(false);
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error(
        t("messages.failedToLoadMessages") || "Failed to load messages"
      );
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) {
      return;
    }

    const messageContent = newMessage.trim();
    setSending(true);
    sendingRef.current = true;
    setNewMessage(""); // Clear input immediately for better UX

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (sendingRef.current) {
        setSending(false);
        sendingRef.current = false;
        toast.error(
          t("messages.failedToSend") ||
            "Message sending timed out. Please try again."
        );
      }
    }, 10000); // 10 second timeout

    // Try socket first, fallback to REST API
    if (socket && socket.connected) {
      try {
        socket.emit(
          "send-message",
          {
            receiverId: selectedConversation,
            content: messageContent,
            type: "TEXT",
          },
          (ack) => {
            // Handle acknowledgment if provided
            clearTimeout(timeoutId);
            if (ack && ack.error) {
              setSending(false);
              sendingRef.current = false;
              toast.error(
                ack.error ||
                  t("messages.failedToSend") ||
                  "Failed to send message"
              );
            }
          }
        );
        // Note: setSending(false) will be called by the "message-sent" event handler
        return;
      } catch (error) {
        console.error("Socket emit error:", error);
        // Fall through to REST API fallback
      }
    }

    // Fallback to REST API if socket is not available
    try {
      clearTimeout(timeoutId);
      const response = await axios.post(`${API_URL}/messages`, {
        receiverId: selectedConversation,
        content: messageContent,
        type: "TEXT",
      });

      if (response.data.success) {
        const message = response.data.data.message;
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
        setSending(false);
        sendingRef.current = false;
        fetchConversations(); // Refresh conversations
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Failed to send message:", error);
      toast.error(
        error.response?.data?.message ||
          t("messages.failedToSend") ||
          "Failed to send message"
      );
      setSending(false);
      sendingRef.current = false;
    }
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, "h:mm a");
    } else if (diffInHours < 168) {
      return format(date, "EEE h:mm a");
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Header - Hidden on mobile when viewing conversation */}
      <div
        className={`mb-4 sm:mb-6 ${
          selectedConversation && !showConversations ? "hidden sm:block" : ""
        }`}
      >
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
          {t("messages.messages")}
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {t("client.chatWithDoctors") || "Chat with your therapists"}
        </p>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200 h-[calc(100vh-120px)] sm:h-[calc(100vh-250px)] flex flex-col md:flex-row">
        {/* Conversations Sidebar */}
        <div
          className={`${
            showConversations ? "flex" : "hidden"
          } md:flex w-full md:w-1/3 border-r border-gray-200 flex-col bg-gray-50 absolute md:relative z-10 md:z-auto h-full`}
        >
          <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {t("messages.conversations")}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {conversations.length}{" "}
                  {conversations.length === 1
                    ? t("messages.conversation") || "conversation"
                    : t("messages.conversations")}
                </p>
              </div>
              {/* Close button for mobile */}
              <button
                onClick={() => setShowConversations(false)}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700"
                aria-label="Close conversations"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {t("messages.noConversations") || "No conversations"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t("client.noBookedDoctors") ||
                    "You don't have any booked therapists yet. Book a session to start messaging."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {conversations.map((conv) => (
                  <div
                    key={conv.user.id}
                    onClick={() => fetchMessages(conv.user.id)}
                    className={`p-3 sm:p-4 cursor-pointer transition-all active:bg-gray-100 hover:bg-gray-100 ${
                      selectedConversation === conv.user.id
                        ? "bg-blue-50 border-l-4 border-blue-600"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                        {conv.user.firstName[0]}
                        {conv.user.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                            Dr. {conv.user.firstName} {conv.user.lastName}
                          </h3>
                          {conv.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ml-2">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        {conv.lastMessage ? (
                          <>
                            <p className="text-sm text-gray-600 truncate mb-1">
                              {conv.lastMessage.senderId === conv.user.id
                                ? `Dr. ${conv.user.firstName}: `
                                : ""}
                              {conv.lastMessage.content}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDistanceToNow(
                                new Date(conv.lastMessage.createdAt),
                                { addSuffix: true }
                              )}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            {t("messages.noMessagesYet") ||
                              "No messages yet. Start the conversation!"}
                          </p>
                        )}
                        {conv.latestBooking && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>
                              {format(
                                new Date(conv.latestBooking.sessionDate),
                                "MMM d"
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col bg-white relative">
          {selectedConversation && selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-teal-50">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Back button for mobile */}
                  <button
                    onClick={() => {
                      setShowConversations(true);
                      setSelectedConversation(null);
                      setSelectedUser(null);
                      setMessages([]);
                    }}
                    className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Back to conversations"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {selectedUser.firstName[0]}
                    {selectedUser.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                      Dr. {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center px-4">
                      <svg
                        className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <p className="mt-2 text-xs sm:text-sm text-gray-500">
                        {t("messages.noMessagesYet") ||
                          "No messages yet. Start the conversation!"}
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwnMessage =
                      message.senderId !== selectedConversation;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2 ${
                            isOwnMessage
                              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-sm"
                              : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm shadow-sm"
                          }`}
                        >
                          {!isOwnMessage && (
                            <p className="text-xs font-semibold mb-1 text-green-600">
                              Dr. {message.sender.firstName}
                            </p>
                          )}
                          <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwnMessage ? "text-blue-100" : "text-gray-400"
                            }`}
                          >
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-2 sm:p-4 border-t border-gray-200 bg-white safe-area-bottom">
                <div className="flex gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={t("messages.typeMessage")}
                    className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    disabled={sending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-1 sm:gap-2 min-w-[80px] sm:min-w-auto justify-center"
                  >
                    {sending ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span className="hidden sm:inline">
                          {t("common.sending") || "Sending..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                        <span className="hidden sm:inline">
                          {t("messages.send") || "Send"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center px-4">
                <svg
                  className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900">
                  {t("messages.selectConversation") || "Select a conversation"}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-gray-500">
                  {t("messages.selectToStart") ||
                    "Choose a therapist from the list to start chatting"}
                </p>
                {/* Show conversations button on mobile */}
                <button
                  onClick={() => setShowConversations(true)}
                  className="mt-4 md:hidden bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {t("messages.viewConversations") || "View Conversations"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientMessages;
