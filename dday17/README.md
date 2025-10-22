# Day 17 — Comprehensive Testing Strategies (API)

This project demonstrates unit/integration/API testing strategies using Jest and Supertest with an in-memory datastore.

## Available scripts

- npm start — run the Express server
- npm test — run tests
- npm run coverage — run tests with coverage

## Endpoints

- GET /health — returns {status: 'ok'}

Users API
- POST /users {name, email} — create user
- GET /users — list users
- GET /users/:id — get user
- PUT /users/:id {name, email} — update user
- DELETE /users/:id — delete user

Posts API
- POST /posts {title, body, authorId} — create post
- GET /posts — list posts
- GET /posts/:id — get post
- PUT /posts/:id {title, body} — update post
- DELETE /posts/:id — delete post

Search API
- GET /search?q=term — search users and posts

## Testing

Run tests with:

```powershell
npm test
```

Run coverage report:

```powershell
npm run coverage
```

## Notes

- The project uses an in-memory store located at `src/store/memory.js` for fast, side-effect-free tests.
- Improvements: add unit tests for individual modules, add CI workflow, and more edge-case tests (rate limits, auth).