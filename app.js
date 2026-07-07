// ====================== CONFIG SUPABASE ======================
const SUPABASE_URL = 'https://peqmqjlaypgwtscwpkot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcW1xamxheXBnd3RzY3dwa290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjcwODksImV4cCI6MjA5OTAwMzA4OX0.fllv67MNZHyOW6yH9HCZOS5Kbk-2N-GpY5bEMCbXkik';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ====================== TROCA DE TELAS ======================
function switchView(viewName) {
    const loginForm = document.getElementById('loginForm');
    const regForm = document.getElementById('regForm');

    loginForm.classList.add('hidden');
    regForm.classList.add('hidden');

    if (viewName === 'login') loginForm.classList.remove('hidden');
    if (viewName === 'register') regForm.classList.remove('hidden');
}

// ====================== MENSAGENS ======================
function showMsg(text, type = 'ok') {
    const msg = document.getElementById('sysMsg');
    if (!msg) return;
    msg.textContent = text;
    msg.className = `mb-6 p-4 rounded-2xl text-sm ${type === 'err' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`;
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 6000);
}

// ====================== AUTH ======================
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        showApp(session.user);
    } else if (event === 'SIGNED_OUT') {
        document.getElementById('appScreen').classList.add('hidden');
        document.getElementById('authScreen').classList.remove('hidden');
        switchView('login');
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

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email, 
        password,
        options: { data: { full_name: name } }
    });

    if (authError) {
        showMsg(authError.message, 'err');
        return;
    }

    // Salvar na tabela registros
    await supabase.from('registros').insert([{
        chave: email,
        valor: {
            nome_completo: name,
            data_criacao: new Date().toISOString()
        }
    }]);

    showMsg('Conta criada! Faça login.', 'ok');
    switchView('login');
}

async function doLogout() {
    await supabase.auth.signOut();
}

function showApp(user) {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    document.getElementById('userName').textContent = user.user_metadata?.full_name || user.email;
    loadTable();
}

// ====================== TABLE EDITOR ======================
async function loadTable() {
    const { data, error } = await supabase.from('registros').select('*').order('chave');
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (error) return showMsg('Erro ao carregar dados', 'err');

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-12 text-gray-500">Nenhum registro encontrado</td></tr>`;
        return;
    }

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'table-row border-b border-[#2A3A35]';
        tr.innerHTML = `
            <td class="p-4 font-mono text-emerald-400">${row.chave}</td>
            <td class="p-4">
                <pre class="text-xs bg-[#252B28] p-3 rounded-xl overflow-auto">${JSON.stringify(row.valor, null, 2)}</pre>
            </td>
            <td class="p-4 text-center">
                <button onclick="deleteRow('${row.chave}')" class="text-red-400 hover:text-red-500">
                    <i class='bx bx-trash text-xl'></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function insertNewRow() {
    const chave = prompt("Digite a chave (ex: email do aluno):");
    if (!chave) return;

    const jsonStr = prompt("Digite o JSON do valor:", '{"nome": "", "turma": ""}');
    let valor;
    try { valor = JSON.parse(jsonStr); } 
    catch { return showMsg("JSON inválido!", 'err'); }

    const { error } = await supabase.from('registros').insert([{ chave, valor }]);
    if (error) showMsg(error.message, 'err');
    else {
        showMsg('Registro adicionado!');
        loadTable();
    }
}

async function deleteRow(chave) {
    if (!confirm(`Excluir o registro "${chave}"?`)) return;
    const { error } = await supabase.from('registros').delete().eq('chave', chave);
    if (error) showMsg(error.message, 'err');
    else loadTable();
}

// Inicialização
window.onload = () => {
    switchView('login');
};
