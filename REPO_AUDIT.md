# Repository Audit (Automated)

## Can the project run?
- **Frontend:** Yes, the client builds successfully (`npm run build`).
- **Backend:** The server process starts, but full verification requires MongoDB. In this environment `mongod` is not installed, so API runtime could not be fully validated end-to-end.

## Major bugs identified
1. Admin routes are publicly accessible (missing auth/role middleware).
2. Debug/test admin endpoints (`/api/admin/test`, `/api/admin/test-create`) are exposed in production route files.
3. `setup-admin` script is referenced but `setup-admin.js` is missing.
4. JWT secret has an insecure fallback (`'secret'`).
5. README references files/paths that do not exist (`.env.example`, `docs/API.md`, screenshots).

## README accuracy
- Partially accurate for high-level architecture and client build.
- Not accurate in several setup/documentation details listed above.

## Top improvements before demo
1. Lock down admin routes with JWT + `authorizeRoles('admin')`.
2. Remove or gate debug endpoints behind development-only flags.
3. Add required setup assets (`.env.example`, `setup-admin.js`) or update docs.
4. Enforce strict required env vars (no insecure default secrets).
5. Add basic smoke/integration tests for auth and role-based route access.
