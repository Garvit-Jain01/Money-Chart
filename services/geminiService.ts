import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Goal, AdvisorResponse } from "../types";

const MODEL = "gemini-2.5-flash-preview-04-17";
const TIMEOUT_MS = 40000;       // 40s — 2.5-flash needs more time
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 3000; // 3s → 6s → 9s

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const getSmartFinancialAdvice = async (
  transactions: Transaction[],
  goal: Goal
): Promise<AdvisorResponse> => {
  // Use import.meta.env for Vite, fallback to process.env for Node/SSR
  const apiKey =
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    process.env.GEMINI_API_KEY ||
    "";

  if (!apiKey) {
    throw new Error("Gemini API key is missing. Set VITE_GEMINI_API_KEY in your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Limit payload — only last 30 transactions
  const recentTransactions = transactions.slice(-30);

  const prompt = `
    As a financial expert advisor, analyze the following user financial data and savings goal.
    
    User Goal:
    - Name: ${goal.name}
    - Target Amount: ${goal.targetAmount}
    - Target Date: ${goal.targetDate}
    - Current Savings towards goal: ${goal.currentSavings}
    
    Transaction History (Last 30 entries):
    ${JSON.stringify(recentTransactions)}

    Calculate the required monthly savings. Compare it with their current average monthly savings (Income - Expenses).
    Provide actionable recommendations on which categories to cut back on (e.g., Entertainment, Shopping) based on their actual data.
    Classify the goal feasibility as 'achievable', 'difficult', or 'unrealistic'.
  `;

  const callAI = async (retries = MAX_RETRIES): Promise<any> => {
    try {
      return await Promise.race([
        ai.models.generateContent({
          model: MODEL,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                feasibility: {
                  type: Type.STRING,
                  enum: ["achievable", "difficult", "unrealistic"],
                },
                summary: {
                  type: Type.STRING,
                },
                requiredMonthlySavings: {
                  type: Type.NUMBER,
                },
                currentSavingCapacity: {
                  type: Type.NUMBER,
                },
                recommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      suggestion: { type: Type.STRING },
                      impactAmount: { type: Type.NUMBER },
                      reasoning: { type: Type.STRING },
                    },
                    required: ["category", "suggestion", "impactAmount", "reasoning"],
                  },
                },
              },
              required: [
                "feasibility",
                "summary",
                "requiredMonthlySavings",
                "currentSavingCapacity",
                "recommendations",
              ],
            },
          },
        }),
        // Timeout protection — 40s for 2.5-flash
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), TIMEOUT_MS)
        ),
      ]);
    } catch (err: any) {
      console.error(`Attempt failed (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, err?.message || err);

      if (retries > 0) {
        const waitMs = (MAX_RETRIES - retries + 1) * RETRY_BASE_DELAY_MS; // 3s, 6s, 9s
        console.log(`Retrying in ${waitMs / 1000}s... (${retries} left)`);
        await delay(waitMs);
        return callAI(retries - 1);
      }

      throw err;
    }
  };

  try {
    const response = await callAI();

    // 2.5-flash with responseMimeType returns clean JSON — no fences needed
    // but we clean just in case
    const rawText: string = typeof response.text === "function"
      ? response.text()
      : response.text;

    const cleanText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanText) as AdvisorResponse;
  } catch (e: any) {
    console.error("Failed to get financial advice:", e?.message || e);
    throw new Error("Could not process financial advice at this time. Please try again.");
  }
};
