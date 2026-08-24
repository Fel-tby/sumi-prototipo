import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { AppEnv } from "@server/config/env";

export function createSupabaseAdminClient(env: AppEnv): SupabaseClient | undefined {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return undefined;
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
