import { createClient } from '@supabase/supabase-js';

// Coloque suas chaves reais aqui. 
// A URL precisa OBRIGATORIAMENTE ser um link válido começando com "https://"
const supabaseUrl = 'sb_publishable_wJgyJTmvaXGWfxJreleENA_GtPHy0L9'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcW1xamxheXBnd3RzY3dwa290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjcwODksImV4cCI6MjA5OTAwMzA4OX0.fllv67MNZHyOW6yH9HCZOS5Kbk-2N-GpY5bEMCbXkik';

// Proteção contra a tela branca: verifica se é uma URL válida antes de inicializar
const isValidUrl = supabaseUrl.startsWith('https://');

export const supabase = isValidUrl ? createClient(supabaseUrl, supabaseKey) : null;
