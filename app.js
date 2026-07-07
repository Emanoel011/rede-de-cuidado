// Substitua pelas chaves reais do seu projeto Supabase!
const SUPABASE_URL = 'https://peqmqjlaypgwtscwpkot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcW1xamxheXBnd3RzY3dwa290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjcwODksImV4cCI6MjA5OTAwMzA4OX0.fllv67MNZHyOW6yH9HCZOS5Kbk-2N-GpY5bEMCbXkik';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elementos da Interface
const authScreen = document.getElementById('authScreen');
const appScreen = document.getElementById('appScreen');
const loginForm = document.getElementById('loginForm');
const regForm = document.getElementById('regForm');
const sysMsg = document.getElementById('sysMsg');

// Verifica se já tem alguém logado ao abrir a página
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showApp(session.user);
    }
}
checkSession();

// Alternar entre tela de Login e Registro
function toggleMode() {
    loginForm.classList.toggle('hidden');
    regForm.classList.toggle('hidden');
    sysMsg.style.display = 'none';
}

// Mostrar mensagens de erro/sucesso
function showMsg(text, type) {
    sysMsg.textContent = text;
    sysMsg.className = `p-4 rounded-xl text-sm font-medium mb-4 flex items-center gap-2 ${type === 'err' ? 'bg-[#FDF0ED] text-[#C0472B] border border-[#F1C9BC]' : 'bg-[#EAF6F0] text-[#1A5444] border border-[#C7E5D5]'}`;
    sysMsg.style.display = 'flex';
}

// ------------------------------------
// AÇÕES DE BANCO DE DADOS
// ------------------------------------

async function doLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) showMsg('Credenciais inválidas.', 'err');
    else showApp(data.user);
}

async function doRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;
    const role = document.getElementById('regRole').value;

    const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name, department: role } }
    });

    if (error) showMsg(error.message, 'err');
    else {
        showMsg('Cadastro criado! Faça login para continuar.', 'ok');
        toggleMode(); // Volta pra tela de login
    }
}

async function doLogout() {
    await supabase.auth.signOut();
    // Esconde o painel e mostra a tela de login
    appScreen.classList.remove('grid');
    appScreen.classList.add('hidden');
    authScreen.classList.remove('hidden');
    authScreen.classList.add('flex');
}

// Função para exibir o painel logado
function showApp(user) {
    // Esconde login, mostra sistema
    authScreen.classList.remove('flex');
    authScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    appScreen.classList.add('grid');

    // Preenche os dados do usuário na tela
    document.getElementById('userName').textContent = user.user_metadata?.full_name || user.email;
    document.getElementById('userRole').textContent = user.user_metadata?.department || 'Geral';
}
