# Day 16 — Unified API System (MERN)

This project contains a minimal Express + Mongoose unified API demonstrating:

- Multi-resource endpoints
- Cross-resource aggregations
- Advanced search across collections
- Analytics endpoints (skill counts, career progression, technology trends)

Quick start

1. Install dependencies

```pwsh
npm install
```

2. Configure MongoDB

Create a `.env` file in the project root with:

```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.example/mydb
PORT=4000
```

If no `MONGO_URI` is provided the server will run in "mock" mode and return sample data so you can try the endpoints without a DB.

3. Run

```pwsh
npm run dev
```

Endpoints

- GET /api/profile/dashboard
- GET /api/profile/portfolio
- GET /api/search?q=term
- GET /api/analytics/skills
- GET /api/analytics/career
- GET /api/analytics/technology

Notes

This scaffold is minimal and focuses on API structure and aggregation patterns. You can wire it to your real data by providing a Mongo connection string.
