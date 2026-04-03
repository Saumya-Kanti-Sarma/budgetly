# Budgetly — Backend Documentation

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express 5 + TypeScript |
| Database | MongoDB via Mongoose |
| Auth | JWT (access + refresh token pattern) |
| AI | Anthropic SDK (`@anthropic-ai/sdk`) |
| Validation | Zod |
| Config | `dotenv` + `envalid` |
| Logging | `morgan` + `winston` |
| Testing | Vitest + Supertest |

---

## Project Structure

```
budgetly-api/
├── src/
│   ├── config/
│   │   ├── db.ts               # Mongoose connection
│   │   ├── env.ts              # Validated env vars (envalid)
│   │   └── anthropic.ts        # Anthropic client singleton
│   ├── models/
│   │   ├── User.model.ts
│   │   ├── Month.model.ts
│   │   └── Entry.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── month.routes.ts
│   │   ├── entry.routes.ts
│   │   └── ai.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── month.controller.ts
│   │   ├── entry.controller.ts
│   │   └── ai.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT guard
│   │   ├── validate.middleware.ts # Zod request validation
│   │   └── error.middleware.ts  # Global error handler
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── entry.schema.ts
│   │   └── month.schema.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── entry.service.ts
│   │   └── ai.service.ts
│   ├── types/
│   │   └── express.d.ts        # Augment req.user
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts         # bcrypt helpers
│   │   └── apiResponse.ts      # Standardised response shape
│   └── app.ts                  # Express app setup
├── server.ts                   # Entry point
├── tsconfig.json
├── .env.example
└── package.json
```

---

## Environment Variables (`.env.example`)

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/budgetly

JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

ANTHROPIC_API_KEY=your_anthropic_key_here

CLIENT_URL=http://localhost:8081
```

---

## Mongoose Models

### User (`User.model.ts`)
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    avatar:   { type: String },
    currency: { type: String, default: 'INR' },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
```

---

### Entry (`Entry.model.ts`)
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export type Category =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Health'
  | 'Entertainment'
  | 'Utilities'
  | 'Other';

export interface IEntry extends Document {
  userId:      mongoose.Types.ObjectId;
  monthKey:    string;              // "2026-01"
  day:         number;              // 1–31
  description: string;
  category:    Category;
  amount:      number;              // in smallest currency unit (paise / cents)
  note?:       string;
  createdAt:   Date;
  updatedAt:   Date;
}

const EntrySchema = new Schema<IEntry>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    monthKey:    { type: String, required: true, index: true }, // "YYYY-MM"
    day:         { type: Number, required: true, min: 1, max: 31 },
    description: { type: String, required: true, trim: true },
    category:    {
      type: String,
      enum: ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Other'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    note:   { type: String, trim: true },
  },
  { timestamps: true }
);

// Compound index for fast per-user per-month queries
EntrySchema.index({ userId: 1, monthKey: 1, day: 1 });

export const Entry = mongoose.model<IEntry>('Entry', EntrySchema);
```

---

### Month (`Month.model.ts`)

Stores pre-computed monthly aggregates (updated on every entry mutation).

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface ICategoryBreakdown {
  category: string;
  total: number;
}

export interface IMonth extends Document {
  userId:            mongoose.Types.ObjectId;
  monthKey:          string;          // "2026-01"
  label:             string;          // "January 2026"
  totalSpending:     number;
  topCategory:       string;
  categoryBreakdown: ICategoryBreakdown[];
  entryCount:        number;
  lastSummary?:      string;          // cached AI summary
  summaryGeneratedAt?: Date;
}

const MonthSchema = new Schema<IMonth>(
  {
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    monthKey:      { type: String, required: true },
    label:         { type: String, required: true },
    totalSpending: { type: Number, default: 0 },
    topCategory:   { type: String, default: '' },
    categoryBreakdown: [
      {
        category: String,
        total:    Number,
      },
    ],
    entryCount:        { type: Number, default: 0 },
    lastSummary:       { type: String },
    summaryGeneratedAt:{ type: Date },
  },
  { timestamps: true }
);

MonthSchema.index({ userId: 1, monthKey: 1 }, { unique: true });

export const Month = mongoose.model<IMonth>('Month', MonthSchema);
```

---

## API Routes

### Base URL: `/api/v1`

---

### Auth — `/api/v1/auth`

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/register` | Create account | — |
| POST | `/login` | Login, returns tokens | — |
| POST | `/refresh` | Refresh access token | — |
| POST | `/logout` | Invalidate refresh token | ✓ |
| GET | `/me` | Get current user profile | ✓ |
| PATCH | `/me` | Update name / currency | ✓ |

**Register body:**
```json
{
  "name": "Rohan",
  "email": "rohan@example.com",
  "password": "Min8Chars!"
}
```

**Login response:**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "Rohan", "email": "...", "currency": "INR" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

---

### Months — `/api/v1/months`

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/` | List all months for user | ✓ |
| GET | `/:monthKey` | Get single month summary (e.g. `2026-01`) | ✓ |

**GET `/` response:**
```json
{
  "success": true,
  "data": [
    {
      "monthKey": "2026-01",
      "label": "January 2026",
      "totalSpending": 12450,
      "topCategory": "Food",
      "entryCount": 23
    }
  ]
}
```

---

### Entries — `/api/v1/entries`

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/:monthKey` | All entries for a month | ✓ |
| GET | `/:monthKey/:day` | Entries for a specific day | ✓ |
| POST | `/` | Create a new entry | ✓ |
| PATCH | `/:entryId` | Update an entry | ✓ |
| DELETE | `/:entryId` | Delete an entry | ✓ |

**POST `/` body:**
```json
{
  "monthKey": "2026-01",
  "day": 15,
  "description": "Lunch at Cafe",
  "category": "Food",
  "amount": 450,
  "note": "Team lunch"
}
```

**GET `/:monthKey` response:**
```json
{
  "success": true,
  "data": {
    "monthKey": "2026-01",
    "entries": [
      {
        "_id": "...",
        "day": 1,
        "description": "Lunch at Cafe",
        "category": "Food",
        "amount": 450,
        "createdAt": "2026-01-01T12:00:00Z"
      }
    ],
    "groupedByDay": {
      "1": [ /* entries */ ],
      "3": [ /* entries */ ]
    }
  }
}
```

---

### AI — `/api/v1/ai`

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/summarize/:monthKey` | Generate AI spending summary | ✓ |

- Returns cached summary if generated within last 6 hours.
- Otherwise calls Anthropic API and caches result on the `Month` document.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "You spent ₹12,450 in January...",
    "cached": false,
    "generatedAt": "2026-01-31T18:00:00Z"
  }
}
```

---

## Middleware

### `auth.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // augmented via types/express.d.ts
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token expired or invalid' });
  }
};
```

### `validate.middleware.ts`
```typescript
import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
```

### `error.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};
```

---

## AI Service (`ai.service.ts`)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { IEntry } from '../models/Entry.model';
import { env } from '../config/env';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export const generateMonthlySummary = async (
  entries: IEntry[],
  monthLabel: string,
  currency: string = 'INR'
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

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    system:
      'You are a friendly personal finance assistant named Budgetly. Be warm, concise, and encouraging. Never use markdown formatting.',
    messages: [
      {
        role: 'user',
        content: `Here is my spending data for ${monthLabel}:\n${JSON.stringify(payload, null, 2)}\n\nSummarize my spending in 3-4 sentences. Mention the total spend in ${currency}, the biggest spending category, and one actionable saving tip. Keep it under 80 words.`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== 'text') throw new Error('Unexpected AI response type');
  return block.text;
};
```

---

## Entry Service — Month Aggregation (`entry.service.ts`)

After every create/update/delete, recompute and upsert the `Month` document:

```typescript
export const recomputeMonth = async (
  userId: string,
  monthKey: string
): Promise<void> => {
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
      // Invalidate cached AI summary when data changes
      lastSummary: undefined,
      summaryGeneratedAt: undefined,
    },
    { upsert: true, new: true }
  );
};
```

---

## Zod Schemas

### `entry.schema.ts`
```typescript
import { z } from 'zod';

export const createEntrySchema = z.object({
  monthKey:    z.string().regex(/^\d{4}-\d{2}$/, 'Format must be YYYY-MM'),
  day:         z.number().int().min(1).max(31),
  description: z.string().min(1).max(120),
  category:    z.enum(['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Other']),
  amount:      z.number().positive(),
  note:        z.string().max(255).optional(),
});

export const updateEntrySchema = createEntrySchema.partial().omit({ monthKey: true, day: true });

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;
```

### `auth.schema.ts`
```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  name:     z.string().min(2).max(60),
  email:    z.string().email(),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});
```

---

## Standardised API Response (`utils/apiResponse.ts`)

```typescript
export const success = <T>(data: T, message = 'OK', statusCode = 200) => ({
  success: true,
  statusCode,
  message,
  data,
});

export const failure = (message: string, statusCode = 400) => ({
  success: false,
  statusCode,
  message,
});
```

---

## `app.ts`

```typescript
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import authRoutes  from './routes/auth.routes';
import monthRoutes from './routes/month.routes';
import entryRoutes from './routes/entry.routes';
import aiRoutes    from './routes/ai.routes';
import { errorHandler } from './middleware/error.middleware';
import { env } from './config/env';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1/auth',    authRoutes);
app.use('/api/v1/months',  monthRoutes);
app.use('/api/v1/entries', entryRoutes);
app.use('/api/v1/ai',      aiRoutes);

app.use(errorHandler);

export default app;
```

---

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src", "server.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

## `package.json` (key deps)

```json
{
  "scripts": {
    "dev":   "tsx watch server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test":  "vitest"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "bcryptjs":          "^2.4.3",
    "cors":              "^2.8.5",
    "dotenv":            "^16.4.5",
    "envalid":           "^8.0.0",
    "express":           "^5.0.0",
    "helmet":            "^7.1.0",
    "jsonwebtoken":      "^9.0.2",
    "mongoose":          "^8.4.0",
    "morgan":            "^1.10.0",
    "winston":           "^3.13.0",
    "zod":               "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs":     "^2.4.6",
    "@types/cors":         "^2.8.17",
    "@types/express":      "^5.0.0",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/morgan":       "^1.9.9",
    "@types/node":         "^20.0.0",
    "supertest":           "^7.0.0",
    "tsx":                 "^4.11.0",
    "typescript":          "^5.4.5",
    "vitest":              "^1.6.0"
  }
}
```

---

## Error Handling Convention

All controllers wrap logic in try/catch and pass errors to `next(err)`. The global `errorHandler` middleware handles all unhandled errors with a consistent shape:

```json
{
  "success": false,
  "statusCode": 500,
  "message": "Something went wrong"
}
```

HTTP status codes used:
- `200` OK
- `201` Created
- `400` Bad Request / Validation error
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `500` Internal Server Error

---

*Backend documentation for Budgetly v1.0 — Express + TypeScript + Mongoose*
