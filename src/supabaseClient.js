import { createClient } from '@supabase/supabase-js';

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;

const missingVariables = [
  ['VITE_SUPABASE_URL', VITE_SUPABASE_URL],
  ['VITE_SUPABASE_ANON_KEY', VITE_SUPABASE_ANON_KEY],
]
  .filter(([, value]) => !value?.trim())
  .map(([name]) => name);

if (missingVariables.length > 0) {
  throw new Error(
    `Missing Supabase environment variables: ${missingVariables.join(', ')}. ` +
      'Add them to your local .env.local file.',
  );
}

export const supabase = createClient(
  VITE_SUPABASE_URL.trim(),
  VITE_SUPABASE_ANON_KEY.trim(),
);
