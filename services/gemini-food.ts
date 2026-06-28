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

// ---- Ingredient price estimation ----

export interface PricedIngredient {
  name: string;
  price: number;
}

const PRICE_SCHEMA = {
  type: "OBJECT",
  properties: {
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          price: { type: "NUMBER" },
        },
        required: ["name", "price"],
      },
    },
    total: { type: "NUMBER" },
  },
  required: ["items", "total"],
};

// ---- Full recipe generation from a text description ----

export interface GeneratedRecipe {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  ingredients: { name: string; amount: string; unit: string; price: number }[];
  steps: { text: string; ingredient: string }[];
}

const RECIPE_SCHEMA = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" },
    kcal: { type: "INTEGER" },
    protein: { type: "INTEGER" },
    carbs: { type: "INTEGER" },
    fat: { type: "INTEGER" },
    price: { type: "NUMBER" },
    ingredients: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          amount: { type: "STRING" },
          unit: { type: "STRING" },
          price: { type: "NUMBER" },
        },
        required: ["name", "amount", "unit", "price"],
      },
    },
    steps: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          text: { type: "STRING" },
          ingredient: { type: "STRING" },
        },
        required: ["text", "ingredient"],
      },
    },
  },
  required: ["name", "kcal", "protein", "carbs", "fat", "price", "ingredients", "steps"],
};

export async function generateRecipeFromText(
  description: string
): Promise<GeneratedRecipe> {
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured");

  const body = JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: `You are a chef and nutritionist. From the description below, produce a complete structured recipe.

Description: "${description}"

Rules:
- "name": a short recipe title.
- "ingredients": every ingredient with a realistic "amount" (number as string) and "unit" ("g" or "ml"), plus an estimated retail USD "price" for that quantity.
- "steps": ordered cooking steps. Keep EACH step SHORT — one sentence, max ~12 words, only the key action. No fluff, no explanations. For each step, set "ingredient" to the name of ONE ingredient it mainly uses, or "" if none.
- "kcal", "protein", "carbs", "fat": integers for the WHOLE dish (use 4/4/9 kcal per g consistency).
- "price": total USD cost (sum of ingredient prices).
- Be realistic and complete.`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: RECIPE_SCHEMA,
    },
  });

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_API_KEY,
    },
    body,
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Gemini recipe API error:", response.status, errorData);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("Invalid response from Gemini");

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse Gemini recipe response");

  const p = JSON.parse(jsonMatch[0]);
  return {
    name: p.name || "Recipe",
    kcal: Math.round(p.kcal || 0),
    protein: Math.round(p.protein || 0),
    carbs: Math.round(p.carbs || 0),
    fat: Math.round(p.fat || 0),
    price: parseFloat((p.price || 0).toFixed(2)),
    ingredients: (p.ingredients || []).map((it: { name?: string; amount?: string; unit?: string; price?: number }) => ({
      name: it.name || "",
      amount: (it.amount ?? "").toString(),
      unit: it.unit || "g",
      price: parseFloat((it.price || 0).toFixed(2)),
    })),
    steps: (p.steps || []).map((it: { text?: string; ingredient?: string }) => ({
      text: it.text || "",
      ingredient: it.ingredient || "",
    })),
  };
}

export async function estimateIngredientPrices(
  ingredients: { name: string; amount?: string; unit?: string }[]
): Promise<{ items: PricedIngredient[]; total: number }> {
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured");

  const list = ingredients
    .map(
      (i, idx) =>
        `${idx + 1}. ${i.name}${i.amount ? ` — ${i.amount}${i.unit || ""}` : ""}`
    )
    .join("\n");

  const body = JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: `Estimate the typical retail grocery cost in USD for the QUANTITY of each ingredient listed (not the full package, just the portion used). Be realistic.

Ingredients:
${list}

Return JSON: { "items": [ { "name": <same name>, "price": <USD number> } ], "total": <sum> }.`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: PRICE_SCHEMA,
    },
  });

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_API_KEY,
    },
    body,
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Gemini price API error:", response.status, errorData);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("Invalid response from Gemini");

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse Gemini price response");

  const parsed = JSON.parse(jsonMatch[0]);
  const items: PricedIngredient[] = (parsed.items || []).map(
    (it: { name?: string; price?: number }) => ({
      name: it.name || "Ingredient",
      price: parseFloat((it.price || 0).toFixed(2)),
    })
  );
  const total =
    parsed.total != null
      ? parseFloat(parsed.total.toFixed(2))
      : parseFloat(items.reduce((s, i) => s + i.price, 0).toFixed(2));

  return { items, total };
}
