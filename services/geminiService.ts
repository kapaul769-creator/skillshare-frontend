
import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateServiceDescription = async (title: string, category: string, keywords: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Gemini API Key missing. Please provide a description manually.";

  const prompt = `
    Write a professional and attracting service description for a marketplace listing.
    Service Title: ${title}
    Category: ${category}
    Keywords/Details: ${keywords}
    
    Keep it under 100 words. Be inviting and trustworthy.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating description. Please try again.";
  }
};

export const suggestPrice = async (title: string, category: string): Promise<string> => {
    const client = getClient();
    if (!client) return "";

    const prompt = `
      Suggest an affordable price range for a local community service. 
      The price should generally be below ₹1000 to keep it accessible for neighbors.
      Title: ${title}
      Category: ${category}
      
      Response format: just the price range (e.g., "₹200 - ₹500"). No other text.
    `;

    try {
        const response = await client.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        return response.text || "";
    } catch (e) {
        return "";
    }
};

/**
 * Generates a professional portfolio image using gemini-2.5-flash-image.
 */
export const generatePortfolioImage = async (topic: string, skill: string): Promise<string | null> => {
  const client = getClient();
  if (!client) return null;

  // Refined prompt to ensure professional, realistic portfolio quality
  const prompt = `
    A professional, high-quality, realistic portfolio photograph for a ${skill} marketplace.
    The image should show: ${topic}.
    Style: Realistic, authentic work sample, professional photography, clean background, natural lighting, sharp focus.
    Strict Rules: No text, no logos, no watermarks, no abstract art, no cartoonish elements.
    Context: This image will be used in an Instagram-style portfolio grid to showcase expertise.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Find the image part in the response
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};
