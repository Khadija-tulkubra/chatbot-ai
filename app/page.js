"use client";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [streamResponse, setStreamResponse] = useState("");
  const [loadingNormal, setLoadingNormal] = useState(false);
  const [loadingStream, setLoadingStream] = useState(false);

  // 🔹 Normal Chat
  // const handleChat = async () => {
  //   setLoadingNormal(true);
  //   setResponse("");

  //   try {
  //     const res = await fetch("/api/chat", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ message }),
  //     });

  //     const data = await res.json();
  //     setResponse(data.response);
  //   } catch (error) {
  //     setResponse("Error: " + error.message);
  //   }

  //   setLoadingNormal(false);
  // };

  // 🔹 Stream Chat
  const handleStreamChat = async () => {
    setLoadingStream(true);
    setStreamResponse("");

    try {
      const res = await fetch("/api/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const reader = res.body.getReader();

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              setStreamResponse((prev) => prev + data.content);
            }
          }
        }
      }
    } catch (error) {
      setStreamResponse("Error: " + error.message);
    }

    setLoadingStream(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 font-sans p-6">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-3xl p-8 flex flex-col gap-6">
        {/* Header */}
        <h1 className="text-3xl font-extrabold text-center text-purple-700 drop-shadow-lg">
          🤖 ChatBot AI
        </h1>

        {/* Input Box */}
        <div className="flex items-center gap-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            rows={2}
            className="flex-1 p-4 border-2 border-purple-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-400 transition-all duration-300 shadow-inner bg-purple-50"
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={handleStreamChat}
              disabled={loadingStream}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-2xl hover:bg-purple-700 disabled:bg-gray-400 transition-colors duration-300 shadow-lg"
            >
              {loadingStream? "Sending..." : "Send"}
            </button>

            {/* <button
              onClick={handleStreamChat}
              disabled={loadingStream}
              className="px-6 py-3 bg-pink-600 text-white font-semibold rounded-2xl hover:bg-pink-700 disabled:bg-gray-400 transition-colors duration-300 shadow-lg"
            >
              {loadingStream ? "Streaming..." : "Chat"}
            </button> */}
          </div>
        </div>

        {/* Normal Chat Area
        <div className="min-h-[200px] max-h-[300px] overflow-y-auto border-2 border-purple-200 rounded-2xl p-6 bg-purple-50 shadow-inner">
          {loadingNormal ? (
            <p className="text-purple-500 italic animate-pulse">
              🤔 Thinking...
            </p>
          ) : response ? (
            <p className="text-purple-800 font-medium">{response}</p>
          ) : (
            <p className="text-purple-400 italic">No response yet...</p>
          )}
        </div> */}

        {/* Stream Chat Area */}
        <div className="min-h-[200px] max-h-[300px] overflow-y-auto border-2 border-pink-200 rounded-2xl p-6 bg-pink-50 shadow-inner">
          {loadingStream ? (
            <p className="text-pink-500 italic animate-pulse">
              🔄 Sending...
            </p>
          ) : streamResponse ? (
            <p className="text-pink-800 font-medium">{streamResponse}</p>
          ) : (
            <p className="text-pink-400 italic">No response yet...</p>
          )}
        </div>
      </div>
    </div>
  );
}
