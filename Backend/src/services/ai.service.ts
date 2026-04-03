import { geminiModel } from '../config/gemini.js';
import { IEntry } from '../models/Entry.model.js';

export const generateMonthlySummary = async (
  entries: IEntry[],
  monthLabel: string,
  currency = 'INR'
): Promise<string> => {
  const totalSpend = entries.reduce((sum, e) => sum + e.amount, 0);

  const categoryMap: Record<string, number> = {};
  entries.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] ?? 0) + e.amount;
  });

  const payload = {
    totalSpend,
    currency,
    categoryBreakdown: categoryMap,
    entryCount: entries.length,
  };

  const prompt = `Here is my spending data for ${monthLabel}:\n${JSON.stringify(payload, null, 2)}\n\nSummarize my spending in 3-4 sentences. Mention the total spend in ${currency}, the biggest spending category, and one actionable saving tip. Keep it under 80 words.`;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
};
