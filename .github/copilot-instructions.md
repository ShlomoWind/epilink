# Copilot instructions for epilink

## Project overview

Epilink is a Hebrew-first, right-to-left React single-page app for managing appointments and clients. It uses Vite, Tailwind CSS, styled-components, Supabase, and Google OAuth through Supabase Auth.

## Build, lint, and test

- `npm run dev` starts the Vite development server.
- `npm run build` creates the production build.
- `npm run lint` runs ESLint across the repository.
- To lint one file, run `npx eslint src/features/appointments/AppointmentBoard.jsx` and replace the path with the file being changed.
- There is no automated test runner or test script configured in `package.json`.

The app requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`; `src/supabaseClient.js` fails fast when either is missing.

## Architecture and data flow

- `src/main.jsx` mounts the React app. `src/App.jsx` owns the active tab and composes the navbar, appointment board, and client list inside `src/layouts/AppShell.jsx`.
- `src/layouts/AppShell.jsx` establishes the shared RTL page shell. Keep Hebrew-facing screens and navigation compatible with RTL.
- Authentication is isolated under `src/features/auth/`. `useAuth` subscribes to Supabase auth state, tracks the user and Google identity, and exposes login/logout actions and UI state. `googleAuthService` owns Supabase OAuth operations and auth error messaging; `googleIdentityService` fetches the Google user profile.
- Domain data access is separated into feature services: `src/features/clients/clientsService.js` and `src/features/appointments/appointmentsService.js`. Feature components should use these services rather than calling Supabase directly.
- Appointment queries include nested client details and order by appointment date. Keep the Supabase relationship selection and returned shape in sync with appointment UI usage.
- Shared navigation UI lives in `src/components/Navbar/`; feature-specific UI belongs under `src/features/<domain>/`.

## Repository conventions

- React components use default exports; service functions and hooks use named exports. Hook names follow the `useX` pattern.
- Keep each domain's data operations in its feature `services/` module (or the existing service file at the feature root). Services throw on Supabase errors; auth-specific user-facing error mapping belongs in `googleAuthService`.
- Shared component styling is commonly defined in a sibling `*.styles.js` file with styled-components. Tailwind utility classes are also used for layout and page-level styling.
- Follow the existing JavaScript/JSX style: single-quoted strings and semicolons in feature code.
