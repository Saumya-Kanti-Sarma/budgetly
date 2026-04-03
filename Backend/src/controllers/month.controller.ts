import { Request, Response, NextFunction } from 'express';
import Month from '../models/Month.model.js';
import * as R from '../utils/apiResponse.js';

export const getMonths = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const months = await Month.find({ userId: req.user!.userId }).sort({ monthKey: -1 });
    res.json(R.success(months));
  } catch (err) {
    next(err);
  }
};

export const getMonth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const month = await Month.findOne({ userId: req.user!.userId, monthKey: req.params.monthKey });
    if (!month) { res.status(404).json(R.failure('Month not found', 404)); return; }
    res.json(R.success(month));
  } catch (err) {
    next(err);
  }
};
