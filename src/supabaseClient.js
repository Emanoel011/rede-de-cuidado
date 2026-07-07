import { createClient } from '@supabase/supabase-js';

// Coloque suas chaves reais aqui. 
// A URL precisa OBRIGATORIAMENTE ser um link válido começando com "https://"
const supabaseUrl = 'https://seu-projeto.supabase.co'; 
const supabaseKey = 'sua-chave-anon-publica-aqui';

// Proteção contra a tela branca: verifica se é uma URL válida antes de inicializar
const isValidUrl = supabaseUrl.startsWith('https://');

export const supabase = isValidUrl ? createClient(supabaseUrl, supabaseKey) : null;
