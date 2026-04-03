# Budgetly API Reference

**Base URL:** `http://localhost:5000/api/v1`

**Auth:** Protected routes require `Authorization: Bearer <accessToken>` header.

---

## Auth — `/api/v1/auth`

---

### POST `/auth/register`
Create a new user account.

- Auth: None
- Content-Type: `application/json`

**Request Body**
```json
{
  "name": "Rohan",        // string, min 2, max 60
  "email": "rohan@example.com",  // valid email
  "password": "Min8Chars!"       // string, min 8, max 72
}
```

**201 Created**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Account created",
  "data": {
    "user": {
      "_id": "665f1a2b3c4d5e6f7a8b9c0d",
      "name": "Rohan",
      "email": "rohan@example.com",
      "currency": "INR"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**409 Conflict** — email already in use
```json
{ "success": false, "statusCode": 409, "message": "Email already in use" }
```

**400 Bad Request** — validation failure
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": { "email": ["Invalid email"] }
}
```

---

### POST `/auth/login`
Login and receive tokens.

- Auth: None
- Content-Type: `application/json`

**Request Body**
```json
{
  "email": "rohan@example.com",
  "password": "Min8Chars!"
}
```

**200 OK**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": {
    "user": {
      "_id": "665f1a2b3c4d5e6f7a8b9c0d",
      "name": "Rohan",
      "email": "rohan@example.com",
      "currency": "INR"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**401 Unauthorized** — wrong credentials
```json
{ "success": false, "statusCode": 401, "message": "Invalid credentials" }
```

---

### POST `/auth/refresh`
Exchange a refresh token for a new access + refresh token pair.

- Auth: None
- Content-Type: `application/json`

**Request Body**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**200 OK**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**401 Unauthorized** — invalid or reused token
```json
{ "success": false, "statusCode": 401, "message": "Invalid refresh token" }
```

---

### POST `/auth/logout`
Invalidate the current refresh token.

- Auth: Required
- Body: None

**200 OK**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out",
  "data": null
}
```

---

### GET `/auth/me`
Get the authenticated user's profile.

- Auth: Required
- Body: None

**200 OK**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Rohan",
    "email": "rohan@example.com",
    "currency": "INR",
    "avatar": null
  }
}
```

---

### PATCH `/auth/me`
Update name and/or currency.

- Auth: Required
- Content-Type: `application/json`

**Request Body** (all fields optional)
```json
{
  "name": "Rohan Kumar",   // string, min 2, max 60 — optional
  "currency": "USD"        // string, exactly 3 chars — optional
}
```

**200 OK**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Rohan Kumar",
    "email": "rohan@example.com",
    "currency": "USD"
  }
}
```

---

## Months — `/api/v1/months`

All routes require auth.

---

### GET `/months`
List all months for the authenticated user, sorted newest first.

- Auth: Required
- Params: None
- Body: None

**200 OK**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": [
    {
      "_id": "665f1a2b3c4d5e6f7a8b9c0d",
      "userId": "665f1a2b3c4d5e6f7a8b9c0a",
      "monthKey": "2026-04",
      "label": "April 2026",
      "totalSpending": 18200,
      "topCategory": "Food",
      "categoryBreakdown": [
        { "category": "Food", "total": 8400 },
        { "category": "Transport", "total": 3200 },
        { "category": "Shopping", "total": 6600 }
      ],
      "entryCount": 31,
      "lastSummary": null,
      "summaryGeneratedAt": null
    }
  ]
}
```

---

### GET `/months/:monthKey`
Get a single month's aggregated summary.

- Auth: Required
- URL Param: `monthKey` — format `YYYY-MM` (e.g. `2026-04`)
- Body: None

**200 OK**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "userId": "665f1a2b3c4d5e6f7a8b9c0a",
    "monthKey": "2026-04",
    "label": "April 2026",
    "totalSpending": 18200,
    "topCategory": "Food",
    "categoryBreakdown": [
      { "category": "Food", "total": 8400 },
      { "category": "Transport", "total": 3200 }
    ],
    "entryCount": 31,
    "lastSummary": "You spent ₹18,200 in April...",
    "summaryGeneratedAt": "2026-04-30T18:00:00.000Z"
  }
}
```

**404 Not Found**
```json
{ "success": false, "statusCode": 404, "message": "Month not found" }
```

---

## Entries — `/api/v1/entries`

All routes require auth.

---

### GET `/entries/:monthKey`
Get all entries for a month, grouped by day.

- Auth: Required
- URL Param: `monthKey` — format `YYYY-MM`
- Body: None

**200 OK**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": {
    "monthKey": "2026-04",
    "entries": [
      {
        "_id": "665f1a2b3c4d5e6f7a8b9c10",
        "userId": "665f1a2b3c4d5e6f7a8b9c0a",
        "monthKey": "2026-04",
        "day": 1,
        "description": "Lunch at Cafe",
        "category": "Food",
        "amount": 450,
        "note": "Team lunch",
        "createdAt": "2026-04-01T12:00:00.000Z",
        "updatedAt": "2026-04-01T12:00:00.000Z"
      }
    ],
    "groupedByDay": {
      "1": [
        {
          "_id": "665f1a2b3c4d5e6f7a8b9c10",
          "day": 1,
          "description": "Lunch at Cafe",
          "category": "Food",
          "amount": 450
        }
      ],
      "3": [ ]
    }
  }
}
```

---

### GET `/entries/:monthKey/:day`
Get entries for a specific day.

- Auth: Required
- URL Params:
  - `monthKey` — format `YYYY-MM`
  - `day` — integer `1–31`
- Body: None

**200 OK**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": [
    {
      "_id": "665f1a2b3c4d5e6f7a8b9c10",
      "userId": "665f1a2b3c4d5e6f7a8b9c0a",
      "monthKey": "2026-04",
      "day": 1,
      "description": "Lunch at Cafe",
      "category": "Food",
      "amount": 450,
      "note": "Team lunch",
      "createdAt": "2026-04-01T12:00:00.000Z",
      "updatedAt": "2026-04-01T12:00:00.000Z"
    }
  ]
}
```

---

### POST `/entries`
Create a new entry. Automatically recomputes the month aggregate.

- Auth: Required
- Content-Type: `application/json`

**Request Body**
```json
{
  "monthKey":    "2026-04",   // string, regex YYYY-MM — required
  "day":         15,          // integer, 1–31 — required
  "description": "Lunch at Cafe",  // string, min 1, max 120 — required
  "category":    "Food",      // enum — required
  "amount":      450,         // number, positive — required
  "note":        "Team lunch" // string, max 255 — optional
}
```

**Category enum values:** `Food` | `Transport` | `Shopping` | `Health` | `Entertainment` | `Utilities` | `Other`

**201 Created**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Entry created",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c10",
    "userId": "665f1a2b3c4d5e6f7a8b9c0a",
    "monthKey": "2026-04",
    "day": 15,
    "description": "Lunch at Cafe",
    "category": "Food",
    "amount": 450,
    "note": "Team lunch",
    "createdAt": "2026-04-15T12:00:00.000Z",
    "updatedAt": "2026-04-15T12:00:00.000Z"
  }
}
```

**400 Bad Request** — validation failure
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "amount": ["Number must be greater than 0"],
    "category": ["Invalid enum value"]
  }
}
```

---

### PATCH `/entries/:entryId`
Update an existing entry. Automatically recomputes the month aggregate.

- Auth: Required
- URL Param: `entryId` — MongoDB ObjectId
- Content-Type: `application/json`

**Request Body** (all fields optional)
```json
{
  "description": "Dinner at Cafe",  // string, min 1, max 120 — optional
  "category":    "Food",            // enum — optional
  "amount":      600,               // number, positive — optional
  "note":        "Updated note"     // string, max 255 — optional
}
```

**200 OK**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c10",
    "userId": "665f1a2b3c4d5e6f7a8b9c0a",
    "monthKey": "2026-04",
    "day": 15,
    "description": "Dinner at Cafe",
    "category": "Food",
    "amount": 600,
    "note": "Updated note",
    "createdAt": "2026-04-15T12:00:00.000Z",
    "updatedAt": "2026-04-15T14:30:00.000Z"
  }
}
```

**404 Not Found**
```json
{ "success": false, "statusCode": 404, "message": "Entry not found" }
```

---

### DELETE `/entries/:entryId`
Delete an entry. Automatically recomputes the month aggregate.

- Auth: Required
- URL Param: `entryId` — MongoDB ObjectId
- Body: None

**200 OK**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Entry deleted",
  "data": null
}
```

**404 Not Found**
```json
{ "success": false, "statusCode": 404, "message": "Entry not found" }
```

---

## AI — `/api/v1/ai`

All routes require auth.

---

### POST `/ai/summarize/:monthKey`
Generate an AI spending summary for a month using Gemini.
Returns a cached result if one was generated within the last 6 hours.

- Auth: Required
- URL Param: `monthKey` — format `YYYY-MM`
- Body: None

**200 OK — fresh summary**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": {
    "summary": "You spent ₹18,200 in April 2026. Your biggest expense was Food at ₹8,400. Consider meal prepping to cut down on dining costs next month.",
    "cached": false,
    "generatedAt": "2026-04-30T18:00:00.000Z"
  }
}
```

**200 OK — cached summary**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": {
    "summary": "You spent ₹18,200 in April 2026...",
    "cached": true,
    "generatedAt": "2026-04-30T18:00:00.000Z"
  }
}
```

**404 Not Found** — month doesn't exist yet
```json
{ "success": false, "statusCode": 404, "message": "Month not found" }
```

---

## Common Error Responses

These apply to all protected routes.

**401 Unauthorized** — missing or expired token
```json
{ "success": false, "message": "Unauthorized" }
{ "success": false, "message": "Token expired or invalid" }
```

**500 Internal Server Error**
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal Server Error"
}
```

---

## Quick Reference Table

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register new user |
| POST | `/auth/login` | — | Login, get tokens |
| POST | `/auth/refresh` | — | Refresh access token |
| POST | `/auth/logout` | ✓ | Invalidate refresh token |
| GET | `/auth/me` | ✓ | Get current user |
| PATCH | `/auth/me` | ✓ | Update name / currency |
| GET | `/months` | ✓ | List all months |
| GET | `/months/:monthKey` | ✓ | Get single month summary |
| GET | `/entries/:monthKey` | ✓ | All entries for a month |
| GET | `/entries/:monthKey/:day` | ✓ | Entries for a specific day |
| POST | `/entries` | ✓ | Create entry |
| PATCH | `/entries/:entryId` | ✓ | Update entry |
| DELETE | `/entries/:entryId` | ✓ | Delete entry |
| POST | `/ai/summarize/:monthKey` | ✓ | Generate AI summary |
