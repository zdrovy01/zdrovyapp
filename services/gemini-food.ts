import { GEMINI_API_KEY } from "@/config/gemini";

export interface FoodLog {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
}

export async function analyzeFoodWithGeminiPhoto(
  base64Image: string,
  mimeType: string
): Promise<FoodLog> {
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: { mime_type: mimeType, data: base64Image },
              },
              {
                text: `You are a nutritionist. Look at this food photo and estimate its nutritional content.

Return ONLY valid JSON with no other text:
{
  "name": "Food name here",
  "kcal": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "price": 0
}

Rules:
- All numbers must be integers except price (decimal)
- Estimate realistic nutrition facts for a typical serving shown
- Price is approximate USD cost
- No markdown, no explanations, just JSON`,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Gemini photo API error:", response.status, errorData);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    console.error("Unexpected Gemini photo response:", data);
    throw new Error("Invalid response from Gemini");
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse Gemini response");

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    name: parsed.name || "Meal",
    kcal: Math.round(parsed.kcal || 0),
    protein: Math.round(parsed.protein || 0),
    carbs: Math.round(parsed.carbs || 0),
    fat: Math.round(parsed.fat || 0),
    price: parseFloat((parsed.price || 0).toFixed(2)),
  };
}

export async function analyzeFoodWithGemini(
  description: string
): Promise<FoodLog> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a nutritionist. Analyze this food description: "${description}"

Return ONLY valid JSON with no other text:
{
  "name": "Food name here",
  "kcal": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "price": 0
}

Rules:
- All numbers must be integers except price (decimal)
- Estimate realistic nutrition facts
- Price is approximate USD cost
- No markdown, no explanations, just JSON`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", response.status, errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Unexpected Gemini response format:", data);
      throw new Error("Invalid response format from Gemini");
    }

    const content = data.candidates[0].content.parts[0].text;

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", content);
      throw new Error("Could not parse Gemini response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      name: parsed.name || "Meal",
      kcal: Math.round(parsed.kcal || 0),
      protein: Math.round(parsed.protein || 0),
      carbs: Math.round(parsed.carbs || 0),
      fat: Math.round(parsed.fat || 0),
      price: parseFloat((parsed.price || 0).toFixed(2)),
    };
  } catch (err) {
    console.error("Gemini analysis error:", err);
    throw err;
  }
}
