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
    // Avisa na tela se o Supabase está ausente ou usando dados de exemplo
    if (!supabase) {
      handleMsg('Aviso: Insira os dados reais do seu banco no arquivo supabaseClient.js para ativar o login.', 'err');
      return;
    }

    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      handleMsg(`Erro de inicialização: ${error.message}`, 'err');
    }
  }, []);

  const handleMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 7000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!supabase) return handleMsg('Banco de dados não conectado.', 'err');
    if (!fullName || !email || !password) return handleMsg('Preencha todos os campos.', 'err');
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, department } }
    });

    setLoading(false);
    if (error) handleMsg(`Erro: ${error.message}`, 'err');
    else {
      handleMsg('Cadastro realizado com sucesso!', 'ok');
      setIsRegisterMode(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!supabase) return handleMsg('Banco de dados não conectado.', 'err');
    if (!email || !password) return handleMsg('Preencha e-mail e senha.', 'err');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    
    if (error) handleMsg('Credenciais inválidas.', 'err');
    else handleMsg('Login efetuado!', 'ok');
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setCurrentView('dashboard');
  };

  // Renderiza a interface mesmo sem usuário (assim a tela nunca fica branca)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F4F7F6]">
        <div className="w-full max-w-[960px] bg-white rounded-[24px] grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-lg border border-[#E2E8E5]">
          
          <div className="bg-gradient-to-br from-[#1A5444] to-[#2A7A64] text-white p-12 flex flex-col justify-between relative overflow-hidden hidden md:flex">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full border border-white/10"></div>
            <div className="relative z-10">
              <div className="text-sm tracking-widest uppercase font-semibold flex items-center gap-2">
                <i className='bx bx-hive'></i> Rede de Cuidado
              </div>
              <h1 className="text-4xl font-semibold leading-tight my-6 font-fraunces">Um só histórico,<br />toda a equipe.</h1>
              <p className="text-sm text-white/90 leading-relaxed">Prontuário eletrônico escolar integrado.</p>
            </div>
          </div>

          <div className="p-12 flex flex-col justify-center">
            {message.text && (
              <div className={`p-4 rounded-xl text-sm font-medium mb-4 ${message.type === 'err' ? 'bg-[#FDF0ED] text-[#C0472B] border border-[#F1C9BC]' : 'bg-[#EAF6F0] text-[#1A5444] border border-[#C7E5D5]'}`}>
                {message.text}
              </div>
            )}

            {!isRegisterMode ? (
              <form onSubmit={handleLogin} className="flex flex-col">
                <h2 className="text-3xl font-fraunces mb-2 text-[#1F2E2B]">Acesso ao Painel</h2>
                <div className="text-[#63736E] text-sm mb-6">Entre com suas credenciais.</div>
                
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#63736E] mb-2">E-mail Institucional</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="exemplo@escola.edu.br" className="w-full p-3 border border-[#E2E8E5] rounded-xl bg-[#FAFCFB] outline-none" />
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-[#63736E] mb-2">Senha</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-3 border border-[#E2E8E5] rounded-xl bg-[#FAFCFB] outline-none" />
                </div>

                <button type="submit" disabled={loading} className="bg-[#2A7A64] hover:bg-[#1A5444] text-white p-3.5 rounded-xl font-semibold transition-all">
                  {loading ? 'Entrando...' : 'Entrar no Sistema'}
                </button>
                <div className="mt-6 text-sm text-center text-[#63736E]">Primeiro acesso? <a onClick={() => setIsRegisterMode(true)} className="text-[#2A7A64] font-semibold cursor-pointer hover:underline">Cadastre sua função</a></div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col">
                <h2 className="text-3xl font-fraunces mb-2 text-[#1F2E2B]">Criar Cadastro</h2>
                <div className="text-[#63736E] text-sm mb-6">Identifique-se na rede.</div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#63736E] mb-2">Nome Completo</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ex: Ana Paula" className="w-full p-3 border border-[#E2E8E5] rounded-xl bg-[#FAFCFB] outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#63736E] mb-2">E-mail</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-[#E2E8E5] rounded-xl bg-[#FAFCFB]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#63736E] mb-2">Senha</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-[#E2E8E5] rounded-xl bg-[#FAFCFB]" />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-[#63736E] mb-2">Departamento</label>
                  <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full p-3 border border-[#E2E8E5] rounded-xl bg-[#FAFCFB]">
                    <option value="pedagoga">Pedagogia</option>
                    <option value="psicologa">Psicologia</option>
                    <option value="social">Serviço Social</option>
                  </select>
                </div>

                <button type="submit" disabled={loading} className="bg-[#2A7A64] text-white p-3.5 rounded-xl font-semibold">
                  {loading ? 'Criando conta...' : 'Criar Conta'}
                </button>
                <div className="mt-6 text-sm text-center text-[#63736E]">Já cadastrado? <a onClick={() => setIsRegisterMode(false)} className="text-[#2A7A64] font-semibold cursor-pointer hover:underline">Fazer Login</a></div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen grid grid-cols-[260px_1fr]">
      <div className="bg-[#1A5444] text-white p-8 flex flex-col justify-between">
        <div>
          <div className="font-fraunces text-lg mb-8">Rede de Cuidado</div>
          <nav className="flex flex-col gap-2">
            <a onClick={() => setCurrentView('dashboard')} className="p-3.5 rounded-xl text-sm font-medium cursor-pointer block hover:bg-white/15">Painel Inicial</a>
          </nav>
        </div>
        <button onClick={handleLogout} className="text-white/60 hover:text-white text-xs text-left cursor-pointer">Sair</button>
      </div>
      <main className="p-10 bg-[#F4F7F6]">
        <h1 class="text-3xl font-fraunces text-[#1A5444]">Painel Inicial</h1>
      </main>
    </div>
  );
}
