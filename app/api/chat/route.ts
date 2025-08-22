import { NextResponse } from "next/server";
export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, 
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await res.json();
    return NextResponse.json({
      response: data.choices[0].message.content,
    });
  } catch (error: any) {
    console.error("OpenRouter API Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
