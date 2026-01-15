# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Backend API expectations for revenue/monthly reports (developer notes) 🔧

To support monthly revenue rekap (used by Dashboard):

- GET /dashboard/revenue-trend?group=week
  - Returns last 7 days by default: [{ date: '2026-01-04', total: 120000 }, ...]
- GET /dashboard/revenue-trend?group=month&year=2026&months=12
  - Returns last 12 months for the given year: [{ date: '2026-01', total: 120000 }, ...]
- GET /dashboard/revenue-trend?group=year&years=5
  - Returns last N years: [{ date: '2022', total: 1200000 }, ...]

Each point should include a numeric `total` field and a `date` string in the formats above. The frontend will switch label formatting depending on `group`.

Optional enhancements for owner mode:
- Support filter by staff id: `?staffId=123` to show revenue handled by a specific employee.
- Support breakdown per category (room, food) in the detail endpoint: `/dashboard/revenue-detail?month=2026-01`.

Security note: ensure the backend enforces role-based access (only owner can delete users or access staff-wide reports).

---

Local dev / testing

- The frontend reads the API base from `VITE_API_URL`. Create a `.env` file at the project root and add, for example:

  VITE_API_URL=http://localhost:3000

  The code will append `/api` automatically so requests go to `http://localhost:3000/api/...`.

- Ensure your backend is running and supports the endpoints described above. You can test quickly with curl or Postman, e.g.:

  curl -v "http://localhost:3000/api/dashboard/revenue-trend?group=month&year=2026&months=12"

- If you get CORS or auth errors, check the backend's CORS policy and auth/session middleware (frontend uses cookies withCredentials by default).


