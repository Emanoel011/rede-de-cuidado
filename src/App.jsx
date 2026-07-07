import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [user, setUser] = useState(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('pedagoga');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Se o Supabase não estiver configurado com uma URL válida, não tenta buscar sessão
    if (!supabase) {
      handleMsg('Erro: Configure a URL do Supabase no arquivo supabaseClient.js', 'err');
      return;
    }

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

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!supabase) return handleMsg('Supabase não configurado.', 'err');
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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) return handleMsg('Supabase não configurado.', 'err');
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

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setCurrentView('dashboard');
  };

  // --- TELA DE LOGIN / REGISTRO ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F4F7F6]">
        <div className="w-full max-w-[960px] bg-white rounded-[24px] grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-lg border border-[#E2E8E5]">
          
          <div className="bg-gradient-to-br from-[#1A5444] to-[#2A7A64] text-white p-12 flex flex-col justify-between relative overflow-hidden hidden md:flex">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full border border-white/10"></div>
            <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full border border-white/10"></div>
            <div className="relative z-10">
              <div className="text-sm tracking-widest uppercase font-semibold flex items-center gap-2">
                <i className='bx bx-hive'></i> Rede de Cuidado
              </div>
              <h1 className="text-4xl font-semibold leading-tight my-6 font-fraunces">Um só histórico,<br />toda a equipe.</h1>
              <p className="text-sm text-white/90 leading-relaxed max-w-[90%]">Prontuário eletrônico escolar integrado. Compartilhe dados, encaminhe alunos e acompanhe a evolução de cada caso em tempo real.</p>
            </div>
          </div>

          <div className="p-12 flex flex-col justify-center">
            {message.text && (
              <div className={`p-4 rounded-xl text-sm font-medium mb-4 flex items-center gap-2 ${message.type === 'err' ? 'bg-[#FDF0ED] text-[#C0472B] border border-[#F1C9BC]' : 'bg-[#EAF6F0] text-[#1A5444] border border-[#C7E5D5]'}`}>
                {message.text}
              </div>
            )}

            {!isRegisterMode ? (
              <form onSubmit={handleLogin} className="flex flex-col">
                <h2 className="text-3xl font-fraunces mb-2 text-[#1F2E2B]">Acesso ao Painel</h2>
                <div className="text-[#63736E] text-sm mb-6">Entre com suas credenciais para visualizar os prontuários.</div>
                
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#63736E] mb-2">E-mail Institucional</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemplo@escola.edu.br" className="w-full p-3 border-1.5 border-[#E2E8E5] rounded-xl bg-[#FAFCFB] outline-none focus:border-[#2A7A64] focus:ring-4 focus:ring-[#E8F2EF] transition-all" />
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-[#63736E] mb-2">Senha</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-3 border-1.5 border-[#E2E8E5] rounded-xl bg-[#FAFCFB] outline-none focus:border-[#2A7A64] focus:ring-4 focus:ring-[#E8F2EF] transition-all" />
                </div>

                <button type="submit" disabled={loading} className="bg-[#2A7A64] hover:bg-[#1A5444] text-white p-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50">
                  {loading ? 'Entrando...' : 'Entrar no Sistema'} <i className='bx bx-right-arrow-alt'></i>
                </button>
                <div className="mt-6 text-sm text-center text-[#63736E]">Primeiro acesso? <a onClick={() => { setIsRegisterMode(true); setMessage({text:'', type:''}); }} className="text-[#2A7A64] font-semibold cursor-pointer hover:underline">Cadastre sua função</a></div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col">
                <h2 className="text-3xl font-fraunces mb-2 text-[#1F2E2B]">Criar Cadastro</h2>
                <div className="text-[#63736E] text-sm mb-6">Identifique-se para atuar na rede de cuidado.</div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#63736E] mb-2">Nome Completo do Profissional</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ex: Ana Paula Silva" className="w-full p-3 border-1.5 border-[#E2E8E5] rounded-xl bg-[#FAFCFB] outline-none focus:border-[#2A7A64] focus:ring-4 focus:ring-[#E8F2EF] transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#63736E] mb-2">E-mail</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@escola.org" className="w-full p-3 border-1.5 border-[#E2E8E5] rounded-xl bg-[#FAFCFB] outline-none focus:border-[#2A7A64] focus:ring-4 focus:ring-[#E8F2EF] transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#63736E] mb-2">Senha</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mín. 6 caracteres" className="w-full p-3 border-1.5 border-[#E2E8E5] rounded-xl bg-[#FAFCFB] outline-none focus:border-[#2A7A64] focus:ring-4 focus:ring-[#E8F2EF] transition-all" />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-[#63736E] mb-2">Seu Departamento de Atuação</label>
                  <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full p-3 border-1.5 border-[#E2E8E5] rounded-xl bg-[#FAFCFB] outline-none focus:border-[#2A7A64] transition-all">
                    <option value="pedagoga">Pedagogia</option>
                    <option value="psicologa">Psicologia</option>
                    <option value="social">Serviço Social</option>
                    <option value="admin">Administração / Direção</option>
                  </select>
                </div>

                <button type="submit" disabled={loading} className="bg-[#2A7A64] hover:bg-[#1A5444] text-white p-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-50">
                  {loading ? 'Criando conta...' : 'Criar Conta Profissional'} <i className='bx bx-check'></i>
                </button>
                <div className="mt-6 text-sm text-center text-[#63736E]">Já cadastrado? <a onClick={() => { setIsRegisterMode(false); setMessage({text:'', type:''}); }} className="text-[#2A7A64] font-semibold cursor-pointer hover:underline">Fazer Login</a></div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- TELA DO PAINEL (LOGADO) ---
  return (
    <div className="h-screen grid grid-cols-[260px_1fr]">
      <div className="bg-[#1A5444] text-white p-8 flex flex-col justify-between z-10">
        <div>
          <div className="flex items-center gap-3.5 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1A5444] font-fraunces font-bold text-xl shadow-md">R</div>
            <div className="font-fraunces text-lg leading-tight">Rede de<br />Cuidado</div>
          </div>
          <nav className="flex flex-col gap-2">
            <a onClick={() => setCurrentView('dashboard')} className={`flex items-center gap-4 text-white/70 no-underline p-3.5 rounded-xl text-sm font-medium cursor-pointer transition-all hover:bg-white/15 hover:text-white ${currentView === 'dashboard' ? 'bg-white/15 text-white' : ''}`}>
              <i className='bx bx-grid-alt text-xl'></i> Painel Inicial
            </a>
            <a onClick={() => setCurrentView('alunos')} className={`flex items-center gap-4 text-white/70 no-underline p-3.5 rounded-xl text-sm font-medium cursor-pointer transition-all hover:bg-white/15 hover:text-white ${currentView === 'alunos' ? 'bg-white/15 text-white' : ''}`}>
              <i className='bx bx-user text-xl'></i> Cadastro de Alunos
            </a>
            <a onClick={() => setCurrentView('prontuarios')} className={`flex items-center gap-4 text-white/70 no-underline p-3.5 rounded-xl text-sm font-medium cursor-pointer transition-all hover:bg-white/15 hover:text-white ${currentView === 'prontuarios' ? 'bg-white/15 text-white' : ''}`}>
              <i className='bx bx-folder-open text-xl'></i> Todos os Prontuários
            </a>
          </nav>
        </div>

        <div className="pt-6 border-t border-white/10">
          <div className="text-[11px] text-white/60 mb-1">Profissional Logado:</div>
          <div className="font-semibold text-sm truncate">{user.user_metadata?.full_name || user.email}</div>
          <span className="inline-block mt-2 text-[10px] px-2.5 py-1 rounded-full bg-white/15 font-semibold uppercase tracking-wider">{user.user_metadata?.department || 'Geral'}</span>
          <button onClick={handleLogout} className="mt-4 bg-none border-none text-white/60 hover:text-white text-xs p-0 flex items-center gap-1.5 transition-all w-full cursor-pointer">
            <i className='bx bx-log-out'></i> Encerrar sessão
          </button>
        </div>
      </div>

      <main className="p-10 h-screen overflow-y-auto bg-[#F4F7F6]">
        {currentView === 'dashboard' && (
          <div>
            <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-fraunces font-semibold text-[#1A5444] mb-1">Bom dia!</h1>
                <div className="text-[#63736E] text-sm">Resumo das atividades da sua equipe.</div>
              </div>
              <button className="bg-[#2A7A64] hover:bg-[#1A5444] text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all transform hover:-translate-y-0.5">
                <i className='bx bx-plus'></i> Abrir Novo Prontuário
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border border-[#E2E8E5] rounded-2xl p-6 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl bg-[#E8F2EF] text-[#1A5444]"><i className='bx bx-group'></i></div>
                <div>
                  <div className="text-xs text-[#63736E] font-medium mb-1">Alunos na Base</div>
                  <div className="text-3xl font-bold font-fraunces text-[#1A5444]">342</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
