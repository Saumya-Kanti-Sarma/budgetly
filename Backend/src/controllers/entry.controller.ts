import { Request, Response, NextFunction } from 'express';
import * as entryService from '../services/entry.service.js';
import * as R from '../utils/apiResponse.js';

export const getByMonth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await entryService.getEntriesByMonth(req.user!.userId, req.params.monthKey);
    res.json(R.success(data));
  } catch (err) {
    next(err);
  }
};

export const getByDay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entries = await entryService.getEntriesByDay(
      req.user!.userId,
      req.params.monthKey,
      Number(req.params.day)
    );
    res.json(R.success(entries));
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await entryService.createEntry(req.user!.userId, req.body);
    res.status(201).json(R.success(entry, 'Entry created', 201));
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await entryService.updateEntry(req.user!.userId, req.params.entryId, req.body);
    res.json(R.success(entry));
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await entryService.deleteEntry(req.user!.userId, req.params.entryId);
    res.json(R.success(null, 'Entry deleted'));
  } catch (err) {
    next(err);
  }
};
