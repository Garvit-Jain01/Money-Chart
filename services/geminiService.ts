import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Goal, AdvisorResponse } from "../types";

export const getSmartFinancialAdvice = async (
  transactions: Transaction[],
  goal: Goal
): Promise<AdvisorResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // ✅ Reduce payload size (important)
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

  // ✅ Retry wrapper
  const callAI = async (retries = 3): Promise<any> => {
    try {
      return await Promise.race([
        ai.models.generateContent({
          model: "gemini-2.5-flash", // ✅ more stable for structured output
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
                    required: [
                      "category",
                      "suggestion",
                      "impactAmount",
                      "reasoning",
                    ],
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
        // ✅ Timeout protection
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 10000)
        ),
      ]);
    } catch (err) {
      if (retries > 0) {
        console.log(`Retrying... (${retries})`);
        return callAI(retries - 1);
      }
      throw err;
    }
  };

  try {
    const response = await callAI();

    // ✅ Clean JSON response
    const cleanText = response.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanText) as AdvisorResponse;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Could not process financial advice at this time.");
  }
};
