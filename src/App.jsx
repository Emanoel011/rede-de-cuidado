import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  // Estados de Sessão e Telas
  const [user, setUser] = useState(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  // Estados dos Formulários
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('pedagoga');

  // Estado para Mensagens de Feedback
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Monitorar alterações de autenticação
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // Função de Cadastro
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) return handleMsg('Preencha todos os campos.', 'err');
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          department: department
        }
      }
    });

    setLoading(false);
    if (error) {
      handleMsg(`Erro: ${error.message}`, 'err');
    } else {
      handleMsg('Cadastro realizado! Confirme o e-mail ou realize o login.', 'ok');
      setIsRegisterMode(false);
    }
  };

  // Função de Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return handleMsg('Preencha e-mail e senha.', 'err');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    setLoading(false);
    if (error) {
      handleMsg('Credenciais inválidas.', 'err');
    } else {
      handleMsg('Login efetuado com sucesso!', 'ok');
    }
  };

  // Função de Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('dashboard');
  };

  // --- COMPONENTE DE AUTENTICAÇÃO ---
  if (!user) {
    return (
      <div class="min-h-screen flex items-center justify-center p-6 bg-[#F4F7F6]">
        <div class="w-full max-w-[960px] bg-white rounded-[24px] grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-lg border border-[#E2E8E5]">
          
          {/* Lado Esquerdo Informativo */}
          <div class="bg-gradient-to-br from-[#1A5444] to-[#2A7A64] text-white p-12 flex flex-col justify-between relative overflow-hidden hidden md:flex">
            <div class="absolute -right-20 -bottom-20 w-80 h-80 rounded-full border border-white/10"></div>
            <div class="absolute -left-10 -top-10 w-40 h-40 rounded-full border border-white/10"></div>
            <div class="relative z-10">
              <div class="text-sm tracking-widest uppercase font-semibold flex items-center gap-2">
                <i class='bx bx-hive'></i> Rede de Cuidado
              </div>
              <h1 class="text-4xl font-semibold leading-tight my-6 font-fraunces">Um só histórico,<br />toda a equipe.</h1>
              <p class="text-sm text-white/90 leading-relaxed max-w-[90%]">Prontuário eletrônico escolar integrado. Compartilhe dados, encaminhe alunos e acompanhe a evolução de cada caso em tempo real.</p>
            </div>
          </div>

          {/* Lado Direito - Formulários */}
          <div class="p-12 flex flex-col justify-center">
            {message.text && (
              <div class={`p-4 rounded-xl text-sm font-medium mb-4 flex items-center gap-2 ${message.type === 'err' ? 'bg-[#FDF0ED] text-[#C0472B] border border-[#F1C9BC]' : 'bg-[#EAF6F0] text-[#1A5444] border border-[#C7E5D5]'}`}>
                {message.text}
              </div>
            )}

            {!isRegisterMode ? (
              <form onSubmit={handleLogin} class="flex flex-col">
                <h2 class="text-3xl font-fraunces mb-2 text-[#1F2E2B]">Acesso ao Painel</h2>
                <div class="text-[#63736E] text-sm mb-6">Entre com suas credenciais para visualizar os prontuários.</div>
                
                <div class="mb-4">
                  <label class="block text-xs font-semibold text-[#63736E] mb-2">E-mail Institucional</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemplo@escola.edu.br" class="w-full p-3 border-1.5 border-[#E2E8E5] rounded-xl bg-[#FAFCFB] outline-none focus:border-[#2A7A64] focus:ring-4 focus:ring-[#E8F2EF] transition-all" />
                </div>

                <div class="mb-6">
                  <label class="block text-xs font-semibold text-[#63736E] mb-2">Senha</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" class="w-full p-3 border-1.5 border-[#E2E8E5] rounded-xl bg-[#FAFCFB] outline-none focus:border-[#2A7A64] focus:ring-4 focus:ring-[#E8F2EF] transition-all" />
                </div>

                <button type="submit" disabled={loading} class="bg-[#2A7A64] hover:bg-[#1A5444] text-white p-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50">
                  {loading ? 'Entrando...' : 'Entrar no Sistema'} <i class='bx bx-right-arrow-alt'></i>
                </button>
                <div class="mt-6 text-sm text-center text-[#63736E]">Primeiro acesso? <a onClick={() => { setIsRegisterMode(true); setMessage({text:'', type:''}); }} class="text-[#2A7A64] font-semibold cursor-pointer hover:underline">Cadastre sua função</a></div>
              </form>
            ) : (
              <form onSubmit={handleRegister} class="flex flex-col">
                <h2 class="text-3xl font-fraunces mb-2 text-[#1F2E2B]">Criar Cadastro</h2>
                <div class="text-[#63736E] text-sm mb-6">Identifique-se para atuar na rede de cuidado.</div>

                <div class="mb-4">
                  <label class="block text-xs font-semibold text-[#63736E] mb-2">Nome Completo do Profissional</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ex: Ana Paula Silva" class="w-full p-3 border-1.5 border-[#E2E8E5] rounded-xl bg-[#FAFCFB] outline-none focus:border-[#2A7A64] focus:ring-4 focus:ring-[#E8F2EF] transition-all" />
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label class="block text-xs font-semibold text-[#63736E] mb-2">E-mail</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@escola.org" class="w-full p-3 border-1.5 border-[#E2E8E5] rounded-xl bg-[#FAFCFB] outline-none focus:border-[#2A7A64] focus:ring-4 focus:ring-[#E8F2EF] transition-all" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-[#63736E] mb-2">Senha</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mín. 6 caracteres" class="w-full p-3 border-1.5 border-[#E2E8E5] rounded-xl bg-[#FAFCFB] outline-none focus:border-[#2A7A64] focus:ring-4 focus:ring-[#E8F2EF] transition-all" />
                  </div>
                </div>

                <div class="mb-6">
                  <label class="block text-xs font-semibold text-[#63736E] mb-2">Seu Departamento de Atuação</label>
                  <select value={department} onChange={e => setDepartment(e.target.value)} class="w-full p-3 border-1.5 border-[#E2E8E5] rounded-xl bg-[#FAFCFB] outline-none focus:border-[#2A7A64] transition-all">
                    <option value="pedagoga">Pedagogia</option>
                    <option value="psicologa">Psicologia</option>
                    <option value="social">Serviço Social</option>
                    <option value="admin">Administração / Direção</option>
                  </select>
                </div>

                <button type="submit" disabled={loading} class="bg-[#2A7A64] hover:bg-[#1A5444] text-white p-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50">
                  {loading ? 'Criando conta...' : 'Criar Conta Profissional'} <i class='bx bx-check'></i>
                </button>
                <div class="mt-6 text-sm text-center text-[#63736E]">Já cadastrado? <a onClick={() => { setIsRegisterMode(false); setMessage({text:'', type:''}); }} class="text-[#2A7A64] font-semibold cursor-pointer hover:underline">Fazer Login</a></div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- COMPONENTE DA APLICAÇÃO INTERNA (LOGADO) ---
  return (
    <div class="h-screen grid grid-cols-[260px_1fr]">
      
      {/* Sidebar */}
      <div class="bg-[#1A5444] text-white p-8 flex flex-col justify-between z-10">
        <div>
          <div class="flex items-center gap-3.5 mb-12">
            <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1A5444] font-fraunces font-bold text-xl shadow-md">R</div>
            <div class="font-fraunces text-lg leading-tight">Rede de<br />Cuidado</div>
          </div>
          <nav class="flex flex-col gap-2">
            <a onClick={() => setCurrentView('dashboard')} class={`flex items-center gap-4 text-white/70 no-underline p-3.5 rounded-xl text-sm font-medium cursor-pointer transition-all hover:bg-white/15 hover:text-white ${currentView === 'dashboard' ? 'bg-white/15 text-white' : ''}`}>
              <i class='bx bx-grid-alt text-xl'></i> Painel Inicial
            </a>
            <a onClick={() => setCurrentView('alunos')} class={`flex items-center gap-4 text-white/70 no-underline p-3.5 rounded-xl text-sm font-medium cursor-pointer transition-all hover:bg-white/15 hover:text-white ${currentView === 'alunos' ? 'bg-white/15 text-white' : ''}`}>
              <i class='bx bx-user text-xl'></i> Cadastro de Alunos
            </a>
            <a onClick={() => setCurrentView('prontuarios')} class={`flex items-center gap-4 text-white/70 no-underline p-3.5 rounded-xl text-sm font-medium cursor-pointer transition-all hover:bg-white/15 hover:text-white ${currentView === 'prontuarios' ? 'bg-white/15 text-white' : ''}`}>
              <i class='bx bx-folder-open text-xl'></i> Todos os Prontuários
            </a>
          </nav>
        </div>

        <div class="pt-6 border-t border-white/10">
          <div class="text-[11px] text-white/60 mb-1">Profissional Logado:</div>
          <div class="font-semibold text-sm truncate">{user.user_metadata?.full_name || user.email}</div>
          <span class="inline-block mt-2 text-[10px] px-2.5 py-1 rounded-full bg-white/15 font-semibold uppercase tracking-wider">{user.user_metadata?.department || 'Geral'}</span>
          <button onClick={handleLogout} class="mt-4 bg-none border-none text-white/60 hover:text-white text-xs p-0 flex items-center gap-1.5 transition-all w-full cursor-pointer">
            <i class='bx bx-log-out'></i> Encerrar sessão segura
          </button>
        </div>
      </div>

      {/* Main Content Render Handler */}
      <main class="p-10 h-screen overflow-y-auto bg-[#F4F7F6]">
        {currentView === 'dashboard' && (
          <div>
            <div class="flex justify-between items-center mb-8 gap-4 flex-wrap">
              <div>
                <h1 class="text-3xl font-fraunces font-semibold text-[#1A5444] mb-1">Bom dia!</h1>
                <div class="text-[#63736E] text-sm">Resumo das atividades e encaminhamentos da sua equipe.</div>
              </div>
              <button class="bg-[#2A7A64] hover:bg-[#1A5444] text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all transform hover:-translate-y-0.5">
                <i class='bx bx-plus'></i> Abrir Novo Prontuário
              </button>
            </div>

            {/* Cards Operacionais de Exemplo */}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div class="bg-white border border-[#E2E8E5] rounded-2xl p-6 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl bg-[#E8F2EF] text-[#1A5444]"><i class='bx bx-group'></i></div>
                <div>
                  <div class="text-xs text-[#63736E] font-medium mb-1">Alunos na Base</div>
                  <div class="text-3xl font-bold font-fraunces text-[#1A5444]">342</div>
                </div>
              </div>
              <div class="bg-white border border-[#E2E8E5] rounded-2xl p-6 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl bg-[#FCF4E8] text-[#D4892A]"><i class='bx bx-folder'></i></div>
                <div>
                  <div class="text-xs text-[#63736E] font-medium mb-1">Casos Ativos</div>
                  <div class="text-3xl font-bold font-fraunces text-[#1A5444]">12</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'alunos' && (
          <div>
            <h1 class="text-3xl font-fraunces font-semibold text-[#1A5444] mb-2">Cadastro de Alunos</h1>
            <p class="text-[#63736E] text-sm mb-6">Base de dados integrada para abertura e acompanhamento de prontuários.</p>
            <div class="bg-white p-8 rounded-2xl border border-[#E2E8E5] text-center text-[#63736E]">
              <i class='bx bx-user-x text-5xl text-gray-300 block mb-3'></i>
              Nenhum aluno selecionado ou cadastrado no momento.
            </div>
          </div>
        )}

        {currentView === 'prontuarios' && (
          <div>
            <h1 class="text-3xl font-fraunces font-semibold text-[#1A5444] mb-2">Histórico de Prontuários</h1>
            <p class="text-[#63736E] text-sm mb-6">Todos os registros médicos e psicossociais unificados por aluno.</p>
            <div class="bg-white p-8 rounded-2xl border border-[#E2E8E5] text-center text-[#63736E]">
              <i class='bx bx-folder-minus text-5xl text-gray-300 block mb-3'></i>
              Nenhum prontuário ativo encontrado para este setor.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
