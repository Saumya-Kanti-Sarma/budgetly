import { Request, Response, NextFunction } from 'express';
import { Month } from '../models/Month.model.js';
import { Entry } from '../models/Entry.model.js';
import { User } from '../models/User.model.js';
import { generateMonthlySummary } from '../services/ai.service.js';
import * as R from '../utils/apiResponse.js';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export const summarize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { monthKey } = req.params;
    const userId = req.user!.userId;

    const month = await Month.findOne({ userId, monthKey });
    if (!month) { res.status(404).json(R.failure('Month not found', 404)); return; }

    // Return cached summary if fresh
    if (
      month.lastSummary &&
      month.summaryGeneratedAt &&
      Date.now() - month.summaryGeneratedAt.getTime() < CACHE_TTL_MS
    ) {
      res.json(R.success({
        summary: month.lastSummary,
        cached: true,
        generatedAt: month.summaryGeneratedAt,
      }));
      return;
    }

    const entries = await Entry.find({ userId, monthKey });
    const user = await User.findById(userId);
    const currency = user?.currency ?? 'INR';

    const summary = await generateMonthlySummary(entries, month.label, currency);

    month.lastSummary = summary;
    month.summaryGeneratedAt = new Date();
    await month.save();

    res.json(R.success({ summary, cached: false, generatedAt: month.summaryGeneratedAt }));
  } catch (err) {
    next(err);
  }
};
