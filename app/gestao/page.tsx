'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginGestao() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [supabase, setSupabase] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      const client = window.supabase.createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
      setSupabase(client);
    };
    document.body.appendChild(script);
  }, []);

  const handleLogin = () => {
    // 🔐 Lógica de acesso centralizada para a Dashboard
    if (password === 'gestao123') { 
      localStorage.setItem('user_auth', 'direcao'); // Define a permissão
      router.push('/dashboard'); // Redireciona para a dashboard unificada
    } else {
      alert('Senha Administrativa Incorreta!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 italic">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border-t-8 border-indigo-600 text-center text-slate-900 font-black uppercase">
        
        {/* 🚀 LOGO */}
        <div className="mb-8 flex flex-col items-center">
          <div className="h-20 mb-6">
            <img 
              src="/logo.png" 
              alt="Logo Check Store" 
              className="h-full w-auto object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <h1 className="text-3xl font-black text-black uppercase mb-2 tracking-tighter italic">GESTÃO CHECK STORE</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">PAINEL DE CONTROLE E AUDITORIA</p>
        </div>
        
        {/* 🚀 INPUT DE SENHA COM ÍCONE */}
        <div className="relative w-full mb-6">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="SENHA DE ACESSO" 
            className="w-full p-5 bg-slate-50 border-2 border-indigo-600 rounded-2xl text-center font-bold text-black text-2xl outline-none shadow-inner pr-16" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute right-5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center w-10 h-10"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-slate-800">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-slate-800">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            )}
          </button>
        </div>
        
        <button 
          onClick={handleLogin}
          className="w-full bg-black text-white font-black py-5 rounded-2xl uppercase hover:bg-indigo-700 transition-all shadow-xl active:scale-95 italic"
        >
          ENTRAR NO DASHBOARD
        </button>
      </div>
    </div>
  );
}