import { Entry } from '../models/Entry.model.js';
import { Month } from '../models/Month.model.js';
import { CreateEntryInput, UpdateEntryInput } from '../schemas/entry.schema.js';

export const recomputeMonth = async (userId: string, monthKey: string): Promise<void> => {
  const entries = await Entry.find({ userId, monthKey });

  const totalSpending = entries.reduce((sum, e) => sum + e.amount, 0);

  const categoryMap: Record<string, number> = {};
  entries.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] ?? 0) + e.amount;
  });

  const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  const categoryBreakdown = Object.entries(categoryMap).map(([category, total]) => ({ category, total }));

  const [year, month] = monthKey.split('-');
  const label = new Date(Number(year), Number(month) - 1, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  await Month.findOneAndUpdate(
    { userId, monthKey },
    {
      userId, monthKey, label,
      totalSpending, topCategory,
      categoryBreakdown,
      entryCount: entries.length,
      lastSummary: undefined,
      summaryGeneratedAt: undefined,
    },
    { upsert: true, new: true }
  );
};

export const createEntry = async (userId: string, body: CreateEntryInput) => {
  const entry = await Entry.create({ ...body, userId });
  await recomputeMonth(userId, body.monthKey);
  return entry;
};

export const getEntriesByMonth = async (userId: string, monthKey: string) => {
  const entries = await Entry.find({ userId, monthKey }).sort({ day: 1, createdAt: 1 });

  const groupedByDay: Record<string, typeof entries> = {};
  entries.forEach((e) => {
    const key = String(e.day);
    if (!groupedByDay[key]) groupedByDay[key] = [];
    groupedByDay[key].push(e);
  });

  return { monthKey, entries, groupedByDay };
};

export const getEntriesByDay = async (userId: string, monthKey: string, day: number) => {
  return Entry.find({ userId, monthKey, day }).sort({ createdAt: 1 });
};

export const updateEntry = async (userId: string, entryId: string, body: UpdateEntryInput) => {
  const entry = await Entry.findOne({ _id: entryId, userId });
  if (!entry) throw Object.assign(new Error('Entry not found'), { statusCode: 404 });

  Object.assign(entry, body);
  await entry.save();
  await recomputeMonth(userId, entry.monthKey);
  return entry;
};

export const deleteEntry = async (userId: string, entryId: string) => {
  const entry = await Entry.findOne({ _id: entryId, userId });
  if (!entry) throw Object.assign(new Error('Entry not found'), { statusCode: 404 });

  const { monthKey } = entry;
  await entry.deleteOne();
  await recomputeMonth(userId, monthKey);
};
