# &#x20;Note Hub API

A simple social-style backend API built with **Express.js + TypeScript + Prisma**.
Users can register, login, and manage posts and groups (public / private).

---

## &#x20;Features

- Authentication (Register, Login, Logout)
- JWT-based Auth (Access Token + Refresh Token via HTTP-only cookies)
- CRUD Posts
- Group system (public / private) _(planned / extendable)_
- Feature-based scalable folder structure
- Prisma ORM

---

## &#x20;Tech Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- bcrypt (password hashing)
- JWT (access + refresh tokens)
- HTTP-only Cookies (secure auth)

---

## &#x20;Installation

```bash
git clone https://github.com/your-username/note-hub.git
cd note-hub
npm install
```

---

## &#x20;Environment Variables

Create `.env` file:

```env
DATABASE_URL="your_database_url"

ACCESS_TOKEN_EXPIRE=
REFRESH_TOKEN_EXPIRE=
```

---

## &#x20;Run Project

```bash
npm run dev
```

---

## &#x20;Folder Structure

```bash
prisma/                 # Prisma schema and migrations
src/
├── config/             # Configuration files (e.g., error codes)
├── generated/          # Auto-generated Prisma client
├── lib/                # Library initializations (prisma.ts)
├── middlewares/        # Custom middlewares (auth.ts)
├── modules/            # Feature-based modules
│   ├── auth/           # Auth Controller, Routes, and Service
│   └── post/           # Post Controller, Routes, and Service
├── routes/             # Centralized API route index
├── types/              # Global TypeScript types/interfaces
├── utils/              # Utility helper functions
├── app.ts              # Express application setup
└── index.ts            # Server entry point
```

Feature-based structure = scalable + clean architecture

---

## &#x20;Authentication APIs

### 1. Register

```http
POST /api/register
```

**Body:**

```json
{
  "email": "user1@gmail.com",
  "password": "12345678"
}
```

---

### 2. Login

```http
POST /api/login
```

**Body:**

```json
{
  "email": "user1@gmail.com",
  "password": "12345678"
}
```

Returns:

- Access Token (HTTP-only cookie)
- Refresh Token (HTTP-only cookie)

---

### 3. Auth Check (Protected)

```http
GET /api/auth-check
```

Requires valid access token

---

### 4. Logout

```http
POST /api/logout
```

Clears cookies

---

## &#x20;Post APIs

### 1. Get All Posts

```http
GET /api/posts
```

---

### 2. Get Post by ID

```http
GET /api/posts/{id}
```

**Example:**

```
/api/posts/1
```

---

### 3. Create Post (Protected)

```http
POST /api/posts
```

**Body:**

```json
{
  "content": "post 3",
  "imageUrl": ""
}
```

---

### 4. Update Post (Protected)

```http
PATCH /api/posts/{id}
```

**Body:**

```json
{
  "content": "updated post",
  "imageUrl": ""
}
```

---

### 5. Delete Post (Protected)

```http
DELETE /api/posts/{id}
```

---

## &#x20;Authentication Flow

1. User login
2. Server validates credentials using bcrypt
3. Server generates:
   - Access Token (short-lived)
   - Refresh Token (long-lived)

4. Both tokens are stored in **HTTP-only cookies**

---

## &#x20;Future Improvements

- RBAC (Role-Based Access Control)
- Group permission system (public / private)
- Rate limiting & security enhancements
- Refresh token rotation & blacklist

---
