import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'SUA_URL_DO_SUPABASE_AQUI';
const supabaseKey = 'SUA_CHAVE_ANON_PUBLICA_AQUI';

export const supabase = createClient(supabaseUrl, supabaseKey);
