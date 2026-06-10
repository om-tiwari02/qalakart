import { env } from "../../config/env.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const products = [
  "Sun Flower Bouquet, Rs 500, DIY Creation, by Sunita Sharma",
  "Handcrafted Keychains, Rs 250, Merchandise, by Aryan Arts",
  "Aesthetic Wallpaper, Rs 150, Home Decor, by Creative Canvas",
  "Table Photo Frame, Rs 450, Home Decor, by Clay Wonders",
  "Custom Logo Art, Rs 230, Sketches & Art, by Artistic Echoes",
  "Phone Cover Art, Rs 350, Resin Art, by Floral Designs",
  "Wedding Card Preservation, Rs 499, Resin Art, by Pixienationn",
  "Nebula Resin Clock, Rs 1200, Resin Art, by Artistic Echoes"
];

const SYSTEM_PROMPT = `You are QalaKart AI, a concise friendly assistant for an Indian creative marketplace in Bhopal.
Help buyers discover products, explain custom Demand Drop requests, and guide creators.
Available products:
${products.map((product) => `- ${product}`).join("\n")}
Keep answers short, warm, and practical.`;

function localResponse(message: string, hasImage: boolean) {
  const normalized = message.toLowerCase();

  if (hasImage) {
    return "I can help match this image with QalaKart products. Based on our catalogue, try Custom Logo Art, Phone Cover Art, Table Photo Frame, or Wedding Card Preservation depending on the style. If you want an exact match, use Demand Drop for a custom creator request.";
  }

  if (normalized.includes("refund")) {
    return "For custom orders, refunds depend on creator acceptance and order stage. For Demand Drop, the request fee is refundable if no creator accepts it.";
  }

  if (normalized.includes("sell") || normalized.includes("creator")) {
    return "To sell on QalaKart, open the creator dashboard, add your product details, upload clear photos, set pricing, and keep delivery timelines realistic.";
  }

  if (normalized.includes("demand") || normalized.includes("custom")) {
    return "Demand Drop lets you request a custom item with a reference image, budget, and timeline. Creators can review it and respond with options.";
  }

  if (normalized.includes("gift") || normalized.includes("recommend") || normalized.includes("suggest")) {
    return "For gifts, I'd suggest Handcrafted Keychains for a budget pick, Table Photo Frame for a personal gift, or Wedding Card Preservation for something memorable.";
  }

  return "I can help you find handmade gifts, custom art, resin pieces, and creator-made products. Tell me the occasion, budget, and style you want.";
}

export async function getAiResponse(message: string, imageBase64?: string | null) {
  const key = env.GROQ_API_KEY?.trim();
  if (!key) {
    return localResponse(message, Boolean(imageBase64));
  }

  const messages = imageBase64
    ? [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: message || "Analyze this image and suggest matching QalaKart products." },
            { type: "image_url", image_url: { url: imageBase64 } }
          ]
        }
      ]
    : [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ];

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: imageBase64 ? "meta-llama/llama-4-scout-17b-16e-instruct" : "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 700
      })
    });

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      return `${localResponse(message, Boolean(imageBase64))}\n\nGroq note: ${data.error?.message || "AI provider unavailable."}`;
    }

    return data.choices?.[0]?.message?.content || localResponse(message, Boolean(imageBase64));
  } catch {
    return localResponse(message, Boolean(imageBase64));
  }
}
