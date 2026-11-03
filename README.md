# epilink
Epilink - Hair removal appointment and management system

## Project structure

- `src/App.jsx` composes the authenticated application and its active feature.
- `src/features/` contains domain-focused modules. Each feature keeps its UI, hooks, services, and supporting constants or utilities together.
- `src/components/ui/` contains shared UI primitives used across features.
- `src/layouts/` contains application-wide layout components.
- `src/utils/` contains small utilities shared by multiple features.
- `src/hooks/useCachedResource.js` and `src/utils/resourceCache.js` provide shared, user-scoped server-data caching with background refresh.

Feature components should use their feature hooks and services for state, business operations, and server communication. Keep shared components generic only when multiple features genuinely need the same behavior.
Visited screens remain mounted when switching tabs, so local UI state and loaded data are retained. Server data is shared between features, refreshed after related mutations, and revalidated when the browser regains focus. Authentication changes clear the cache to avoid retaining another session's data.

## Development checks

- `npm run lint` runs ESLint.
- `npm run build` creates the production bundle.

There is currently no automated test runner or TypeScript check configured.