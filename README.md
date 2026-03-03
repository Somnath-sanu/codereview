CodeCat (coderabbit)
---

An AI code review companion for GitHub pull requests.

When you connect a repo, CodeCat indexes its codebase into a vector database. When a PR is opened/updated, CodeCat pulls the diff, retrieves relevant context from the indexed codebase, generates an AI review (with configurable “theme” + “personality”), posts the review back to GitHub as a PR comment, and stores it in Postgres for later viewing.

### Table of contents

- What’s inside
- Projects (Problem → What you built → Impact)
- Architecture (high-level flow)
- Local setup
- Environment variables
- How to run
- Notes / limitations
- Code map

### What’s inside

- **Next.js app + dashboard**: sign in with GitHub, connect repos, configure review persona, see indexing status.
- **GitHub webhook listener**: listens for PR events and triggers background review jobs.
- **Background jobs (Inngest)**: repo indexing + PR review generation.
- **RAG stack**: embeds repository files and stores vectors in Pinecone for retrieval.
- **Persistence**: Prisma + Postgres to store users, connected repos, and generated reviews.

### Projects (Problem → What you built → Impact)

### Project 1 — GitHub OAuth + onboarding

- **Problem**: Developers want automated PR feedback, but the system needs secure access to their GitHub repos and a clean way to opt-in per-repository.
- **What you built**: GitHub login via `better-auth`, a dashboard to browse repositories, and “Connect Repository” flow that:
  - stores the repo in Postgres (Prisma)
  - creates a GitHub webhook for PR events
  - emits an Inngest event to kick off indexing
- **Impact**: Users can enable AI reviews repo-by-repo in a couple clicks, including private repos (OAuth scope includes `repo`).

### Project 2 — Repo indexing (vector memory)

- **Problem**: PR diffs alone rarely contain enough context to give good reviews (conventions, adjacent modules, existing patterns).
- **What you built**: An Inngest indexing job that:
  - recursively fetches repository files via GitHub API (skipping common binary extensions)
  - generates embeddings with Google’s embedding model
  - upserts vectors into Pinecone using a per-repo namespace
- **Impact**: Reviews can be grounded in the repo’s actual codebase, improving relevance and reducing generic feedback.

### Project 3 — PR review automation pipeline

- **Problem**: Manual reviews are slow and inconsistent; teams want fast, repeatable feedback on every PR update.
- **What you built**: A PR webhook handler + Inngest workflow that:
  - triggers on `pull_request` opened/synchronize events
  - fetches PR title/body and the diff
  - auto-generates a PR description when it’s missing (and updates GitHub)
  - retrieves context from Pinecone based on PR title/body
  - generates a structured markdown review using Gemini (`gemini-2.5-flash`)
  - posts the review as a GitHub comment and saves it to Postgres
- **Impact**: Every PR gets quick, consistent feedback automatically, and the persona settings make reviews feel tailored to the team (professional, ruthless, funny, etc.).

### Project 4 — “Theme + personality” prompt controls

- **Problem**: Teams want reviews that match their culture (strict vs supportive) and stay engaging over time.
- **What you built**: Per-repository settings stored in Postgres and exposed in the UI, feeding directly into the prompt used by the review generator (themes like Pirate/Shakespeare/Cyberpunk, personalities like Kind/Ruthless/Teaching).
- **Impact**: Higher adoption—reviews are both useful and fun, without rebuilding the pipeline.

### Architecture (high-level flow)

1. **User signs in with GitHub** (Better Auth + Prisma adapter).
2. **User connects a repo** in the dashboard.
3. App **creates a GitHub webhook** pointing to `NEXT_PUBLIC_BASE_URL/api/webhooks/github`.
4. App emits Inngest event **`repos.connected`**.
5. Inngest function **indexes the repo** into Pinecone and marks the repo `Indexed` in Postgres.
6. GitHub sends **PR webhook events** to `/api/webhooks/github`.
7. Webhook handler emits Inngest event **`pr.review.requested`**.
8. Inngest function **generates a review** and posts it to the PR.

### Local setup

You’ll need:

- **Node.js**: recommended v20+
- **Postgres**: local or hosted (Neon/Supabase/etc.)
- **Pinecone**: an index named `code-review`
- **GitHub OAuth App**: client id/secret
- **Google Generative AI API key**: used for both embeddings and text generation

### Environment variables

Create a `.env` file in the repo root:

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"

# Better Auth (used by the client auth helper)
BETTER_AUTH_URL="http://localhost:3000"

# Public base URL (used when creating the GitHub webhook)
# IMPORTANT: must be reachable by GitHub. For local dev, use a tunnel URL (ngrok/cloudflared).
NEXT_PUBLIC_BASE_URL="https://YOUR_PUBLIC_TUNNEL_URL"

# GitHub OAuth
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Pinecone
PINECONE_API_KEY="..."

# Google (Vercel AI SDK Google provider)
GOOGLE_GENERATIVE_AI_API_KEY="..."
```

### How to run

Install deps:

```bash
npm install
```

Set up the database:

```bash
npx prisma migrate dev
```

Run the Next.js dev server:

```bash
npm run dev
```

Run Inngest locally (in a second terminal):

```bash
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

### GitHub OAuth + webhook checklist (required)

- **GitHub OAuth callback URL** (local dev):
  - set to `http://localhost:3000/api/auth/callback/github`
- **Webhook URL**:
  - CodeCat creates it automatically using `NEXT_PUBLIC_BASE_URL`
  - for local dev, set `NEXT_PUBLIC_BASE_URL` to a public tunnel URL (GitHub cannot reach `localhost`)

### Notes / limitations

- **Webhook security**: webhook creation currently does not configure a secret, and the webhook handler does not verify signatures. Treat local/public deployments accordingly.
- **Index reuse**: indexing skips if the Pinecone namespace already exists. If you want to re-index, delete the namespace in Pinecone (or change the repo namespace logic).

### Code map

- **Auth**
  - `lib/auth.ts`: Better Auth server config (GitHub provider)
  - `app/api/auth/[...all]/route.ts`: Better Auth Next.js handler
  - `lib/auth-client.ts`: Better Auth React client
- **GitHub integration**
  - `lib/github.ts`: token lookup, list repos, create/remove webhook, fetch repo files, fetch PR diff, post comment, update PR description
  - `app/api/webhooks/github/route.ts`: GitHub webhook entrypoint
  - `app/api/webhooks/github/review.ts`: maps webhook → Inngest event
- **Background jobs**
  - `app/api/inngest/route.ts`: Inngest serve endpoint
  - `inngest/index-repo.ts`: indexes connected repos
  - `inngest/generate-review.ts`: generates & posts PR reviews
  - `inngest/prompts.ts`: themes + personalities and prompt template
- **RAG / Vector DB**
  - `lib/rag.ts`: embeddings + indexing + retrieval
  - `lib/pinecone.ts`: Pinecone client + `code-review` index
- **DB**
  - `prisma/schema.prisma`: models for users, repos, reviews
