// app.js

// 1. Inicializar o Supabase (Pegue essas chaves no painel do seu projeto no Supabase)
const supabaseUrl = 'SUA_URL_DO_SUPABASE_AQUI';
const supabaseKey = 'SUA_CHAVE_ANON_PUBLICA_AQUI';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Elementos de Mensagem
const regMsg = document.getElementById('regMsg');
const loginMsg = document.getElementById('loginMsg');

// 2. Função de Cadastro (Registro no Banco)
async function doRegister() {
    const nome = document.getElementById('regNome').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;
    const papel = document.getElementById('regPapel').value;

    if (!nome || !email || !password) {
        showMsg(regMsg, 'Preencha todos os campos.', 'err');
        return;
    }

    // Criar usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: nome,
                department: papel
            }
        }
    });

    if (error) {
        showMsg(regMsg, `Erro: ${error.message}`, 'err');
    } else {
        showMsg(regMsg, 'Cadastro realizado! Verifique seu e-mail ou faça login.', 'ok');
        // Opcional: limpar os campos após sucesso
    }
}

// 3. Função de Login
async function doLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;

    if (!email || !password) {
        showMsg(loginMsg, 'Preencha e-mail e senha.', 'err');
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        showMsg(loginMsg, 'Credenciais inválidas.', 'err');
    } else {
        showMsg(loginMsg, 'Login com sucesso! Carregando painel...', 'ok');
        
        // Aqui você chamaria a lógica para esconder a tela de login e mostrar o .app
        document.getElementById('authWrap').style.display = 'none';
        document.getElementById('app').classList.add('show');
        
        // Exemplo: Atualizar o nome na sidebar
        document.getElementById('sideName').textContent = data.user.user_metadata.full_name;
        document.getElementById('sideRole').textContent = data.user.user_metadata.department;
    }
}

// Função utilitária para exibir mensagens
function showMsg(element, text, type) {
    element.textContent = text;
    element.className = `msg-box ${type}`; // 'err' ou 'ok'
    element.style.display = 'flex';
}
