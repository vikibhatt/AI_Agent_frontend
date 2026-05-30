import {
  useState,
  useRef,
  useEffect,
} from "react";
import ReactMarkdown from "react-markdown";

const backend = import.meta.env.VITE_BACKEND_AGENT_URL;

export default function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [chats, setChats] = useState([
    {
      id: 1,
      title: "New Chat",
      messages: [],
    },
  ]);

  const [activeChatId, setActiveChatId] = useState(1);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [activeChat.messages, loading]);

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const updateChatMessages = (messages) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, messages }
          : chat
      )
    );
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
    };

    const updatedMessages = [
      ...activeChat.messages,
      userMessage,
    ];

    updateChatMessages(updatedMessages);

    // update title from first message
    if (
      activeChat.title === "New Chat" &&
      activeChat.messages.length === 0
    ) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                title: input.slice(0, 30),
              }
            : chat
        )
      );
    }

    const currentInput = input;

    const userchatMessage = {
      role: "user",
      content: currentInput,
    };

    const updatedchatMessages = [
      ...activeChat.messages,
      userchatMessage,
    ];

    setInput("");
    setLoading(true);
    try {
      const response = await fetch(`${backend}chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedchatMessages,
        }),
      });

      const data = await response.json();

      const aiMessage = {
        role: "assistant",
        content: data.response,
      };

      updateChatMessages([
        ...updatedMessages,
        aiMessage,
      ]);

    } catch (error) {
      console.error(error);

      updateChatMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Error connecting to backend.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen bg-[#212121] text-white flex overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 bg-[#171717] border-r border-gray-800 flex-col">
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={handleNewChat}
            className="w-full bg-[#2f2f2f] hover:bg-[#3a3a3a] transition rounded-xl py-3 text-sm font-medium"
          >
            + New Chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {chats.map((chat, index) => (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`p-3 rounded-xl cursor-pointer transition text-sm truncate ${
                activeChatId === chat.id
                  ? "bg-[#2f2f2f] text-white"
                  : "hover:bg-[#2a2a2a] text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
  <span className="text-gray-500 text-xs">
    {index + 1}.
  </span>

  <span className="truncate">
    {chat.title}
  </span>
</div>
            </div>
          ))}
        </div>

        {/* Profile */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 bg-[#2a2a2a] rounded-xl p-3">
            <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center font-bold">
              V
            </div>

            <div>
              <p className="text-sm font-medium">Vikas</p>
              <p className="text-xs text-gray-400">
                AI Developer
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="w-full flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-gray-800 flex items-center px-6 justify-between">
          <h1 className="text-xl md:text-5xl font-semibold truncate">
            AI Agent
          </h1>

          <button className="px-4 py-2 rounded-lg bg-[#2f2f2f] text-sm">
            Groq LLM
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {activeChat.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <h2 className="text-4xl font-semibold text-gray-200 mb-4">
                  How can I help you today?
                </h2>

                <p className="text-gray-500">
                  Start a conversation with your AI Agent.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 max-w-4xl mx-auto">
              {activeChat.messages.map((message, index) => (
                <div
  key={index}
  className={`flex gap-4 items-start ${
    message.role === "user"
      ? "justify-end"
      : "justify-start"
  }`}
>
                  {/* AI */}
                  {message.role === "assistant" && (
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center font-bold flex-shrink-0">
                      AI
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`rounded-2xl px-6 py-5 max-w-[85%] md:max-w-3xl overflow-x-auto ${
                      message.role === "user"
                        ? "bg-[#0b5cff] text-white"
                        : "bg-[#2a2a2a] text-gray-200"
                    }`}
                  >
                    <div
  className="
    prose
    prose-invert
    max-w-none
    text-left

    prose-headings:text-left
    prose-headings:mt-6
    prose-headings:mb-4

    prose-p:text-left
    prose-p:leading-8
    prose-p:my-4

    prose-strong:text-white

    prose-ul:text-left
    prose-ol:text-left
    prose-li:text-left
    prose-li:my-2

    prose-table:w-full
    prose-table:border-collapse

    prose-th:border
    prose-th:border-gray-700
    prose-th:bg-[#171717]
    prose-th:p-3
    prose-th:text-left

    prose-td:border
    prose-td:border-gray-700
    prose-td:p-3

    prose-code:text-green-300

    prose-pre:bg-[#171717]
    prose-pre:text-green-400
    prose-pre:border
    prose-pre:border-gray-700
    prose-pre:rounded-xl
    prose-pre:p-4

    prose-blockquote:border-green-500
    prose-blockquote:text-gray-300
  "
>
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* User */}
                  {message.role === "user" && (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold flex-shrink-0">
                      V
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center font-bold">
                    AI
                  </div>

                  <div className="bg-[#2a2a2a] rounded-2xl px-6 py-5 text-gray-400 animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-800 p-5">
          <div className="max-w-4xl mx-auto bg-[#2a2a2a] rounded-3xl px-4 py-3 md:px-5 md:py-4 flex items-end gap-3 md:gap-4">
            <textarea
              placeholder="Message AI Agent..."
              rows={2}
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent resize-none outline-none text-white placeholder-gray-400 max-h-40"
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-white text-black px-5 py-2 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              Send
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-3">
            AI Agent can make mistakes. Verify important information.
          </p>
        </div>
      </main>
    </div>
  );
}
