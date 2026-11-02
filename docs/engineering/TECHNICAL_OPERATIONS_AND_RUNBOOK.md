# TPA Platform: Technical Operations, Setup & Verification Runbook
**Tollygunge Professional Association (TPA)**  
*Document Version:* 1.0.0 | *Last Updated:* 2026-11-01  
*Audience:* DevOps Engineers, SREs, Full-Stack Developers, QA Engineers

---

## 1. Developer Quick-Start & Local Setup

### 1.1 Prerequisites
- **Node.js**: `v20.x` or `v24.x` (LTS recommended; tested with Node.js 20.18.0 and Node 24).
- **PostgreSQL**: Version 16, 17, or 18 (Local instance or Docker container).
- **Git**: Installed and accessible in your shell.

### 1.2 Initial Workspace Bootstrap
Clone the repository and install locked dependencies using `npm ci`:

```bash
# Clone the repository
git clone <repository-url>
cd tollygunge

# Clean-install dependencies matching package-lock.json
npm ci
```

### 1.3 Environment Configuration (`.env.local`)
Create your local environment file by copying `.env.example`:

```bash
cp .env.example .env.local
```

#### Core Variable Reference:
```ini
# PostgreSQL connection string
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/tpa_local

# Safety guard: Must match the current database name to prevent migrations on the wrong DB
TPA_DATABASE_NAME=tpa_local

# Database SSL configuration (false for local development, true for cloud/Railway)
DATABASE_SSL=false
DATABASE_CA_PEM=

# Better Auth secret (minimum 32-character random string)
BETTER_AUTH_SECRET=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
BETTER_AUTH_URL=http://127.0.0.1:3000

# Cloudflare R2 / S3 Object Storage (Local mock/test keys or staging bucket)
R2_BUCKET_NAME=tpa-private-documents
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=

# Email Operations (Set TPA_MAIL_SINK=true for local loopback testing without sending live emails)
TPA_MAIL_SINK=true
EMAIL_OPERATIONS_ENABLED=true
RESEND_API_KEY=
RESEND_DOMAIN_VERIFIED=false
```

---

## 2. Unified Run Script (`run.sh`)

To simplify daily development, testing, and operations, the platform provides a unified CLI runner at [`run.sh`](file:///Users/shubhamkumar/Downloads/Navigatte%20Projects/tollygunge/run.sh).

Make the script executable if needed:
```bash
chmod +x run.sh
```

### 2.1 Available Commands

```bash
# 1. Start local development server (with automatic pre-flight checks)
./run.sh dev
# Or via npm:
npm run run:platform

# 2. Apply all pending database migrations (001_*.sql through 034_*.sql)
./run.sh migrate

# 3. Run repository structure check, linter, and typecheck
./run.sh check

# 4. Run fast unit test suite
./run.sh test

# 5. Run database and HTTP integration tests against local environment
./run.sh test:integration

# 6. Build the application and compile background workers
./run.sh build

# 7. Start the production supervisor (Web Server + Email Worker + Import Worker)
./run.sh prod

# 8. Safely provision the initial offline administrator account
./run.sh provision-admin

# 9. Clean build caches and temporary test directories
./run.sh clean
```

---

## 3. Database Lifecycle & Migrations

### 3.1 Migration Execution Engine (`scripts/migrate.mjs`)
The migration engine enforces strict transactional safety, checksum validation, and environment verification.

```bash
npm run db:migrate
```

**Key Operational Mechanics:**
1. **Advisory Lock (`894212036`)**: Prevents multiple migration instances from executing simultaneously against the database.
2. **Database Identity Validation**: Checks `SELECT current_database()` against `process.env.TPA_DATABASE_NAME`. If they do not match, the script immediately throws an error and aborts.
3. **Checksum Tampering Detection**: Every `.sql` migration in `migrations/` has its SHA-256 hash recorded in `public.tpa_migrations`. If any applied migration file is edited post-application, the runner halts to prevent database drift.
4. **Targeted Migration Window**: Supports the `--through <NNN>` flag (e.g., `--through 020`) to apply migrations up to a specific version during staging rehearsals.

### 3.2 Offline First-Administrator Provisioning
When initializing a fresh environment, public sign-up is closed for security. The initial administrator must be provisioned via the explicit, offline script [`scripts/provision-first-admin.mts`](file:///Users/shubhamkumar/Downloads/Navigatte%20Projects/tollygunge/scripts/provision-first-admin.mts):

```bash
# Execute provisioning script via the unified runner
./scripts/run.sh provision-admin
```

**What this does:**
1. Verifies that the operator explicitly authorizes `tollygungecacpestudycircle@gmail.com`.
2. Inserts records into `public.user` and `public.account` with a cryptographically generated 24-character random password.
3. Inserts an operator bootstrap approval in `tpa.operator_approved_identities`.
4. Grants the `administrator` role in `tpa.staff_roles`.
5. Emits an audit entry in `tpa.audit_events`.
6. Writes temporary credentials to the restricted local file `.local/first-admin-password.txt` (`chmod 600`) without printing secrets to terminal logs.

---

## 4. Build & Standalone Compilation Pipeline

The production build comprises two compilation phases managed by `npm run build`:

```mermaid
flowchart LR
    Sources["Source Code\n(TypeScript / JSX)"] --> NextBuild["Next.js Build\n(next build)"]
    Sources --> ESBuild["Worker Bundler\n(scripts/build-worker.mjs)"]
    
    NextBuild --> Standalone[".next/standalone/\n(Node.js Web Server)"]
    NextBuild --> Static[".next/static/\n(Client Assets)"]
    
    ESBuild --> EmailBundle[".next/email-worker.mjs\n(ESM Daemon)"]
    ESBuild --> ImportBundle[".next/member-import-worker.mjs\n(ESM Daemon)"]
```

1. **Next.js Standalone Build**:
   - `next.config.mjs` configures `output: "standalone"`.
   - Traces and extracts only production dependencies into `.next/standalone/server.js`, drastically reducing container image footprint.
2. **Worker Standalone Bundling (`scripts/build-worker.mjs`)**:
   - Uses `esbuild` to compile `scripts/email-worker.mts` into `.next/email-worker.mjs` and `scripts/member-import-worker.mts` into `.next/member-import-worker.mjs`.
   - Targets modern Node.js ESM format with `external: ["pg"]` to leverage native PostgreSQL driver features.

---

## 5. Background Worker Supervision & Telemetry

### 5.1 Runtime Process Supervisor (`scripts/start-runtime.mjs`)
In Docker and cloud environments, the container CMD runs `node start-runtime.mjs`.

- **Child Process Isolation**: Spawns `server.js` (Web), `email-worker.mjs`, and `member-import-worker.mjs`.
- **Fault Tolerance**: If a background worker terminates abnormally, the supervisor logs the event and schedules an automatic restart with exponential backoff (`5s`, `10s`, `20s`, up to `60s`).
- **Web High Availability**: A worker crash **never** terminates the web server. Public visitors and staff continue operating while background queues recover.
- **Graceful Shutdown**: Upon receiving `SIGTERM` or `SIGINT`, the supervisor stops queue leases, initiates a 25-second graceful drain, and terminates child processes cleanly.

### 5.2 Health Telemetry (`/api/health`)
The supervisor writes real-time health data to `/tmp/tpa-runtime-health-${PORT}.json`.
Invoking `GET /api/health` returns:
```json
{
  "status": "ready",
  "database": "connected",
  "workers": {
    "email": "running",
    "import": "running"
  },
  "updatedAt": "2026-11-01T14:30:00.000Z"
}
```

---

## 6. Automated Quality Gates & Verification Testing

The platform enforces a layered testing pyramid:

| Test Suite | Command | Scope & Safety Boundaries |
|---|---|---|
| **Repository Structure** | `npm run check:structure` | Validates file placement against `docs/engineering/REPOSITORY_STRUCTURE.md`. Rejects untracked root files, secrets, or certificates. |
| **Lint & Style** | `npm run lint` | ESLint 9 App Router rules, React 19 hooks, import hygiene. |
| **Type Integrity** | `npm run typecheck` | TypeScript strict type validation without emitting files. |
| **Unit Tests** | `npm test` | In-memory unit tests covering permissions, image metadata stripping, CSV parser, and payment validation. |
| **Database Integration** | `npm run test:db` | Transactional migration integrity, foreign key cascades, password hashing, and session revocation against PostgreSQL. |
| **HTTP API Integration** | `npm run test:http` | End-to-end API tests covering staff RBAC, member application isolation, CRM privacy, and capacity locks. |
| **Storage Verification** | `npm run test:storage` | Validates R2 bucket connectivity, presigned URL generation, and automatic cleanup of test objects. |
| **Launch Readiness Gate** | `npm run test:launch` | Comprehensive orchestration runner executing 23 distinct static, runtime, and browser acceptance phases. |

---

## 7. Docker Containerization & Deployment

### 7.1 Multi-Stage Dockerfile
The production container is defined in [`Dockerfile`](file:///Users/shubhamkumar/Downloads/Navigatte%20Projects/tollygunge/Dockerfile):

```dockerfile
# Stage 1: Install dependencies
FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build Next.js application & bundle workers
FROM dependencies AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN mkdir -p public && npm run build

# Stage 3: Minimal production runtime container
FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/email-worker.mjs ./email-worker.mjs
COPY --from=build --chown=node:node /app/.next/member-import-worker.mjs ./member-import-worker.mjs
COPY --from=build --chown=node:node /app/scripts/start-runtime.mjs ./start-runtime.mjs
USER node
EXPOSE 3000
CMD ["node", "start-runtime.mjs"]
```

### 7.2 Railway Deployment Guidelines
1. **Service Setup**: Connect the GitHub repository to Railway.
2. **PostgreSQL Database**: Provision a dedicated Railway PostgreSQL database (`tpa-platform`).
3. **Environment Secrets**: Configure variables in the Railway dashboard (do not commit to Git):
   - `DATABASE_URL` (Internal private Railway database URL)
   - `TPA_DATABASE_NAME` (e.g., `railway`)
   - `BETTER_AUTH_SECRET` (Secure 64-char string)
   - `BETTER_AUTH_URL` (`https://<custom-domain>`)
   - `R2_*` credentials for Cloudflare storage
4. **Health Check Probe**: Configure the Railway health check path to `/api/health` with a 30-second initial timeout.

---

## 8. Troubleshooting & Incident Playbook

### 8.1 Database Connection or SSL Failures
- **Symptom**: `Error: self-signed certificate in certificate chain` or `Connection timeout`.
- **Resolution**:
  - In local development, verify `DATABASE_SSL=false` in `.env.local`.
  - In cloud/production environments, set `DATABASE_SSL=true`. If connecting to a managed PostgreSQL cluster requiring a root certificate, set `DATABASE_CA_PEM` to the PEM certificate string.

### 8.2 Stale Migration Checksum Error
- **Symptom**: `Error: Applied migration changed: 015_people_review.sql`.
- **Cause**: An existing SQL migration file was edited after having been applied to the database.
- **Resolution**:
  - Never edit applied migration files in `migrations/`.
  - Revert the changes to the historical file. To alter database structure, create a new numbered migration (e.g., `035_your_fix.sql`).

### 8.3 Emergency Staff Access Lockout
- **Symptom**: Staff members unable to log in, or administrator password forgotten.
- **Resolution**:
  - Run `./scripts/run.sh provision-admin` in an authenticated shell.
  - The script will re-verify or regenerate credentials in `.local/first-admin-password.txt` without disturbing other operational tables.

