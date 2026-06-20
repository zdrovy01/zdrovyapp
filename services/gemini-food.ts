import { GEMINI_API_KEY } from "@/config/gemini";

export interface FoodLog {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  weight?: number; // estimated total grams
}

const MODEL = "gemini-flash-latest";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Structured-output schema so Gemini returns clean, typed JSON.
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" },
    weight_g: { type: "INTEGER" },
    kcal: { type: "INTEGER" },
    protein: { type: "INTEGER" },
    carbs: { type: "INTEGER" },
    fat: { type: "INTEGER" },
  },
  required: ["name", "weight_g", "kcal", "protein", "carbs", "fat"],
};

const SYSTEM_RULES = `You are a precise nutrition-estimation engine. Be as accurate as possible.

METHOD (follow step by step internally, output only the final JSON):
1. Identify EVERY distinct food and drink component.
2. For each component, estimate its portion in grams (or ml) using visual/contextual cues:
   - reference sizes: a dinner plate ≈ 26 cm, a teaspoon ≈ 5 g, a tablespoon ≈ 15 g, a slice of bread ≈ 30 g, an egg ≈ 50 g, a chicken breast ≈ 170 g, a cup ≈ 240 ml.
3. For each component use standard reference values (USDA FoodData Central) per 100 g, then scale by the estimated grams.
4. Sum all components to get total grams and total macros.
5. Account for cooking method (oil/butter adds fat and calories; frying > grilling > boiling).
6. SANITY CHECK: calories must be consistent with macros using 4 kcal/g protein, 4 kcal/g carbs, 9 kcal/g fat. The reported kcal must be within ~5% of (protein*4 + carbs*4 + fat*9). Adjust until consistent.

OUTPUT:
- "name": short descriptive name of the whole meal.
- "weight_g": total estimated grams of the meal.
- "kcal", "protein", "carbs", "fat": integers for the WHOLE portion described/shown (not per 100 g).
- Be realistic, neither over- nor under-estimate. If unsure of portion, assume one typical serving.`;

function buildRequestBody(parts: unknown[]) {
  return JSON.stringify({
    contents: [{ parts }],
    systemInstruction: { parts: [{ text: SYSTEM_RULES }] },
    generationConfig: {
      temperature: 0,
      topP: 0.95,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });
}

async function callGemini(parts: unknown[], context: string): Promise<FoodLog> {
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured");

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_API_KEY,
    },
    body: buildRequestBody(parts),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`Gemini ${context} API error:`, response.status, errorData);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    console.error(`Unexpected Gemini ${context} response:`, data);
    throw new Error("Invalid response from Gemini");
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error(`No JSON in Gemini ${context} response:`, content);
    throw new Error("Could not parse Gemini response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  let kcal = Math.round(parsed.kcal || 0);
  const protein = Math.max(0, Math.round(parsed.protein || 0));
  const carbs = Math.max(0, Math.round(parsed.carbs || 0));
  const fat = Math.max(0, Math.round(parsed.fat || 0));

  // Reconcile calories with macros if the model's kcal is missing or far off.
  const computed = protein * 4 + carbs * 4 + fat * 9;
  if (kcal <= 0 && computed > 0) kcal = Math.round(computed);
  else if (computed > 0 && Math.abs(kcal - computed) / computed > 0.25) {
    kcal = Math.round(computed);
  }

  return {
    name: parsed.name || "Meal",
    weight: parsed.weight_g ? Math.round(parsed.weight_g) : undefined,
    kcal,
    protein,
    carbs,
    fat,
    price: 0,
  };
}

export async function analyzeFoodWithGeminiPhoto(
  base64Image: string,
  mimeType: string
): Promise<FoodLog> {
  return callGemini(
    [
      { inline_data: { mime_type: mimeType, data: base64Image } },
      {
        text: "Analyze this food photo and estimate the nutrition for the portion actually shown.",
      },
    ],
    "photo"
  );
}

export async function analyzeFoodWithGemini(
  description: string
): Promise<FoodLog> {
  return callGemini(
    [
      {
        text: `Analyze this food description and estimate its nutrition: "${description}".
If quantities or units are given, use them exactly. If not, assume one typical serving.`,
      },
    ],
    "text"
  );
}
