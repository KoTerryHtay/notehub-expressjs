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
│   └── group/           # group Controller, Routes, and Service
│   └── post/           # Post Controller, Routes, and Service
├── routes/             # Centralized API route index
├── types/              # Global TypeScript types/interfaces
├── utils/              # Utility helper functions
├── app.ts              # Express application setup
└── index.ts            # Server entry point
```

Feature-based structure = scalable + clean architecture

---

## 📬 Postman Collection

The [Postman](https://www.postman.com/) API collection file is included in this repository:

- **File:** `Note Hub.postman_collection.json`

### How to use

1. Install [Postman](https://www.postman.com/downloads/)
2. Click **Import** → **Upload Files** and select the `Note Hub.postman_collection.json` file
3. Set the environment variable `{{devUrl}}` to your local server URL (e.g., `http://localhost:4000`)
4. Start testing the endpoints

> All 🔒 endpoints require a valid authentication session. Use the `login` or `register` requests first, then the session cookie will be automatically managed by Postman.

## 🔐 Authentication APIs

| Method | Endpoint          | Auth | Description                 | Body                                          |
| ------ | ----------------- | ---- | --------------------------- | --------------------------------------------- |
| POST   | `/api/register`   |      | Register a new user         | `{ "email": "string", "password": "string" }` |
| POST   | `/api/login`      |      | Login user                  | `{ "email": "string", "password": "string" }` |
| GET    | `/api/auth-check` | 🔒   | Check authentication status | –                                             |
| POST   | `/api/logout`     | 🔒   | Logout user                 | –                                             |

## 📄 Posts APIs

| Method | Endpoint                         | Auth | Description                                        | Body                                                                          |
| ------ | -------------------------------- | ---- | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| GET    | `/api/posts`                     |      | Get all posts (public & private based on privacy)  | –                                                                             |
| GET    | `/api/posts/{id}`                |      | Get post by ID                                     | –                                                                             |
| POST   | `/api/posts`                     | 🔒   | Create a new post                                  | `{ "content": "string", "privacy": "PUBLIC/PRIVATE", "imageUrl?": "string" }` |
| PATCH  | `/api/posts/{id}`                | 🔒   | Update own post                                    | `{ "content?": "string", "imageUrl?": "string" }`                             |
| DELETE | `/api/posts/{id}`                | 🔒   | Delete own post                                    | –                                                                             |
| GET    | `/api/posts/me`                  | 🔒   | Get all posts of logged-in user                    | –                                                                             |
| GET    | `/api/posts/user/{userId}/posts` |      | Get all posts from another user (respects privacy) | –                                                                             |

## 👥 Groups APIs

| Method | Endpoint                                        | Auth | Description                                          | Body                                                                         |
| ------ | ----------------------------------------------- | ---- | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/api/groups`                                   |      | Get all groups                                       | –                                                                            |
| GET    | `/api/groups/{id}`                              |      | Get group details by ID                              | –                                                                            |
| POST   | `/api/groups`                                   | 🔒   | Create a new group                                   | `{ "name": "string", "description": "string", "type": "PUBLIC/PRIVATE" }`    |
| PATCH  | `/api/groups/{id}`                              | 🔒   | Update group (admin/owner only)                      | `{ "name?": "string", "description?": "string", "type?": "PUBLIC/PRIVATE" }` |
| GET    | `/api/groups/{id}/members`                      |      | Get all members of a group                           | –                                                                            |
| POST   | `/api/groups/{id}/join`                         | 🔒   | Join a public group or request to join private group | –                                                                            |
| PATCH  | `/api/groups/{groupId}/members/{userId}/role`   | 🔒   | Change member role (admin only)                      | `{ "role": "ADMIN/MEMBER" }`                                                 |
| DELETE | `/api/groups/{id}/leave`                        | 🔒   | Leave a group (current user)                         | –                                                                            |
| DELETE | `/api/groups/{groupId}/members/{userId}/remove` | 🔒   | Remove a member (admin/owner only)                   | –                                                                            |
| POST   | `/api/groups/{groupId}/members/{userId}/add`    | 🔒   | Add a member (admin/owner only)                      | –                                                                            |
| DELETE | `/api/groups/{id}`                              | 🔒   | Delete group (owner only)                            | –                                                                            |

## 📝 Group Posts APIs

| Method | Endpoint                               | Auth | Description                                       | Body                                              |
| ------ | -------------------------------------- | ---- | ------------------------------------------------- | ------------------------------------------------- |
| GET    | `/api/groups/{groupId}/posts`          |      | Get all posts inside a group (visible to members) | –                                                 |
| GET    | `/api/groups/{groupId}/posts/{postId}` |      | Get a specific group post by ID                   | –                                                 |
| POST   | `/api/groups/{groupId}/posts`          | 🔒   | Create a post in a group (must be member)         | `{ "content": "string", "imageUrl?": "string" }`  |
| PATCH  | `/api/groups/{groupId}/posts/{postId}` | 🔒   | Update own group post                             | `{ "content?": "string", "imageUrl?": "string" }` |
| DELETE | `/api/groups/{groupId}/posts/{postId}` | 🔒   | Delete group post (owner or admin/owner of group) | –                                                 |

> 🔒 = Requires authentication

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
