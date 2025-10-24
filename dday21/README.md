# Day 21 — ContactForm (useState & Controlled Components)

This small project demonstrates a controlled React contact form using the `useState` hook.

Features
- Controlled inputs for name, email, and message
- Real-time validation with user-friendly error messages
- Disabled submit when invalid
- Success confirmation after submit

Validation rules
- Name: required, minimum 2 characters
- Email: required, simple email format check
- Message: required, minimum 10 characters, max 500 chars

Get started (PowerShell / Windows)

```powershell
npm install
npm run dev
```

Open the local dev server shown by Vite (usually http://localhost:5173).

Notes / next steps
- Add unit tests (Vitest + React Testing Library)
- Add TypeScript types
- Hook up to a backend endpoint

Slides for this lesson: https://lnkd.in/gWRrGadM
