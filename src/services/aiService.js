import { mockProducts } from "../data/mockData";
import { client } from "../lib/api/client";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are the QalaKart AI Assistant, a friendly and helpful guide for an Indian creative marketplace based in Bhopal. 
Your goal is to help buyers find unique local products and help sellers manage their business.

Available Products in QalaKart:
${mockProducts.map(p => `- ${p.name}: ₹${p.price}, Category: ${p.category}, Creator: ${p.creator}, Delivery: ${p.delivery}`).join('\n')}

Guidelines:
1. If a user uploads an image, analyze it and suggest matching products from the list above.
2. If no product matches perfectly, suggest the closest alternative or explain how they can use "Demand Drop" to request a custom creation.
3. Be concise, polite, and use a touch of Bhopal's local warmth.
4. If a user asks about selling, guide them to the creator dashboard.
5. If you identify a product the user wants, mention its price and creator clearly.`;

export const getAIResponse = async (userMessage, imageBase64 = null) => {
  try {
    const { data } = await client.post("/ai/chat", {
      message: userMessage,
      imageBase64
    });
    return data.data.content;
  } catch (apiError) {
    console.error("AI backend error:", apiError);
  }

  try {
    let messages = [
      { role: "system", content: SYSTEM_PROMPT }
    ];

    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: userMessage || "Analyze this image and find related products in QalaKart." },
          {
            type: "image_url",
            image_url: {
              url: imageBase64 // Already contains data:image/...;base64,...
            }
          }
        ]
      });
    } else {
      messages.push({ role: "user", content: userMessage });
    }

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: imageBase64 ? "meta-llama/llama-4-scout-17b-16e-instruct" : "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Groq API error");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Groq Service Error:", error);
    return "I'm sorry, I'm having trouble connecting to my creative brain right now. Please check your internet or try again in a moment!";
  }
};
