# Contributing

## Development setup

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
node seed/seedOrgTypes.js
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```

## Code style

- Backend: CommonJS, 2-space indent, no semicolons is OK, prefer `async/await`.
- Frontend: ES modules + JSX, 2-space indent, Tailwind v4 utility classes.
- All new endpoints must have a Joi validation schema in `validations/`.
- All new cross-cutting concerns go in `middleware/`.

## Commit messages

Use Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
Keep the subject line under 72 characters. Wrap the body at 72.

## Pull requests

- One logical change per PR.
- CI must pass: backend lint + unit + integration test, frontend lint + build.
- Update the docs if the change affects the API surface.
