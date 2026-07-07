// Substitua pelas chaves reais do seu projeto Supabase!
const SUPABASE_URL = 'https://peqmqjlaypgwtscwpkot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcW1xamxheXBnd3RzY3dwa290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjcwODksImV4cCI6MjA5OTAwMzA4OX0.fllv67MNZHyOW6yH9HCZOS5Kbk-2N-GpY5bEMCbXkik';

// Inicialização com proteção contra quebra de script
let supabase = null;
try {
    if (SUPABASE_URL.startsWith('https://')) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
} catch (e) {
    console.error("Erro ao inicializar Supabase:", e);
}

// Elementos da Interface
const authScreen = document.getElementById('authScreen');
const appScreen = document.getElementById('appScreen');
const sysMsg = document.getElementById('sysMsg');

// SISTEMA DE NAVEGAÇÃO ENTRE TELAS (Agora à prova de falhas!)
function switchView(viewName) {
    // Esconde todos os formulários e mensagens
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('regForm').classList.add('hidden');
    document.getElementById('forgotForm').classList.add('hidden');
    sysMsg.style.display = 'none';

    // Mostra apenas a tela solicitada
    if (viewName === 'login') document.getElementById('loginForm').classList.remove('hidden');
    if (viewName === 'register') document.getElementById('regForm').classList.remove('hidden');
    if (viewName === 'forgot') document.getElementById('forgotForm').classList.remove('hidden');
}
// Torna a função acessível globalmente pelos botões do HTML
window.switchView = switchView;

// Função para exibir mensagens visuais
function showMsg(text, type) {
    sysMsg.textContent = text;
    sysMsg.className = `p-4 rounded-xl text-sm font-medium mb-4 flex items-center gap-2 ${type === 'err' ? 'bg-[#FDF0ED] text-[#C0472B] border border-[#F1C9BC]' : 'bg-[#EAF6F0] text-[#1A5444] border border-[#C7E5D5]'}`;
    sysMsg.style.display = 'flex';
}

// Verifica se existe usuário logado ao abrir
async function checkSession() {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) showApp(session.user);
}
checkSession();

// ------------------------------------
// AÇÕES DO SUPABASE (LOGIN, CADASTRO, RECUPERAÇÃO)
// ------------------------------------

async function doLogin(e) {
    e.preventDefault();
    if (!supabase) return showMsg('Conecte o Supabase no arquivo app.js primeiro.', 'err');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;

    showMsg('Conectando...', 'ok');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) showMsg('E-mail ou senha incorretos.', 'err');
    else {
        sysMsg.style.display = 'none';
        showApp(data.user);
    }
}

async function doRegister(e) {
    e.preventDefault();
    if (!supabase) return showMsg('Conecte o Supabase no arquivo app.js primeiro.', 'err');

    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;
    const role = document.getElementById('regRole').value;

    showMsg('Criando conta...', 'ok');
    const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name, department: role } }
    });

    if (error) showMsg(`Erro: ${error.message}`, 'err');
    else {
        showMsg('Cadastro realizado com sucesso! Faça login.', 'ok');
        setTimeout(() => switchView('login'), 2000);
    }
}

// NOVA FUNÇÃO: RECUPERAÇÃO DE SENHA
async function doRecover(e) {
    e.preventDefault();
    if (!supabase) return showMsg('Conecte o Supabase no arquivo app.js primeiro.', 'err');

    const email = document.getElementById('forgotEmail').value;
    showMsg('Enviando link de recuperação...', 'ok');

    // Manda o e-mail e redireciona de volta para o seu site no GitHub Pages
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.href,
    });

    if (error) {
        showMsg(`Erro: ${error.message}`, 'err');
    } else {
        showMsg('E-mail enviado! Verifique sua caixa de entrada ou spam.', 'ok');
        document.getElementById('forgotEmail').value = '';
    }
}

async function doLogout() {
    if (supabase) await supabase.auth.signOut();
    appScreen.classList.remove('grid');
    appScreen.classList.add('hidden');
    authScreen.classList.remove('hidden');
    authScreen.classList.add('flex');
    switchView('login');
}

function showApp(user) {
    authScreen.classList.remove('flex');
    authScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    appScreen.classList.add('grid');

    document.getElementById('userName').textContent = user.user_metadata?.full_name || user.email;
    document.getElementById('userRole').textContent = user.user_metadata?.department || 'Geral';
}

// Expõe as funções para os formulários HTML
window.doLogin = doLogin;
window.doRegister = doRegister;
window.doRecover = doRecover;
window.doLogout = doLogout;
