🤖 ChatBot AI (Next.js + OpenRouter + Streaming)

An advanced AI chatbot built with Next.js 13, React Hooks, and OpenRouter API.
Supports real-time streaming responses, chat history (sidebar), and chat download feature — similar to ChatGPT web UI.

🚀 Features

⚡ Streaming Responses (like ChatGPT typing effect)

💬 Chat History Sidebar (stores multiple conversations during session)

⬇️ Download Chat History as .txt file

🎨 Modern UI/UX with Tailwind CSS

🌐 Deployable on Vercel (auto builds on every GitHub push)

🔑 Secure with environment variables

📂 Project Structure
/app
 ├── api
 │    └── chat-stream/route.ts   # API route (handles OpenRouter streaming)
 ├── page.tsx                    # Main UI (Chatbot interface)
 └── globals.css                 # TailwindCSS styles

🛠️ Setup & Installation
1️⃣ Clone the Repository
git clone https://github.com/YOUR_USERNAME/chatbot-ai.git
cd chatbot-ai

2️⃣ Install Dependencies
npm install
# or
yarn install

3️⃣ Environment Variables

Create a file named .env.local in the root folder and add:

OPENAI_API_KEY=your_openrouter_api_key_here


⚠️ Never commit or push .env.local to GitHub. It should remain private!

4️⃣ Run Development Server
npm run dev


Now visit 👉 http://localhost:3000


Push your project to GitHub.

Go to Vercel
, create a New Project, and connect your GitHub repo.

Add OPENAI_API_KEY in Vercel Project → Settings → Environment Variables.

Vercel auto-deploys whenever you push updates to GitHub.



📸 Screenshot
<img width="1351" height="623" alt="image" src="https://github.com/user-attachments/assets/5f054490-e592-4816-a1b4-5500832eb39a" />

📦 Deployment (Vercel)
Link: https://chatbot-ai-two-tau.vercel.app/

📜 License

MIT License © 2025
