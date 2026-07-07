import { createClient } from '@supabase/supabase-js';

// SUBSTITUA pelas suas credenciais do painel do Supabase quando for testar o banco
const supabaseUrl = 'sb_publishable_wJgyJTmvaXGWfxJreleENA_GtPHy0L9'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcW1xamxheXBnd3RzY3dwa290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjcwODksImV4cCI6MjA5OTAwMzA4OX0.fllv67MNZHyOW6yH9HCZOS5Kbk-2N-GpY5bEMCbXkik';

// Validação secundária para impedir que strings falsas quebrem o código no deploy
const isPlaceholder = supabaseUrl.includes('seu-projeto-real') || !supabaseUrl.startsWith('https://');

export const supabase = isPlaceholder ? null : createClient(supabaseUrl, supabaseKey);
// A URL precisa OBRIGATORIAMENTE ser um link válido começando com "https://"
