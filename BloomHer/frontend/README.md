# BloomHer frontend

React 19, TypeScript, Vite, Tailwind CSS, and React Router.

## Run

```bash
npm install
npm run dev
```

Optional API override: create `.env.local` using `.env.example` as a template and set `VITE_API_BASE_URL`.

## Checks

```bash
npm run build
npm run lint
```

The screening question wording/options are fetched from the backend so the UI and scoring engine use the same canonical question set. The AI resource finder sends only the text entered in that feature to the non-clinical topic-classification endpoint.

Some ASHA/professional follow-up panels and parts of the dashboard still use mock demonstration data. Do not present those screens as fully persisted workflows.
