const SUPABASE_URL = 'https://peqmqjlaypgwtscwpkot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcW1xamxheXBnd3RzY3dwa290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjcwODksImV4cCI6MjA5OTAwMzA4OX0.fllv67MNZHyOW6yH9HCZOS5Kbk-2N-GpY5bEMCbXkik';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Troca de telas
function switchView(view) {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('regForm').classList.add('hidden');
    document.getElementById('recoverForm').classList.add('hidden');

    if (view === 'login') document.getElementById('loginForm').classList.remove('hidden');
    if (view === 'register') document.getElementById('regForm').classList.remove('hidden');
    if (view === 'recover') document.getElementById('recoverForm').classList.remove('hidden');
}

// Mensagem
function showMsg(text, type = 'ok') {
    const msg = document.getElementById('sysMsg');
    msg.textContent = text;
    msg.className = `mb-6 p-4 rounded-2xl text-sm ${type === 'err' ? 'bg-red-900/50 text-red-300' : 'bg-emerald-900/50 text-emerald-300'}`;
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 5000);
}

// Auth
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') showApp(session.user);
    if (event === 'SIGNED_OUT') {
        document.getElementById('appScreen').classList.add('hidden');
        document.getElementById('authScreen').classList.remove('hidden');
    }
});

async function doLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) showMsg(error.message, 'err');
}

async function doRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;

    const { error: authError } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: name } }
    });

    if (authError) return showMsg(authError.message, 'err');

    await supabase.from('registros').insert([{ chave: email, valor: { nome_completo: name, data_criacao: new Date().toISOString() } }]);
    showMsg('Conta criada com sucesso!', 'ok');
    switchView('login');
}

async function doRecover(e) {
    e.preventDefault();
    const email = document.getElementById('recoverEmail').value;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
    if (error) showMsg(error.message, 'err');
    else showMsg('Link de recuperação enviado para o e-mail!', 'ok');
}

async function doLogout() {
    await supabase.auth.signOut();
}

function showApp(user) {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    document.getElementById('userName').textContent = user.user_metadata?.full_name || user.email;
    showDashboard();
}

// Dashboard
function showDashboard() {
    document.getElementById('dashboardScreen').classList.remove('hidden');
    document.getElementById('tableScreen').classList.add('hidden');
}

// Table Editor
async function loadTable() {
    document.getElementById('dashboardScreen').classList.add('hidden');
    document.getElementById('tableScreen').classList.remove('hidden');

    const { data, error } = await supabase.from('registros').select('*').order('chave');
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (error) return showMsg('Erro ao carregar registros', 'err');
    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-12">Nenhum registro encontrado</td></tr>`;
        return;
    }

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'table-row border-b border-[#2A3A35]';
        tr.innerHTML = `
            <td class="p-4 font-mono">${row.chave}</td>
            <td class="p-4"><pre class="text-xs bg-[#252B28] p-3 rounded-xl">${JSON.stringify(row.valor, null, 2)}</pre></td>
            <td class="p-4 text-center">
                <button onclick="deleteRow('${row.chave}')" class="text-red-400 hover:text-red-500"><i class='bx bx-trash'></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function insertNewRow() {
    const chave = prompt("Chave (ex: email):");
    if (!chave) return;
    const json = prompt("Valor em JSON:", '{"nome": "Exemplo"}');
    try {
        const valor = JSON.parse(json);
        await supabase.from('registros').insert([{ chave, valor }]);
        showMsg('Registro adicionado!');
        loadTable();
    } catch { showMsg('JSON inválido', 'err'); }
}

async function deleteRow(chave) {
    if (confirm(`Excluir "${chave}"?`)) {
        await supabase.from('registros').delete().eq('chave', chave);
        loadTable();
    }
}

// Iniciar
window.onload = () => switchView('login');
