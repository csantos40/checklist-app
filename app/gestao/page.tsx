'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginGestao() {
  const [password, setPassword] = useState('');
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
              alt="Logo Vivian" 
              className="h-full w-auto object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <h1 className="text-3xl font-black text-black uppercase mb-2 tracking-tighter italic">GESTÃO VIVIAN</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">PAINEL DE CONTROLE E AUDITORIA</p>
        </div>
        
        <input 
          type="password" 
          placeholder="SENHA DE ACESSO" 
          className="w-full p-5 bg-slate-50 border-2 border-indigo-600 rounded-2xl text-center font-bold text-black text-2xl mb-6 outline-none shadow-inner" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        
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