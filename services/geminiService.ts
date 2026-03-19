import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Goal, AdvisorResponse } from "../types";

export const getSmartFinancialAdvice = async (
  transactions: Transaction[],
  goal: Goal
): Promise<AdvisorResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    As a financial expert advisor, analyze the following user financial data and savings goal.
    
    User Goal:
    - Name: ${goal.name}
    - Target Amount: ${goal.targetAmount}
    - Target Date: ${goal.targetDate}
    - Current Savings towards goal: ${goal.currentSavings}
    
    Transaction History (Last 100 entries):
    ${JSON.stringify(transactions.slice(-100))}

    Calculate the required monthly savings. Compare it with their current average monthly savings (Income - Expenses).
    Provide actionable recommendations on which categories to cut back on (e.g., Entertainment, Shopping) based on their actual data.
    Classify the goal feasibility as 'achievable', 'difficult', or 'unrealistic'.
  `;

  // Fix: Use gemini-3-pro-preview for complex reasoning and mathematical analysis
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          feasibility: { 
            type: Type.STRING, 
            enum: ['achievable', 'difficult', 'unrealistic'],
            description: "The feasibility classification of the goal."
          },
          summary: { 
            type: Type.STRING,
            description: "A friendly, encouraging yet realistic summary of the financial situation."
          },
          requiredMonthlySavings: { 
            type: Type.NUMBER,
            description: "Amount needed per month to reach the goal by target date."
          },
          currentSavingCapacity: { 
            type: Type.NUMBER,
            description: "Estimated current monthly savings based on history."
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                suggestion: { type: Type.STRING },
                impactAmount: { type: Type.NUMBER },
                reasoning: { type: Type.STRING }
              },
              required: ["category", "suggestion", "impactAmount", "reasoning"]
            }
          }
        },
        required: ["feasibility", "summary", "requiredMonthlySavings", "currentSavingCapacity", "recommendations"]
      },
    },
  });

  try {
    // Fix: Access response.text property directly
    return JSON.parse(response.text.trim()) as AdvisorResponse;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Could not process financial advice at this time.");
  }
};
