// Chaves de conexão inseridas corretamente
const SUPABASE_URL = 'https://peqmqjlaypgwtscwpkot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcW1xamxheXBnd3RzY3dwa290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjcwODksImV4cCI6MjA5OTAwMzA4OX0.fllv67MNZHyOW6yH9HCZOS5Kbk-2N-GpY5bEMCbXkik';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elementos da Interface
const authScreen = document.getElementById('authScreen');
const appScreen = document.getElementById('appScreen');
const sysMsg = document.getElementById('sysMsg');

const loginForm = document.getElementById('loginForm');
const regForm = document.getElementById('regForm');
const recoverForm = document.getElementById('recoverForm');
const newPasswordForm = document.getElementById('newPasswordForm');

// Sistema de Troca de Telas (agora vai funcionar porque o script não vai quebrar no topo)
function switchView(viewName) {
    loginForm.classList.add('hidden');
    regForm.classList.add('hidden');
    recoverForm.classList.add('hidden');
    newPasswordForm.classList.add('hidden');
    sysMsg.style.display = 'none';

    if (viewName === 'login') loginForm.classList.remove('hidden');
    if (viewName === 'register') regForm.classList.remove('hidden');
    if (viewName === 'recover') recoverForm.classList.remove('hidden');
    if (viewName === 'newPassword') newPasswordForm.classList.remove('hidden');
}

function showMsg(text, type) {
    sysMsg.textContent = text;
    sysMsg.className = `p-4 rounded-xl text-sm font-medium mb-4 flex items-center gap-2 ${type === 'err' ? 'bg-[#FDF0ED] text-[#C0472B] border border-[#F1C9BC]' : 'bg-[#EAF6F0] text-[#1A5444] border border-[#C7E5D5]'}`;
    sysMsg.style.display = 'flex';
}

// Monitoramento de Sessão
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
        switchView('newPassword');
        showMsg('Pronto! Agora digite sua nova senha.', 'ok');
    } else if (event === 'SIGNED_IN' && !newPasswordForm.classList.contains('hidden')) {
        return; 
    } else if (event === 'SIGNED_IN') {
        showApp(session.user);
    } else if (event === 'SIGNED_OUT') {
        appScreen.classList.remove('grid');
        appScreen.classList.add('hidden');
        authScreen.classList.remove('hidden');
        authScreen.classList.add('flex');
        switchView('login');
    }
});

// LOGIN
async function doLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) showMsg('E-mail ou senha inválidos.', 'err');
}

// CADASTRO + SALVAR NA TABELA "registros"
async function doRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;
    const role = document.getElementById('regRole').value;

    // Passo 1: Criar a autenticação do usuário
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name, department: role } }
    });

    if (authError) {
        showMsg(authError.message, 'err');
        return; // Para o código aqui se der erro
    }

    // Passo 2: Inserir as informações extras na sua tabela "registros"
    // Usamos o e-mail como "chave" e um objeto JSON como "valor"
    const { error: dbError } = await supabase
        .from('registros')
        .insert([
            {
                chave: email, 
                valor: {
                    nome_completo: name,
                    departamento: role,
                    data_criacao: new Date().toISOString(),
                    permissoes: "padrao"
                }
            }
        ]);

    if (dbError) {
        showMsg('Conta criada, mas erro ao salvar dados extras: ' + dbError.message, 'err');
    } else {
        showMsg('Cadastro criado com sucesso! Faça login.', 'ok');
        switchView('login');
    }
}

// RECUPERAR SENHA
async function doRecover(e) {
    e.preventDefault();
    const email = document.getElementById('recoverEmail').value;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.href
    });
    
    if (error) showMsg(error.message, 'err');
    else {
        showMsg('Link de recuperação enviado para o seu e-mail!', 'ok');
        document.getElementById('recoverEmail').value = '';
    }
}

// ATUALIZAR SENHA
async function doUpdatePassword(e) {
    e.preventDefault();
    const newPassword = document.getElementById('newPass').value;
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) showMsg(error.message, 'err');
    else {
        showMsg('Senha atualizada com sucesso! Faça login.', 'ok');
        switchView('login');
    }
}

// LOGOUT
async function doLogout() {
    await supabase.auth.signOut();
}

// MOSTRAR TELA DO SISTEMA
function showApp(user) {
    authScreen.classList.remove('flex');
    authScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    appScreen.classList.add('grid');

    document.getElementById('userName').textContent = user.user_metadata?.full_name || user.email;
    document.getElementById('userRole').textContent = user.user_metadata?.department || 'Geral';
}
