"use client";
import { useState } from "react";

export default function Home() {

  const [chats, setChats] = useState([
    { id: Date.now(), title: "New Chat", messages: [] },
  ]);
  const [activeIdx, setActiveIdx] = useState(0);


  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const activeChat = chats[activeIdx];
  const messages = activeChat?.messages ?? [];

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveIdx(0);
  };

 
  const maybeRenameActive = (firstUserText) => {
    if (!firstUserText) return;
    setChats((prev) =>
      prev.map((c, i) =>
        i === activeIdx && (c.title === "New Chat" || !c.title)
          ? { ...c, title: firstUserText.slice(0, 30) + (firstUserText.length > 30 ? "..." : "") }
          : c
      )
    );
  };

  const setActiveMessages = (updater) => {
    setChats((prev) =>
      prev.map((c, i) =>
        i === activeIdx ? { ...c, messages: typeof updater === "function" ? updater(c.messages) : updater } : c
      )
    );
  };

  const handleStreamChat = async () => {
    const userText = message.trim();
    if (!userText || sending) return;

    setSending(true);
    setMessage("");

    const baseMessages = [...messages, { role: "user", content: userText }];
    setActiveMessages(baseMessages);
    maybeRenameActive(userText);

    let assistantAdded = false;
    let assistantReply = "";

    try {
      const res = await fetch("/api/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: baseMessages }), 
      });

      if (!res.ok || !res.body) {
        throw new Error("No response body from server.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6);
          if (jsonStr === "[DONE]") break;

          try {
            const data = JSON.parse(jsonStr);
            const piece = data.content || "";
            if (!piece) continue;

            assistantReply += piece;

       
            if (!assistantAdded) {
              assistantAdded = true;
              setActiveMessages((prev) => [...prev, { role: "assistant", content: "" }]);
            }

            setActiveMessages((prev) => {
              if (prev.length === 0) return prev;
              const last = prev[prev.length - 1];
              if (last.role !== "assistant") return prev; // safety
              const updatedLast = { ...last, content: assistantReply };
              return [...prev.slice(0, -1), updatedLast];
            });
          } catch {
         
          }
        }
      }
    } catch (err) {
      const fallback = `Error: ${err?.message || "stream failed"}`;
      setActiveMessages((prev) => [...prev, { role: "assistant", content: fallback }]);
    }

    setSending(false);
  };

  const handleDownload = () => {
    const chat = chats[activeIdx];
    if (!chat) return;

    const text = chat.messages
      .map((m) => `${m.role === "user" ? "You" : "Assistant"}: ${m.content}`)
      .join("\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (chat.title || "chat") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen w-screen grid grid-cols-[260px_1fr] bg-gray-100">
 
      <aside className="h-full bg-gray-900 text-white flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <h2 className="text-lg font-bold">💬 My Chats</h2>
          <button
            onClick={handleNewChat}
            className="px-2 py-1 bg-purple-600 rounded-lg text-sm hover:bg-purple-500"
          >
            + New
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActiveIdx(i)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                i === activeIdx ? "bg-purple-600" : "hover:bg-gray-800"
              }`}
              title={c.title}
            >
              {c.title || "Untitled"}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button
            onClick={handleDownload}
            className="w-full px-3 py-2 bg-green-600 rounded-lg text-sm hover:bg-green-500"
          >
            ⬇️ Download Chat
          </button>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="h-full flex flex-col">
        {/* Header */}
        <header className="px-6 py-4 bg-white border-b">
          <h1 className="text-2xl font-bold text-gray-800">🤖 ChatBot AI</h1>
          <p className="text-sm text-gray-500">Next.js • OpenRouter • Streaming</p>
        </header>

        {/* Messages */}
        <section className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-400 italic">Start a conversation…</p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm whitespace-pre-wrap break-words ${
                    m.role === "user"
                      ? "bg-purple-600 text-white rounded-br-sm"
                      : "bg-white border rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
        </section>

        {/* Input */}
        <footer className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="Type your message…"
              className="flex-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50"
            />
            <button
              onClick={handleStreamChat}
              disabled={sending || !message.trim()}
              className="px-5 py-3 bg-purple-600 text-white rounded-xl disabled:bg-gray-400 hover:bg-purple-700"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
