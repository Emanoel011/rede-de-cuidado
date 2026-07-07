// 1. FUNÇÃO DE TROCA DE TELA NO TOPO ABSOLUTO (Garante o funcionamento dos cliques)
window.switchView = function(viewName) {
    const loginForm = document.getElementById('loginForm');
    const regForm = document.getElementById('regForm');
    const recoverForm = document.getElementById('recoverForm');
    const newPasswordForm = document.getElementById('newPasswordForm');
    const sysMsg = document.getElementById('sysMsg');

    // Oculta todos os formulários
    if (loginForm) loginForm.classList.add('hidden');
    if (regForm) regForm.classList.add('hidden');
    if (recoverForm) recoverForm.classList.add('hidden');
    if (newPasswordForm) newPasswordForm.classList.add('hidden');
    if (sysMsg) sysMsg.style.display = 'none';

    // Mostra apenas o formulário desejado
    if (viewName === 'login' && loginForm) loginForm.classList.remove('hidden');
    if (viewName === 'register' && regForm) regForm.classList.remove('hidden');
    if (viewName === 'recover' && recoverForm) recoverForm.classList.remove('hidden');
    if (viewName === 'newPassword' && newPasswordForm) newPasswordForm.classList.remove('hidden');
};

// 2. INICIALIZAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://peqmqjlaypgwtscwpkot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcW1xamxheXBnd3RzY3dwa290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjcwODksImV4cCI6MjA5OTAwMzA4OX0.fllv67MNZHyOW6yH9HCZOS5Kbk-2N-GpY5bEMCbXkik';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Funções Auxiliares de Mensagem
function showMsg(text, type) {
    const sysMsg = document.getElementById('sysMsg');
    if (!sysMsg) return;
    sysMsg.textContent = text;
    sysMsg.className = `p-4 rounded-xl text-sm font-medium mb-4 flex items-center gap-2 ${type === 'err' ? 'bg-[#FDF0ED] text-[#C0472B] border border-[#F1C9BC]' : 'bg-[#EAF6F0] text-[#1A5444] border border-[#C7E5D5]'}`;
    sysMsg.style.display = 'flex';
}

// 3. MONITOR DE SESSÃO INTELIGENTE (Não quebra mais a troca de telas)
supabase.auth.onAuthStateChange((event, session) => {
    const appScreen = document.getElementById('appScreen');
    const authScreen = document.getElementById('authScreen');
    const newPasswordForm = document.getElementById('newPasswordForm');

    if (event === 'PASSWORD_RECOVERY') {
        window.switchView('newPassword');
        showMsg('Pronto! Agora digite sua nova senha.', 'ok');
    } else if (event === 'SIGNED_IN') {
        // Só joga para o painel se não estiver alterando a senha
        if (newPasswordForm && newPasswordForm.classList.contains('hidden')) {
            showApp(session.user);
        }
    } else if (event === 'SIGNED_OUT') {
        // SÓ força o login se o usuário estava de fato dentro do painel (evita travar o cadastro)
        if (appScreen && !appScreen.classList.contains('hidden')) {
            appScreen.classList.remove('grid');
            appScreen.classList.add('hidden');
            if (authScreen) {
                authScreen.classList.remove('hidden');
                authScreen.classList.add('flex');
            }
            window.switchView('login');
        }
    }
});

// 4. ENVIO DO CADASTRO + BANCO DE DADOS (Tabela registros)
async function doRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;
    const role = document.getElementById('regRole').value;

    // Criar autenticação
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name, department: role } }
    });

    if (authError) {
        showMsg(authError.message, 'err');
        return;
    }

    // Salvar dados na tabela "registros"
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
        showMsg('Conta criada, mas erro ao salvar na tabela: ' + dbError.message, 'err');
    } else {
        showMsg('Cadastro criado com sucesso! Faça login.', 'ok');
        window.switchView('login');
    }
}

// 5. AUTENTICAÇÃO, RECUPERAÇÃO E LOGOUT
async function doLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) showMsg('E-mail ou senha inválidos.', 'err');
}

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

async function doUpdatePassword(e) {
    e.preventDefault();
    const newPassword = document.getElementById('newPass').value;
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) showMsg(error.message, 'err');
    else {
        showMsg('Senha atualizada com sucesso! Faça login.', 'ok');
        window.switchView('login');
    }
}

async function doLogout() {
    await supabase.auth.signOut();
}

function showApp(user) {
    const appScreen = document.getElementById('appScreen');
    const authScreen = document.getElementById('authScreen');
    
    if (authScreen) { authScreen.classList.remove('flex'); authScreen.classList.add('hidden'); }
    if (appScreen) { appScreen.classList.remove('hidden'); appScreen.classList.add('grid'); }

    const nameEl = document.getElementById('userName');
    const roleEl = document.getElementById('userRole');
    if (nameEl) nameEl.textContent = user.user_metadata?.full_name || user.email;
    if (roleEl) roleEl.textContent = user.user_metadata?.department || 'Geral';
}
