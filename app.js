// ====================== CONFIG SUPABASE ======================
const SUPABASE_URL = 'https://peqmqjlaypgwtscwpkot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcW1xamxheXBnd3RzY3dwa290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjcwODksImV4cCI6MjA5OTAwMzA4OX0.fllv67MNZHyOW6yH9HCZOS5Kbk-2N-GpY5bEMCbXkik';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ====================== SWITCH VIEWS ======================
function switchView(view) {
    document.querySelectorAll('#loginForm, #regForm').forEach(f => f.classList.add('hidden'));
    if (view === 'login') document.getElementById('loginForm').classList.remove('hidden');
    if (view === 'register') document.getElementById('regForm').classList.remove('hidden');
}

// ====================== MENSAGENS ======================
function showMsg(text, type = 'ok') {
    const msg = document.getElementById('sysMsg');
    msg.textContent = text;
    msg.className = `p-4 rounded-2xl text-sm ${type === 'err' ? 'bg-red-900/50 text-red-300' : 'bg-emerald-900/50 text-emerald-300'}`;
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 5000);
}

// ====================== AUTH ======================
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
    // ... (seu código de registro atual)
    // (pode manter o que você já tinha)
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
    const { data, error } = await supabase
        .from('registros')
        .select('*')
        .order('chave');

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (error) {
        showMsg('Erro ao carregar tabela', 'err');
        return;
    }

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-12 text-gray-500">Tabela vazia</td></tr>`;
        return;
    }

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'table-row border-b border-[#2A3A35] hover:bg-[#1F2522]';
        tr.innerHTML = `
            <td class="p-4 font-mono text-emerald-400">${row.chave}</td>
            <td class="p-4">
                <pre class="text-xs bg-[#252B28] p-3 rounded-xl overflow-auto max-h-32">${JSON.stringify(row.valor, null, 2)}</pre>
            </td>
            <td class="p-4 text-center">
                <button onclick="deleteRow('${row.chave}')" class="text-red-400 hover:text-red-500">
                    <i class='bx bx-trash'></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function insertNewRow() {
    const chave = prompt("Digite a chave (geralmente o e-mail):");
    if (!chave) return;

    const valorStr = prompt("Digite o JSON do valor (ex: {\"nome\": \"João\"}):", '{}');
    let valor;
    try {
        valor = JSON.parse(valorStr);
    } catch {
        showMsg("JSON inválido", 'err');
        return;
    }

    const { error } = await supabase
        .from('registros')
        .insert([{ chave, valor }]);

    if (error) showMsg(error.message, 'err');
    else {
        showMsg('Registro inserido com sucesso!');
        loadTable();
    }
}

async function deleteRow(chave) {
    if (!confirm(`Excluir registro "${chave}"?`)) return;
    
    const { error } = await supabase
        .from('registros')
        .delete()
        .eq('chave', chave);

    if (error) showMsg(error.message, 'err');
    else loadTable();
}

// Inicialização
window.onload = () => {
    switchView('login');
};
