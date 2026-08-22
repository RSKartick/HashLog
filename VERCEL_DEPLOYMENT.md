# Deploying HashLog to Vercel

HashLog is deployed as two Vercel projects because the frontend is Vite/React
and the backend is FastAPI/Python.

## Backend project

Create a Vercel project using this repository as the root directory. Vercel
will detect `api/index.py` as the Python serverless function.

Set these environment variables in the backend Vercel project:

```text
HASHLOG_CORS_ORIGINS=https://YOUR-FRONTEND.vercel.app
HASHLOG_API_KEY=use-a-long-random-value
HASHLOG_ENABLE_TAMPER_TEST=false
HASHLOG_SIGNING_SECRET=use-a-long-random-value
```

Deploy it and test:

```text
https://YOUR-BACKEND.vercel.app/api/health
```

## Frontend project

Create a second Vercel project with `frontend` as its Root Directory. Vercel
will run `npm run build` and serve the Vite output.

Set this frontend environment variable:

```text
VITE_API_BASE_URL=https://YOUR-BACKEND.vercel.app/api
# Must match HASHLOG_API_KEY if backend authentication is enabled.
VITE_API_KEY=the-same-value-used-by-the-backend
```

Redeploy after setting it. Local development still uses the Vite proxy when
`VITE_API_BASE_URL` is not set.

## Important database limitation

The current SQLite database is suitable for local development and a temporary
demo only. Vercel serverless instances do not provide durable local storage;
the fallback `/tmp/hashlog.db` can disappear or differ between instances.
For a real deployment, replace SQLite with a hosted durable database before
using HashLog for important records.
