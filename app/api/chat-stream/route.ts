// import { NextResponse } from "next/server";
// import Stream from "stream";
// export async function POST(request: Request) {
//   try {
//     const { message } = await request.json();

//     const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, 
//       },
//       body: JSON.stringify({
//         model: "gpt-3.5-turbo",
//         messages: [{ role: "user", content: message }],
//         Stream: true,
//       }),
//     });

//     const encoder=new TextEncoder()
//     const readable= new ReadableStream({
//       async start(controller){
//         for await(const chunk of Stream){
//           const content=chunk.choices[0]?.delta?.content || "";
//           if(content)
//           {
//             controller.enqueue(encoder.encode(`data :${JSON.stringify({content})}`))
//           }

//         }
//         controller.close()
//       }
//     })
//     return new NextResponse(readable,{
//       headers: {
//         'Content-Type': "text/event-stream",
//         'Cache-Control' : 'no-cache',
//         'Connection' : 'keep-alive'
//       }
//     })

   
//   } catch (error: any) {
//     console.error("OpenRouter API Error:", error);
//     return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
//   }
// }


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
        stream: true, 
      }),
    });

    if (!res.body) {
      return NextResponse.json(
        { error: "No response body from OpenRouter" },
        { status: 500 }
      );
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = res.body!.getReader();
        let decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
        
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.replace("data: ", "").trim();
              if (data === "[DONE]") {
                controller.close();
                return;
              }
              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                  );
                }
              } catch (e) {
                console.error("Failed to parse chunk:", e);
              }
            }
          }
        }
        controller.close();
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("OpenRouter API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
